/**
 * Assign Exam to Users - needs list of users and exams from API
 * We need an API to list users and exams. Adding GET /api/admin/exams and GET /api/admin/users in backend.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AssignExam() {
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch exams and users - we need these endpoints. Adding them in backend.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, usersRes] = await Promise.all([
          api.get('/admin/exams'),
          api.get('/admin/users'),
        ]);
        setExams(examsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedExam || selectedUsers.length === 0) {
      setError('Select an exam and at least one user.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/admin/assign', { examId: selectedExam, userIds: selectedUsers });
      setMessage('Exam assigned successfully.');
      setSelectedUsers([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Assign failed');
    }
    setLoading(false);
  };

  return (
    <>
      <nav className="navbar">
        <span>Assign Exam</span>
        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ color: '#fff' }}>Dashboard</Link>
      </nav>
      <div className="container">
        <h1 className="page-title">Assign Exam to Users</h1>
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        <div className="card">
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label>Select Exam</label>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} required>
                <option value="">-- Choose exam --</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.title} ({exam.skill})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Users (candidates)</label>
              <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.5rem' }}>
                {users.filter((u) => u.role === 'user').map((u) => (
                  <label key={u._id} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => toggleUser(u._id)}
                    />
                    <span style={{ marginLeft: '0.5rem' }}>{u.name} ({u.email})</span>
                  </label>
                ))}
                {users.filter((u) => u.role === 'user').length === 0 && <p>No users found. Register as user first.</p>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Assigning...' : 'Assign Exam'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
