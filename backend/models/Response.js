/**
 * Response Model
 * userId, examId, answers (array of selected option indices), score (set after evaluation)
 */
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    answers: [
      {
        questionIndex: Number, // 0-based index of question
        selectedOption: Number, // 0-3
      },
    ],
    score: {
      type: Number,
      default: null, // null until admin evaluates
    },
    totalMarks: {
      type: Number,
      default: null, // total questions (or custom total)
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One response per user per exam
responseSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
