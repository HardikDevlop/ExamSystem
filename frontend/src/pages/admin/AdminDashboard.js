/**
 * Admin Dashboard - quick links
 */
import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    window.location.href = '/admin/login';
  };

  const userName = localStorage.getItem('userName') || 'Admin';

  return (
    <>
      <nav className="navbar">
        <span>Online Exam - Admin</span>
        <div>
          <span style={{ marginRight: '1rem' }}>{userName}</span>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.35rem 0.75rem' }}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: 400 }}>
          <Link to="/admin/create-exam" className="btn btn-primary" style={{ textAlign: 'center', padding: '1rem' }}>
            Create Exam & Add Questions
          </Link>
          <Link to="/admin/assign" className="btn btn-primary" style={{ textAlign: 'center', padding: '1rem' }}>
            Assign Exam to Users
          </Link>
          <Link to="/admin/responses" className="btn btn-primary" style={{ textAlign: 'center', padding: '1rem' }}>
            View Submissions & Get Score
          </Link>
        </div>
      </div>
    </>
  );
}
