import {
    getAllQuestionsFromDB,
    getQuestionByIdFromDB,
    getQuestionListFromDB,
    getTotalQuestionsCountFromDB,
    getSolvedQuestionIds,
    DBConnectionError,
} from '../db/mongooseClient.js';

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await getAllQuestionsFromDB();
        console.log(`${new Date().toLocaleString()}: Questions fetched`);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching all questions:', error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`${new Date().toLocaleString()}: Question fetched for id:${id}`);

        const question = await getQuestionByIdFromDB(id);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        console.error(`Error fetching question id=${req.params.id}:`, error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getQuestionList = async (req, res) => {
    try {
        const { search, difficulty } = req.query;
        const list = await getQuestionListFromDB({ search, difficulty });
        console.log(`${new Date().toLocaleString()}: Question list fetched`);
        res.json(list);
    } catch (error) {
        console.error('Error fetching question list:', error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTotalQuestions = async (req, res) => {
    try {
        const count = await getTotalQuestionsCountFromDB();
        console.log(`${new Date().toLocaleString()}: Total questions fetched`);
        res.json({ total: count });
    } catch (error) {
        console.error('Error fetching total questions:', error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSolvedQuestionList = async (req, res) => {
    try {
        const username = req.user.name;
        console.log(`${new Date().toLocaleString()}: Solved questions fetching for user:${username}`);

        const solvedIds = await getSolvedQuestionIds(username);

        // Convert string IDs from MongoDB to numbers to match question.id type
        const numericSolvedIds = solvedIds.map(id => Number(id)).filter(id => !isNaN(id));

        res.json({ solvedIds: numericSolvedIds });
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
