/**
 * Exam page - View question paper (read-only) and attempt exam
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, submitExam } from '../services/api';

export default function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('view'); // 'view' | 'attempt'

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getExam(id);
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleOptionChange = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answersArray = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: parseInt(questionIndex, 10),
      selectedOption,
    }));
    if (answersArray.length !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitExam({ examId: id, answers: answersArray });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container"><p>Loading exam...</p></div>;
  if (error && !exam) return <div className="container"><p className="error-msg">{error}</p></div>;

  return (
    <>
      <nav className="navbar">
        <span>Online Exam</span>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>
      <div className="container">
        {exam && (
          <>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h1 className="page-title">{exam.title}</h1>
              <p style={{ color: '#64748b' }}>Skill: {exam.skill}</p>
              {questions.length > 0 && (
                <p>{questions.length} question(s)</p>
              )}
              {mode === 'view' && questions.length > 0 && (
                <button className="btn btn-primary" onClick={() => setMode('attempt')}>
                  Start Attempt
                </button>
              )}
            </div>

            {mode === 'attempt' && questions.length > 0 && (
              <form onSubmit={handleSubmit}>
                {questions.map((q, idx) => (
                  <div key={q._id} className="card" style={{ marginBottom: '1rem' }}>
                    <p><strong>Q{idx + 1}.</strong> {q.question}</p>
                    <div style={{ marginTop: '0.75rem', marginLeft: '1rem' }}>
                      {q.options.map((opt, optIdx) => (
                        <label key={optIdx} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`q${idx}`}
                            checked={answers[idx] === optIdx}
                            onChange={() => handleOptionChange(idx, optIdx)}
                          />
                          <span style={{ marginLeft: '0.5rem' }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {error && <p className="error-msg">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              </form>
            )}

            {questions.length === 0 && (
              <div className="card">
                <p>No questions in this exam yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
