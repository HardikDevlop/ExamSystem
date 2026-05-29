// controllers/codingController.js
const fs = require('fs');
const path = require('path');
const CodingProblem = require('../models/CodingProblem');
const Submission = require('../models/Submission');
const { evaluateAgainstCases } = require('../services/judgeService');

exports.createProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.create(req.body);
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: list all coding problems (basic info)
exports.listProblems = async (req, res) => {
  try {
    const problems = await CodingProblem.find({})
      .select('title languageSupport timeLimit createdAt')
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch problems' });
  }
};

// Admin: full problem detail
exports.getProblemDetail = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch problem' });
  }
};

exports.getProblemForUser = async (req, res) => {
  const problem = await CodingProblem.findById(req.params.id).select(
    'title description constraints timeLimit languageSupport publicTestCases'
  );
  if (!problem) return res.status(404).json({ message: 'Problem not found' });

  res.json({
    ...problem.toObject(),
    publicTestCases: problem.publicTestCases.map((tc, idx) => ({
      index: idx + 1,
      // no input/output returned
    })),
  });
};

async function writeTempCode(language, code) {
  const ext = language === 'cpp' ? '.cpp' : language === 'python' ? '.py' : '.js';
  const dir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  fs.writeFileSync(filePath, code, 'utf8');
  return filePath;
}

exports.runCode = async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;
  const problem = await CodingProblem.findById(id);
  if (!problem) return res.status(404).json({ message: 'Problem not found' });

  const filePath = await writeTempCode(language, code);
  try {
    const results = await evaluateAgainstCases({
      language,
      codePath: filePath,
      testCases: problem.publicTestCases,
      timeLimit: problem.timeLimit,
    });

    // update Submission runCount
    const sub = await Submission.findOneAndUpdate(
      { userId: req.user._id, problemId: problem._id },
      {
        $setOnInsert: {
          userId: req.user._id,
          problemId: problem._id,
          code,
          language,
        },
        $inc: { runCount: 1 },
        lastRunAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      results, // [{index, status}]
      runCount: sub.runCount,
    });
  } finally {
    fs.unlink(filePath, () => {});
  }
};

// Admin: submissions analytics for a problem
exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find({ problemId: id })
      .populate('userId', 'name email')
      .sort({ lastSubmitAt: -1, createdAt: -1 });

    const data = submissions.map((s) => ({
      id: s._id,
      name: s.userId?.name,
      email: s.userId?.email,
      runCount: s.runCount,
      submitCount: s.submitCount,
      accuracy: s.accuracy,
      lastSubmit: s.lastSubmitAt || s.createdAt,
      marks: s.marks,
      published: s.published,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch submissions' });
  }
};

// Admin: set manual marks
exports.setMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks } = req.body;
    const sub = await Submission.findByIdAndUpdate(
      id,
      { marks },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('problemId', 'title');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to set marks' });
  }
};

// Admin: publish result
exports.publishResult = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Submission.findByIdAndUpdate(
      id,
      { published: true },
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    res.json({ message: 'Result published', submission: sub });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to publish result' });
  }
};

exports.submitCode = async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;
  const problem = await CodingProblem.findById(id);
  if (!problem) return res.status(404).json({ message: 'Problem not found' });

  const filePath = await writeTempCode(language, code);
  try {
    const results = await evaluateAgainstCases({
      language,
      codePath: filePath,
      testCases: problem.hiddenTestCases,
      timeLimit: problem.timeLimit,
    });

    const passed = results.filter((r) => r.status === 'PASS').length;
    const accuracy = problem.hiddenTestCases.length
      ? Math.round((passed / problem.hiddenTestCases.length) * 100)
      : 0;

    const sub = await Submission.findOneAndUpdate(
      { userId: req.user._id, problemId: problem._id },
      {
        userId: req.user._id,
        problemId: problem._id,
        code,
        language,
        results,
        accuracy,
        $inc: { submitCount: 1 },
        lastSubmitAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      results, // [{index, status}]
      submitCount: sub.submitCount,
      accuracy,
    });
  } finally {
    fs.unlink(filePath, () => {});
  }
};