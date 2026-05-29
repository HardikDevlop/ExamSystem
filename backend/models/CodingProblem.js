// models/CodingProblem.js
const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
});

const codingProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    constraints: String,
    timeLimit: { type: Number, default: 2 },   // seconds
    memoryLimit: { type: Number, default: 256 }, // MB (for future use)
    languageSupport: [{ type: String, enum: ['cpp', 'python', 'js'] }],
    publicTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodingProblem', codingProblemSchema);