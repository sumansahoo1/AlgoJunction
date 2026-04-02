import { Router } from 'express';
import { runJava } from '../controllers/runJavaController.js';
import { getAllQuestions, getQuestionById, getQuestionList, getTotalQuestions } from '../controllers/questionsController.js';
import { getProfileDetails } from '../controllers/profileController.js';

const router = Router();

// Run Java Route
router.post('/run-java', runJava);

// Questions Routes
router.get("/questions", getAllQuestions);
router.get("/question/:id", getQuestionById);
router.get("/questionlist", getQuestionList);
router.get("/totalquestions", getTotalQuestions);

// profile routes
router.get("/profile", getProfileDetails);

// Default Route
router.get("/", (req, res) => {
    console.log(`${new Date().toLocaleString()}: Hello World`);
    res.send("Hello World");
});

export default router;