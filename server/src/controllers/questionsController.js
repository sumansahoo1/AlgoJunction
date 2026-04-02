import { questions } from '../db/data.js';

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