/**
 * View submitted responses and Get Score button
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getResponses, getScore } from '../../services/api';

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoringId, setScoringId] = useState(null);
  const [error, setError] = useState('');

  const fetchResponses = async () => {
    try {
      const { data } = await getResponses();
      setResponses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load responses');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleGetScore = async (responseId) => {
    setScoringId(responseId);
    setError('');
    try {
      await getScore(responseId);
      await fetchResponses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate score');
    }
    setScoringId(null);
  };

  return (
    <>
      <nav className="navbar">
        <span>Submissions & Score</span>
        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ color: '#fff' }}>Dashboard</Link>
      </nav>
      <div className="container">
        <h1 className="page-title">Submitted Responses</h1>
        {error && <p className="error-msg">{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && responses.length === 0 && (
          <div className="card"><p>No submissions yet.</p></div>
        )}
        {!loading && responses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {responses.map((r) => (
              <div key={r._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>{r.userId?.name}</strong> ({r.userId?.email}) — <em>{r.examId?.title}</em>
                  <br />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    Submitted: {new Date(r.createdAt).toLocaleString()}
                    {r.score !== null && ` • Score: ${r.score}/${r.totalMarks}`}
                  </span>
                </div>
                <div>
                  {r.score === null ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleGetScore(r._id)}
                      disabled={scoringId !== null}
                    >
                      {scoringId === r._id ? 'Calculating...' : 'Get Score'}
                    </button>
                  ) : (
                    <span className="success-msg">Evaluated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
