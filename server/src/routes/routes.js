import { Router } from 'express';
import mongoose from 'mongoose';
import { runJava } from '../controllers/runJavaController.js';
import { getAllQuestions, getQuestionById, getQuestionList, getTotalQuestions, getSolvedQuestionList } from '../controllers/questionsController.js';
import { getProfileDetails } from '../controllers/profileController.js';
import { createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionAdminController.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { runJavaLimiter, profileLimiter, questionsLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const mongooseState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};

// Run Java Route
router.post('/run-java', authenticate, runJavaLimiter, runJava);

// Questions Routes
router.get("/questions", questionsLimiter, getAllQuestions);
router.get("/question/:id", questionsLimiter, getQuestionById);
router.get("/questionlist", questionsLimiter, getQuestionList);
router.get("/totalquestions", questionsLimiter, getTotalQuestions);
router.get("/questions/solved", authenticate, profileLimiter, getSolvedQuestionList);

// profile routes
router.get("/profile", authenticate, profileLimiter, getProfileDetails);

// Admin question management routes
router.post("/admin/questions", authenticate, requireAdmin, questionsLimiter, createQuestion);
router.put("/admin/question/:id", authenticate, requireAdmin, questionsLimiter, updateQuestion);
router.delete("/admin/question/:id", authenticate, requireAdmin, questionsLimiter, deleteQuestion);

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