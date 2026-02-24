/**
 * User Routes - Protected by auth + user role
 */
const express = require('express');
const router = express.Router();
const { protect, userOnly } = require('../middleware/auth');
const {
  getMyExams,
  getExam,
  submitExam,
  getResult,
} = require('../controllers/userController');

router.use(protect);
router.use(userOnly);

router.get('/exams', getMyExams);
router.get('/exam/:id', getExam);
router.post('/submit', submitExam);
router.get('/result/:id', getResult);

module.exports = router;
