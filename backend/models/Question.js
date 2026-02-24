/**
 * Question Model
 * examId, question text, 4 options, correctAnswer (index or value)
 */
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length === 4;
        },
        message: 'Exactly 4 options are required',
      },
    },
    correctAnswer: {
      type: Number, // 0-indexed: 0, 1, 2, or 3
      required: true,
      min: 0,
      max: 3,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
