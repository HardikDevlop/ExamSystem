/**
 * Admin Controller
 * Create exam, add question, assign exam, view responses, get score
 */
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Response = require('../models/Response');
const User = require('../models/User');

// GET /api/admin/exams - List all exams (for assign page)
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exams' });
  }
};

// GET /api/admin/users - List all users (for assign page)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

// POST /api/admin/exam - Create exam
exports.createExam = async (req, res) => {
  try {
    const { title, skill } = req.body;
    if (!title || !skill) {
      return res.status(400).json({ message: 'Title and skill are required' });
    }
    const exam = await Exam.create({
      title,
      skill,
      createdBy: req.user._id,
      assignedUsers: [],
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create exam' });
  }
};

// POST /api/admin/question - Add question to exam
exports.addQuestion = async (req, res) => {
  try {
    const { examId, question, options, correctAnswer } = req.body;
    if (!examId || !question || !options || !Number.isInteger(correctAnswer)) {
      return res.status(400).json({
        message: 'examId, question, options (array of 4), and correctAnswer (0-3) are required',
      });
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Exactly 4 options are required' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add questions to this exam' });
    }
    const q = await Question.create({
      examId,
      question,
      options,
      correctAnswer: Number(correctAnswer),
    });
    res.status(201).json(q);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add question' });
  }
};

// POST /api/admin/assign - Assign exam to users
exports.assignExam = async (req, res) => {
  try {
    const { examId, userIds } = req.body;
    if (!examId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'examId and userIds array are required' });
    }
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    exam.assignedUsers = [...new Set([...exam.assignedUsers.map(String), ...userIds])];
    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to assign exam' });
  }
};

// GET /api/admin/responses - View submitted responses (optionally by examId)
exports.getResponses = async (req, res) => {
  try {
    const { examId } = req.query;
    const filter = {};
    if (examId) filter.examId = examId;
    const responses = await Response.find(filter)
      .populate('userId', 'name email')
      .populate('examId', 'title skill')
      .sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch responses' });
  }
};

// POST /api/admin/get-score - Auto-evaluate and store score for a response
exports.getScore = async (req, res) => {
  try {
    const { responseId } = req.body;
    if (!responseId) {
      return res.status(400).json({ message: 'responseId is required' });
    }
    const response = await Response.findById(responseId)
      .populate('examId')
      .populate('userId', 'name email');
    if (!response) return res.status(404).json({ message: 'Response not found' });
    const questions = await Question.find({ examId: response.examId._id }).sort({
      createdAt: 1,
    });
    const totalMarks = questions.length;
    let score = 0;
    const answerMap = {};
    response.answers.forEach((a) => {
      answerMap[a.questionIndex] = a.selectedOption;
    });
    questions.forEach((q, idx) => {
      if (answerMap[idx] === q.correctAnswer) score += 1;
    });
    response.score = score;
    response.totalMarks = totalMarks;
    response.evaluatedAt = new Date();
    await response.save();
    res.json({
      message: 'Score calculated and saved',
      response: {
        _id: response._id,
        userId: response.userId,
        examId: response.examId,
        score,
        totalMarks,
        evaluatedAt: response.evaluatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get score' });
  }
};
