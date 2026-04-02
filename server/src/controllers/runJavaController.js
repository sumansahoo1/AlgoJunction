import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

import { questions } from '../db/data.js';
import { addOrUpdateUser, insertNew } from '../db/mongooseClient.js';


const currDirectory = process.cwd();
const codeDirectory = path.join(currDirectory, "/src/execute/");
const inputDirectory = path.join(currDirectory, "/src/inputs/");
const dockerfile = path.join(currDirectory, "/src/docker/Dockerfile");

const executeCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
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

    const javaFileName = 'Solution.java';
    const javaFilePath = path.join(codeDirectory, javaFileName);

    try {
        await fs.writeFile(javaFilePath, javaCode, 'utf-8');
    } catch (writeError) {
        console.log(`${new Date().toLocaleString()}: Code run failed with error: ${writeError}`);
        return res.status(500).json({ error: writeError.message });
    }


    for (const ques of questions) {
        if (ques.id == quesid) {
            try {
                await executeCommand(`docker build -t your-image-name -f ${dockerfile} .`);
                console.log(`${new Date().toLocaleString()}: Image build done`);

                // running the code for each input/Dockerfile
                for (const [index, { input }] of ques.inputs.entries()) {

                    // copying the input to input file
                    const inputFilePath = path.join(inputDirectory, 'input.txt');
                    try {
                        await fs.writeFile(inputFilePath, input, 'utf-8');
                    } catch (writeError) {
                        console.log(`${new Date().toLocaleString()}: file write failed with error: ${writeError}`);
                        result.push({ index, output: null, error: writeError, success: false });
                        continue;
                    }

                    // running the code with input
                    try {
                        output = await executeCommand(`docker run -v ${inputDirectory}:/app/inputs -w /app --rm your-image-name`);
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


            } catch (error) {
                console.log(`${new Date().toLocaleString()}: docker image build failed with error: ${error}`);
                result.push({ index: null, output: null, error, success: false, builderror: true });

                const data = {
                    username,
                    quesid,
                    javaCode,
                    language: 'java',
                    status: { status: 'failed', output: null, error },
                    result,
                    email
                }

               await handleDatabaseUpdates(data);

            } finally {
                await executeCommand(`docker rmi your-image-name`).catch(() => { });
                console.log(`${new Date().toLocaleString()}: Image removed`);
            }
        }
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