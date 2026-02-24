/**
 * Admin Routes - Protected by auth + admin role
 */
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getExams,
  getUsers,
  getExamDetail,
  createExam,
  deleteExam,
  addQuestion,
  assignExam,
  getResponses,
  getScore,
  uploadQuestions,
} = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

router.get('/exams', getExams);
router.get('/exam/:id', getExamDetail);
router.get('/users', getUsers);
router.post('/exam', createExam);
router.delete('/exam/:id', deleteExam);
router.post('/question', addQuestion);
router.post('/upload-questions', upload.single('file'), uploadQuestions);
router.post('/assign', assignExam);
router.get('/responses', getResponses);
router.post('/get-score', getScore);

module.exports = router;
