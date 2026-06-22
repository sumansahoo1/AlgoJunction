import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

import { getQuestionByIdFromDB, addOrUpdateUser, insertNew, DBConnectionError } from '../db/mongooseClient.js';

const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ message: stderr || stdout || error.message, code: error.code });
            } else {
                resolve(stdout);
            }
        });
    });
};

export const runJava = async (req, res) => {

    const result = [];
    let output = null;

    const { quesid, javaCode } = req.body;
    const username = req.user.name;
    const email = req.user.email;
    console.log(`${new Date().toLocaleString()}: Executing code for question id:${quesid} by user:${username}`);

    if (!javaCode) {
        return res.status(400).json({ error: 'Missing or invalid javaCode in the request body' });
    } else if (!quesid) {
        return res.status(400).json({ error: 'Missing or invalid question id in the request body' });
    }

    const tempDir = path.join(process.cwd(), 'tmp', `algojunction-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const inputsDir = path.join(tempDir, 'inputs');

    try {
        await fs.mkdir(inputsDir, { recursive: true });
        await fs.writeFile(path.join(tempDir, 'Solution.java'), javaCode, 'utf-8');
        await fs.chmod(tempDir, 0o777);

        // Fetch the question from DB instead of scanning a static array
        const question = await getQuestionByIdFromDB(quesid);
        if (!question) {
            // Clean up temp dir before returning
            await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
            return res.status(404).json({ error: `Question with id ${quesid} not found` });
        }

        // running the code for each input
        for (const [index, { input, expectedOutput }] of question.inputs.entries()) {

            // copying the input to input file
            const inputFilePath = path.join(inputsDir, 'input.txt');
            try {
                await fs.writeFile(inputFilePath, input, 'utf-8');
            } catch (writeError) {
                console.log(`${new Date().toLocaleString()}: file write failed with error: ${writeError}`);
                result.push({ index, output: null, error: writeError, success: false });
                continue;
            }

            // compile and run the code with input in pre-built image
            try {
                output = await executeCommand(
                    `docker run --rm --network none --cpus="0.5" --memory="512m" --memory-swap="512m" --pids-limit="64" --read-only --tmpfs /tmp:rw,noexec,nosuid,size=128m --cap-drop=ALL --security-opt=no-new-privileges:true --ulimit nproc=64:64 --ulimit nofile=256:256 --ulimit fsize=104857600 --ulimit core=0:0 -v ${tempDir}:/app -w /app algojunction-java-executor sh -c "javac Solution.java 2>&1 && timeout --signal=KILL 10s java Solution"`
                );
                console.log(`${new Date().toLocaleString()}: Code run done`);
                const passed = String(output ?? '').trim() === String(expectedOutput ?? '').trim();
                result.push({ index, output: String(output ?? '').trim(), expectedOutput: String(expectedOutput ?? '').trim(), error: null, success: passed });

            } catch (error) {
                const exitCode = error?.code;
                const errMsg = error?.message || error;
                const userError = exitCode === 124 ? 'Time Limit Exceeded' :
                                  exitCode === 137 ? 'Memory Limit Exceeded' :
                                  errMsg;
                console.log(`${new Date().toLocaleString()}: Code run failed with error: ${errMsg} (exit code: ${exitCode})`);
                result.push({ index, output: null, error: userError, success: false });
            }
        }

        const allPassed = result.every(r => r.success === true);
        const overallStatus = allPassed ? 'accepted' : 'failed';
        const data = {
            username,
            quesid,
            javaCode,
            language: 'java',
            status: { status: overallStatus, output: output, error: null },
            result,
            email
        }

        await handleDatabaseUpdates(data);

    } catch (error) {
        const errMsg = error?.message || String(error);
        console.log(`${new Date().toLocaleString()}: Code execution failed with error: ${errMsg}`);
        // fallback DB save on unexpected errors
        const data = {
            username,
            quesid,
            javaCode,
            language: 'java',
            status: { status: 'failed', output: null, error: errMsg },
            result,
            email
        }
        await handleDatabaseUpdates(data);

    } finally {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => { });
        console.log(`${new Date().toLocaleString()}: Temp directory cleaned up`);
    }

    res.json(result);
};

const handleDatabaseUpdates = async ({ username, quesid, javaCode, language, status, result, email }) => {
    try {
        const submission_id = await insertNew(
            username,
            quesid,
            javaCode,
            language,
            status,
            result
        );

        await addOrUpdateUser(username, email, submission_id);

    } catch (error) {
        if (error instanceof DBConnectionError) {
            console.warn(`${new Date().toLocaleString()}: Database updates skipped — DB unavailable (${error.message})`);
            // No rollback needed — the data never reached the DB
        } else {
            console.error(`${new Date().toLocaleString()}: Database update failed:`, error);
            // If insertNew succeeded but addOrUpdateUser failed, we have a partial state.
            // TODO: implement compensation logic (delete the orphaned submission)
        }
    }
}
