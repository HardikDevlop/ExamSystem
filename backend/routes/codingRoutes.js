// routes/codingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly, userOnly } = require('../middleware/auth');
const codingController = require('../controllers/codingController');

// admin
router.post('/problems', protect, adminOnly, codingController.createProblem);
router.get('/problems', protect, adminOnly, codingController.listProblems);
router.get('/problems/:id', protect, adminOnly, codingController.getProblemDetail);

// candidate
router.get('/problems/:id/view', protect, userOnly, codingController.getProblemForUser);
router.post('/problems/:id/run', protect, userOnly, codingController.runCode);
router.post('/problems/:id/submit', protect, userOnly, codingController.submitCode);

// admin analytics
router.get('/problems/:id/submissions', protect, adminOnly, codingController.getSubmissions);
router.post('/submissions/:id/marks', protect, adminOnly, codingController.setMarks);
router.post('/submissions/:id/publish', protect, adminOnly, codingController.publishResult);

module.exports = router;