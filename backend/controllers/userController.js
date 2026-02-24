/**
 * User Controller
 * List assigned exams, get exam with questions, submit answers, get result
 */
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Response = require('../models/Response');

// GET /api/user/exams - Assigned exams for logged-in user
exports.getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      assignedUsers: req.user._id,
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exams' });
  }
};

// GET /api/user/exam/:id - Get single exam with questions (read-only view)
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const isAssigned = exam.assignedUsers.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this exam' });
    }
    const questions = await Question.find({ examId: exam._id }).sort({ createdAt: 1 });
    // Don't send correctAnswer to client for attempt - only for result after evaluation
    const questionsSafe = questions.map((q, idx) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      questionIndex: idx,
    }));
    res.json({ exam, questions: questionsSafe });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exam' });
  }
};

// POST /api/user/submit - Submit exam answers
exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    if (!examId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'examId and answers array are required' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const isAssigned = exam.assignedUsers.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this exam' });
    }
    let response = await Response.findOne({ userId: req.user._id, examId });
    if (response) {
      return res.status(400).json({ message: 'You have already submitted this exam' });
    }
    response = await Response.create({
      userId: req.user._id,
      examId,
      answers: answers.map((a) => ({
        questionIndex: a.questionIndex,
        selectedOption: a.selectedOption,
      })),
    });
    res.status(201).json({ message: 'Exam submitted successfully', response });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Submit failed' });
  }
};

// GET /api/user/result/:id - Get result for exam (score after admin evaluation)
exports.getResult = async (req, res) => {
  try {
    const examId = req.params.id;
    const response = await Response.findOne({
      userId: req.user._id,
      examId,
    })
      .populate('examId', 'title skill')
      .populate('userId', 'name email');
    if (!response) return res.status(404).json({ message: 'No submission found for this exam' });
    if (response.score === null) {
      return res.json({
        message: 'Not yet evaluated',
        response: {
          _id: response._id,
          examId: response.examId,
          score: null,
          totalMarks: null,
          evaluatedAt: null,
        },
      });
    }
    res.json({
      message: 'Result',
      response: {
        _id: response._id,
        examId: response.examId,
        score: response.score,
        totalMarks: response.totalMarks,
        evaluatedAt: response.evaluatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch result' });
  }
};
