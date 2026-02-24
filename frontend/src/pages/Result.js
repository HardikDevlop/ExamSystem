/**
 * Result page - View result after admin evaluates (uses examId from query)
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getResult } from '../services/api';

export default function Result() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId');
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      setError('No exam selected.');
      return;
    }
    const fetch = async () => {
      try {
        const { data } = await getResult(examId);
        setResult(data.response);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load result');
      }
      setLoading(false);
    };
    fetch();
  }, [examId]);

  if (loading) return <div className="container"><p>Loading result...</p></div>;

  return (
    <>
      <nav className="navbar">
        <span>Online Exam - Result</span>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>
      <div className="container">
        <h1 className="page-title">Exam Result</h1>
        {error && <p className="error-msg">{error}</p>}
        {result && !error && (
          <div className="card">
            {result.score === null ? (
              <p>Your submission has not been evaluated yet. Please wait for admin to evaluate.</p>
            ) : (
              <>
                <p><strong>Exam:</strong> {result.examId?.title}</p>
                <p><strong>Score:</strong> {result.score} / {result.totalMarks}</p>
                <p><strong>Evaluated at:</strong> {result.evaluatedAt ? new Date(result.evaluatedAt).toLocaleString() : '-'}</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
