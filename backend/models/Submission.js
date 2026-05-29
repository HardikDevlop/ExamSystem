// models/Submission.js
const mongoose = require('mongoose');

const caseResultSchema = new mongoose.Schema({
  index: Number,
  status: { type: String, enum: ['PASS', 'WA', 'TLE', 'RE'] },
});

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['cpp', 'python', 'js'], required: true },

    runCount: { type: Number, default: 0 },
    submitCount: { type: Number, default: 0 },

    // per-submit results for hidden cases
    results: [caseResultSchema],
    accuracy: { type: Number, default: 0 }, // % of hidden cases passed

    lastRunAt: Date,
    lastSubmitAt: Date,

    // manual marking
    marks: { type: Number, default: null },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);