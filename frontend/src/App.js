/**
 * App - Root component with React Router
 * User routes: /login, /register, /dashboard, /exam/:id, /result
 * Admin routes: /admin/login, /admin/dashboard, /admin/create-exam, /admin/assign, /admin/responses
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// User pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import Result from './pages/Result';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateExam from './pages/admin/CreateExam';
import AssignExam from './pages/admin/AssignExam';
import Responses from './pages/admin/Responses';

// Protected route wrapper - redirect to login if no token or wrong role
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'user') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* User routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />
      <Route
        path="/exam/:id"
        element={
          <UserRoute>
            <Exam />
          </UserRoute>
        }
      />
      <Route
        path="/result"
        element={
          <UserRoute>
            <Result />
          </UserRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/create-exam"
        element={
          <AdminRoute>
            <CreateExam />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/assign"
        element={
          <AdminRoute>
            <AssignExam />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/responses"
        element={
          <AdminRoute>
            <Responses />
          </AdminRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
