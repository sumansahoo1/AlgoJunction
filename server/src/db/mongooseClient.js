import mongoose from 'mongoose';
import { Submission, User } from './schema/dbSchema.js';

export class DBConnectionError extends Error {
    constructor(message = 'Database connection is not available') {
        super(message);
        this.name = 'DBConnectionError';
    }
}

function ensureConnected() {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state !== 1) {
        const labels = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        throw new DBConnectionError(`Database is ${labels[state] || 'unknown'}. Cannot perform operation.`);
    }
}

export async function insertNew(userId, questionId, code, language, result, testCaseResults) {
    try {
        ensureConnected();
        const submissionTime = new Date();

        const submission = new Submission({
            userId,
            questionId,
            code,
            language,
            submissionTime,
            result,
            testCaseResults
        });

        const response = await submission.save();
        console.log(`${new Date().toLocaleString()}: Submission saved, id:`, response._id);
        return response._id;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error saving submission:', error);
        throw error;
    }
}

export async function addOrUpdateUser(username, email, submissionId) {
    try {
        ensureConnected();
        let user = await User.findOne({ email });

        if (user) {
            user.username = username || user.username;
            user.email = email || user.email;
            if (submissionId) {
                user.submissions.push(submissionId);
            }
            user.updatedAt = Date.now();
        } else {
            user = new User({
                username,
                email,
                submissions: submissionId ? [submissionId] : []
            });
        }

        const response = await user.save();
        console.log(`${new Date().toLocaleString()}: User saved/updated, id:`, response._id);
        return response._id;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error saving/updating user:', error);
        throw error;
    }
}

export async function getUserByUsernameAndEmail(username, email) {
    try {
        ensureConnected();
        let users = await User.find({ email });

        if (users.length === 1) {
            return users[0];
        } else if (users.length > 1) {
            users = users.filter(user => user.username === username);
            if (users.length === 1) {
                return users[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error fetching user:', error);
        throw error;
    }
}

export async function getSolvedQuestionIds(username) {
    try {
        ensureConnected();
        const solvedIds = await Submission.find({
            userId: username,
            'result.status': 'accepted'
        }).distinct('questionId');

        console.log(`${new Date().toLocaleString()}: Solved question IDs fetched for user:${username}, count:${solvedIds.length}`);
        return solvedIds;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error fetching solved question IDs:', error);
        throw error;
    }
}

export async function getSubmissionsDetails(submissionIds) {
    try {
        ensureConnected();
        const submissions = await Submission.find({ _id: { $in: submissionIds } });

        if (submissions.length > 0) {
            console.log(`${new Date().toLocaleString()}: Submissions found`);

            const submissionDetails = submissions.map(submission => ({
                id: submission._id,
                userId: submission.userId,
                questionId: submission.questionId,
                language: submission.language,
                submissionTime: submission.submissionTime,
                result: submission.result,
                testCaseResults: submission.testCaseResults
            }));

            return submissionDetails;
        } else {
            console.log(`${new Date().toLocaleString()}: Submissions not found`);
            return [];
        }
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error fetching submissions:', error);
        throw error;
    }
}
