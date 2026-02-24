/**
 * User Dashboard - list of assigned exams
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyExams } from '../services/api';

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyExams();
        setExams(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exams');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const userName = localStorage.getItem('userName') || 'User';

  return (
    <>
      <nav className="navbar">
        <span>Online Exam - User</span>
        <div>
          <span style={{ marginRight: '1rem' }}>{userName}</span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.35rem 0.75rem' }}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container">
        <h1 className="page-title">My Assigned Exams</h1>
        {loading && <p>Loading exams...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && exams.length === 0 && (
          <div className="card">
            <p>No exams assigned to you yet.</p>
          </div>
        )}
        {!loading && exams.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exams.map((exam) => (
              <div key={exam._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>{exam.title}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>({exam.skill})</span>
                </div>
                <div>
                  <Link to={`/exam/${exam._id}`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                    View & Attempt
                  </Link>
                  <Link to={`/result?examId=${exam._id}`} className="btn btn-secondary">
                    View Result
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
