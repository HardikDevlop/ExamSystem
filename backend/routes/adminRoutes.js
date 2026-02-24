/**
 * Admin Routes - Protected by auth + admin role
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getExams,
  getUsers,
  createExam,
  addQuestion,
  assignExam,
  getResponses,
  getScore,
} = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

router.get('/exams', getExams);
router.get('/users', getUsers);
router.post('/exam', createExam);
router.post('/question', addQuestion);
router.post('/assign', assignExam);
router.get('/responses', getResponses);
router.post('/get-score', getScore);

module.exports = router;
