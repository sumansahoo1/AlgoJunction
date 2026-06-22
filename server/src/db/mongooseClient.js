import mongoose from 'mongoose';
import { Submission, User, Question } from './schema/dbSchema.js';

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

// ── Question read operations ──────────────────────────────────────────

export async function getAllQuestionsFromDB() {
    try {
        ensureConnected();
        const questions = await Question.find().sort({ id: 1 });
        console.log(`${new Date().toLocaleString()}: All questions fetched from DB`);
        return questions;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error fetching all questions:', error);
        throw error;
    }
}

export async function getQuestionByIdFromDB(id) {
    try {
        ensureConnected();
        const question = await Question.findOne({ id: Number(id) });
        console.log(`${new Date().toLocaleString()}: Question fetched from DB for id:${id}`);
        return question;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error(`Error fetching question id=${id}:`, error);
        throw error;
    }
}

export async function getQuestionListFromDB({ search, difficulty } = {}) {
    try {
        ensureConnected();
        const filter = {};

        // Text search across qName and qDescription (MongoDB $text)
        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        // Difficulty filter (comma-separated for future multi-select)
        if (difficulty) {
            const diffs = difficulty.split(',').map(d => d.trim())
                .filter(d => ['Easy', 'Medium', 'Hard'].includes(d));
            if (diffs.length > 0 && diffs.length < 3) {
                filter.qDifficulty = { $in: diffs };
            }
        }

        const projection = { id: 1, qName: 1, qDifficulty: 1, _id: 0 };
        const sort = filter.$text
            ? { score: { $meta: 'textScore' } }
            : { id: 1 };

        if (filter.$text) {
            projection.score = { $meta: 'textScore' };
        }

        const results = await Question.find(filter, projection).sort(sort).lean();

        // Strip internal score field from the response
        // eslint-disable-next-line no-unused-vars
        const cleaned = results.map(({ score, ...rest }) => rest);

        console.log(`${new Date().toLocaleString()}: Question list fetched from DB — search="${search || ''}" difficulty="${difficulty || ''}" → ${cleaned.length} results`);
        return cleaned;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error fetching question list:', error);
        throw error;
    }
}

export async function getTotalQuestionsCountFromDB() {
    try {
        ensureConnected();
        const count = await Question.countDocuments();
        console.log(`${new Date().toLocaleString()}: Total questions count from DB: ${count}`);
        return count;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error('Error counting questions:', error);
        throw error;
    }
}

export async function getQuestionNameById(id) {
    try {
        ensureConnected();
        const question = await Question.findOne({ id: Number(id) }, { qName: 1, _id: 0 }).lean();
        return question;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error(`Error fetching question name for id=${id}:`, error);
        throw error;
    }
}

// ── Question write operations (admin) ─────────────────────────────────

export async function createQuestionInDB(questionData) {
    try {
        ensureConnected();

        // Auto-assign id if not provided
        if (!questionData.id) {
            const lastQuestion = await Question.findOne().sort({ id: -1 }).lean();
            questionData.id = lastQuestion ? lastQuestion.id + 1 : 1;
        }

        const question = new Question(questionData);
        const saved = await question.save();
        console.log(`${new Date().toLocaleString()}: Question created in DB, id: ${saved.id}`);
        return saved.toJSON();
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        if (error.code === 11000) {
            // Duplicate key error
            const dupError = new Error(`Question with id ${questionData.id} already exists`);
            dupError.name = 'DuplicateQuestionError';
            throw dupError;
        }
        console.error('Error creating question:', error);
        throw error;
    }
}

export async function updateQuestionInDB(id, updateData) {
    try {
        ensureConnected();
        // Prevent changing the id field — work on a copy
        const safeUpdateData = { ...updateData };
        delete safeUpdateData.id;
        const updated = await Question.findOneAndUpdate(
            { id: Number(id) },
            safeUpdateData,
            { new: true, runValidators: true },
        );
        if (updated) {
            console.log(`${new Date().toLocaleString()}: Question updated in DB, id: ${id}`);
            return updated.toJSON();
        }
        return null;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error(`Error updating question id=${id}:`, error);
        throw error;
    }
}

export async function deleteQuestionFromDB(id) {
    try {
        ensureConnected();
        const deleted = await Question.findOneAndDelete({ id: Number(id) });
        if (deleted) {
            console.log(`${new Date().toLocaleString()}: Question deleted from DB, id: ${id}`);
            return deleted.toJSON();
        }
        return null;
    } catch (error) {
        if (error instanceof DBConnectionError) throw error;
        console.error(`Error deleting question id=${id}:`, error);
        throw error;
    }
}
