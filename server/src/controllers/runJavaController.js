import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

import { questions } from '../db/data.js';
import { addOrUpdateUser, insertNew } from '../db/mongooseClient.js';

const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || stdout);
            } else {
                resolve(stdout);
            }
        });
    });
};

export const runJava = async (req, res) => {

    const result = [];
    let output = null;

    const { quesid, javaCode, username, email } = req.body;
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

        for (const ques of questions) {
            if (ques.id == quesid) {

                // running the code for each input
                for (const [index, { input }] of ques.inputs.entries()) {

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
                            `docker run --rm --network none -v ${tempDir}:/app -w /app algojunction-java-executor sh -c "javac Solution.java 2>&1 && java Solution"`
                        );
                        console.log(`${new Date().toLocaleString()}: Code run done`);
                        result.push({ index, output, error: null, success: true });

                    } catch (error) {
                        console.log(`${new Date().toLocaleString()}: Code run failed with error: ${error}`);
                        result.push({ index, output: null, error, success: false });
                    }
                }

                const data = {
                    username,
                    quesid,
                    javaCode,
                    language: 'java',
                    status: { status: 'success', output: output, error: null },
                    result,
                    email
                }

                await handleDatabaseUpdates(data);

            }
        }

    } catch (error) {
        console.log(`${new Date().toLocaleString()}: Code execution failed with error: ${error}`);
        // fallback DB save on unexpected errors
        const data = {
            username,
            quesid,
            javaCode,
            language: 'java',
            status: { status: 'failed', output: null, error: error.message || String(error) },
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

        // todo: add email
        await addOrUpdateUser(username, email, submission_id);

    } catch (error) {
        console.log(`${new Date().toLocaleString()}: Database update failed with error: ${error}`);
        // todo: if this then rollback and send error message as response
    }
}
