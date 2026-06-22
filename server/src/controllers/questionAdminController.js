import {
    createQuestionInDB,
    updateQuestionInDB,
    deleteQuestionFromDB,
    DBConnectionError,
} from '../db/mongooseClient.js';

export const createQuestion = async (req, res) => {
    try {
        const { qName, qDifficulty, qDescription, code } = req.body;

        // Validate required fields
        if (!qName || !qDifficulty || !qDescription || !code) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['qName', 'qDifficulty', 'qDescription', 'code'],
            });
        }

        const created = await createQuestionInDB(req.body);
        console.log(`${new Date().toLocaleString()}: Admin created question id=${created.id}`);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating question:', error);
        if (error.name === 'DuplicateQuestionError') {
            return res.status(409).json({ error: error.message });
        }
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await updateQuestionInDB(id, req.body);
        if (!updated) {
            return res.status(404).json({ error: `Question with id ${id} not found` });
        }
        console.log(`${new Date().toLocaleString()}: Admin updated question id=${id}`);
        res.json(updated);
    } catch (error) {
        console.error(`Error updating question id=${req.params.id}:`, error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteQuestionFromDB(id);
        if (!deleted) {
            return res.status(404).json({ error: `Question with id ${id} not found` });
        }
        console.log(`${new Date().toLocaleString()}: Admin deleted question id=${id}`);
        res.json({ message: `Question "${deleted.qName}" (id: ${id}) deleted successfully` });
    } catch (error) {
        console.error(`Error deleting question id=${req.params.id}:`, error);
        if (error instanceof DBConnectionError) {
            return res.status(503).json({ error: 'Service temporarily unavailable. Database connection lost.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
