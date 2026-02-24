/**
 * Admin Controller
 * Create exam, add question, assign exam, view responses, get score
 */
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
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

// GET /api/admin/exam/:id - Exam with questions (for admin view)
exports.getExamDetail = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (exam.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this exam' });
    }
    const questions = await Question.find({ examId: exam._id }).sort({ createdAt: 1 });
    res.json({ exam, questions });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch exam detail' });
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

// DELETE /api/admin/exam/:id - Delete exam and related questions/responses
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }

    await Question.deleteMany({ examId: exam._id });
    await Response.deleteMany({ examId: exam._id });
    await exam.deleteOne();

    res.json({ message: 'Exam and related data deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete exam' });
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

// Helper: parse questions from plain text.
// Supports TWO formats:
// 1) Single-line pipe format:
//    Question | Option 1 | Option 2 | Option 3 | Option 4 | CorrectOption(1-4)
// 2) Multi-line MCQ format:
//    1. Question text
//    a) Option 1
//    b) Option 2
//    c) Option 3
//    d) Option 4
//    Answer: c   (or Answer: 3)  <-- optional, defaults to a) if missing
const parseQuestionsFromText = (text) => {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim());
  const lines = rawLines.filter((l) => l.length > 0);

  const questions = [];

  // Pass 1: pipe-style lines
  for (const line of lines) {
    if (!line.includes('|')) continue;
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length !== 6) continue;
    const [questionText, o1, o2, o3, o4, correctRaw] = parts;
    const correctIdx = parseInt(correctRaw, 10) - 1; // convert 1-4 to 0-3
    if (
      !questionText ||
      [o1, o2, o3, o4].some((o) => !o) ||
      Number.isNaN(correctIdx) ||
      correctIdx < 0 ||
      correctIdx > 3
    ) {
      continue;
    }
    questions.push({
      question: questionText,
      options: [o1, o2, o3, o4],
      correctAnswer: correctIdx,
    });
  }

  // Pass 2: multi-line MCQ blocks (only if no pipe-style questions found)
  if (!questions.length) {
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Match "1. Question text" or just treat any non-option line as question start
      const qMatch = line.match(/^\d+\.\s*(.+)$/);
      const isOptionLine = /^[a-dA-D]\)/.test(line);
      if (isOptionLine) {
        i += 1;
        continue;
      }
      const questionText = qMatch ? qMatch[1].trim() : line;
      const options = [];
      let answerIdx = 0; // default to first option if Answer: missing
      let j = i + 1;
      // Read up to next 6 non-empty lines for options + answer
      while (j < lines.length && options.length < 4) {
        const optLine = lines[j];
        const optMatch = optLine.match(/^[a-dA-D]\)\s*(.+)$/);
        if (optMatch) {
          options.push(optMatch[1].trim());
          j += 1;
          continue;
        }
        break;
      }

      // Optional answer line (e.g. "Answer: c" or "Answer: 3")
      if (j < lines.length) {
        const ansMatch = lines[j].match(/^Answer\s*:\s*([a-dA-D1-4])/i);
        if (ansMatch) {
          const token = ansMatch[1];
          if (/[1-4]/.test(token)) {
            answerIdx = parseInt(token, 10) - 1;
          } else {
            const letter = token.toLowerCase();
            const map = { a: 0, b: 1, c: 2, d: 3 };
            if (map[letter] !== undefined) answerIdx = map[letter];
          }
          j += 1;
        }
      }

      if (questionText && options.length === 4) {
        if (answerIdx < 0 || answerIdx > 3 || Number.isNaN(answerIdx)) {
          answerIdx = 0;
        }
        questions.push({
          question: questionText,
          options,
          correctAnswer: answerIdx,
        });
      }
      i = j;
    }
  }

  return questions;
};

// POST /api/admin/upload-questions - Upload doc/txt and create questions for an exam
// Accepts multipart/form-data with fields: examId, suggestedCount?, file
exports.uploadQuestions = async (req, res) => {
  const file = req.file;
  const { examId, suggestedCount } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }
  if (!examId) {
    return res.status(400).json({ message: 'examId is required' });
  }

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    if (exam.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add questions to this exam' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';

    if (ext === '.txt') {
      text = fs.readFileSync(file.path, 'utf8');
    } else if (ext === '.docx') {
      const result = await mammoth.convertToText({ path: file.path });
      text = result.value || '';
    } else {
      return res.status(400).json({ message: 'Only .txt and .docx files are supported for now' });
    }

    let questions = parseQuestionsFromText(text);
    if (!questions.length) {
      return res.status(400).json({
        message:
          'No valid questions found. Each line should be: Question | Option 1 | Option 2 | Option 3 | Option 4 | CorrectOption(1-4)',
      });
    }

    const limit = suggestedCount ? parseInt(suggestedCount, 10) : undefined;
    if (limit && !Number.isNaN(limit) && limit > 0) {
      questions = questions.slice(0, limit);
    }

    const docs = questions.map((q) => ({
      examId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    const created = await Question.insertMany(docs);

    res.status(201).json({
      message: `Uploaded and created ${created.length} question(s).`,
      count: created.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to upload questions' });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
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
