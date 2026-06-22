import { questions } from '../db/data.js';
import { getSolvedQuestionIds, DBConnectionError } from '../db/mongooseClient.js';

export const getAllQuestions = (req, res) => {
    console.log(`${new Date().toLocaleString()}: Questions fetched`);
    res.json(questions);
};

export const getQuestionById = (req, res) => {
    const { id } = req.params;
    console.log(`${new Date().toLocaleString()}: Question fetched for id:${id}`);

    const question = questions.find((item) => item.id == id);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
};

export const getQuestionList = (req, res) => {
    console.log(`${new Date().toLocaleString()}: Question list fetched`);
    res.json(filtertolist(questions));
};

export const getTotalQuestions = (req, res) => {
    console.log(`${new Date().toLocaleString()}: Total questions fetched`);
    res.json({ total: questions.length });
};

const filtertolist = () => {
    return questions.map(item => ({ id: item.id, qName: item.qName, qDifficulty: item.qDifficulty }));
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