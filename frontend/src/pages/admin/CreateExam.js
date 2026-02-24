/**
 * Create Exam and Add Questions
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createExam, addQuestion } from '../../services/api';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [examId, setExamId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await createExam({ title, skill });
      setExamId(data._id);
      setMessage('Exam created. Now add questions below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    }
    setLoading(false);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!examId) {
      setError('Create an exam first.');
      return;
    }
    if (!question || options.some((o) => !o.trim())) {
      setError('Question and all 4 options are required.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await addQuestion({
        examId,
        question: question.trim(),
        options: options.map((o) => o.trim()),
        correctAnswer,
      });
      setMessage('Question added.');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
    setLoading(false);
  };

  return (
    <>
      <nav className="navbar">
        <span>Create Exam</span>
        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ color: '#fff' }}>Dashboard</Link>
      </nav>
      <div className="container">
        <h1 className="page-title">Create Exam & Add Questions</h1>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Step 1: Create Exam</h2>
          <form onSubmit={handleCreateExam}>
            <div className="form-group">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. JavaScript Basics" />
            </div>
            <div className="form-group">
              <label>Skill</label>
              <input value={skill} onChange={(e) => setSkill(e.target.value)} required placeholder="e.g. JavaScript" />
            </div>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Exam'}</button>
          </form>
        </div>

        {examId && (
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Step 2: Add Questions (MCQ - 4 options)</h2>
            <form onSubmit={handleAddQuestion}>
              <div className="form-group">
                <label>Question</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} required rows={2} placeholder="Enter question text" />
              </div>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="form-group">
                  <label>Option {i + 1}</label>
                  <input
                    value={options[i] || ''}
                    onChange={(e) => {
                      const next = [...options];
                      next[i] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}
              <div className="form-group">
                <label>Correct Answer (Option number 1-4)</label>
                <select value={correctAnswer} onChange={(e) => setCorrectAnswer(Number(e.target.value))}>
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>
              {error && <p className="error-msg">{error}</p>}
              {message && <p className="success-msg">{message}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Question'}</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
