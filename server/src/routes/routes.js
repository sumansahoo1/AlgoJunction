import { Router } from 'express';
import mongoose from 'mongoose';
import { runJava } from '../controllers/runJavaController.js';
import { getAllQuestions, getQuestionById, getQuestionList, getTotalQuestions } from '../controllers/questionsController.js';
import { getProfileDetails } from '../controllers/profileController.js';

const router = Router();

const mongooseState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

// Run Java Route
router.post('/run-java', runJava);

// Questions Routes
router.get("/questions", getAllQuestions);
router.get("/question/:id", getQuestionById);
router.get("/questionlist", getQuestionList);
router.get("/totalquestions", getTotalQuestions);

// profile routes
router.get("/profile", getProfileDetails);

// Health Check Route
router.get("/", (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus = mongooseState[mongoState] ?? 'unknown';

    const checks = {
        mongodb: mongoStatus === 'connected' ? 'ok' : `error (${mongoStatus})`,
        server: 'ok',
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date().toISOString(),
    };

    const allOk = checks.mongodb === 'ok' && checks.server === 'ok';
    const statusCode = allOk ? 200 : 503;

    console.log(`${new Date().toLocaleString()}: Health check —`, JSON.stringify(checks));

    res.status(statusCode).json({
        status: allOk ? 'ok' : 'degraded',
        checks,
    });
});

export default router;