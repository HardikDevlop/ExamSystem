/**
 * Assign Exam to Users - needs list of users and exams from API
 * We need an API to list users and exams. Adding GET /api/admin/exams and GET /api/admin/users in backend.
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import api from '../../services/api';

export default function AssignExam() {
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmAssignOpen, setConfirmAssignOpen] = useState(false);

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
        const msg = err.response?.data?.message || 'Failed to load data';
        setError(msg);
        toast.error(msg);
      }
    };
    fetchData();
  }, []);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (!selectedExam || selectedUsers.length === 0) {
      const msg = 'Select an exam and at least one user.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/admin/assign', { examId: selectedExam, userIds: selectedUsers });
      setMessage('Exam assigned successfully.');
      toast.success('Exam assigned successfully.');
      setSelectedUsers([]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Assign failed';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Assign Exam">
      <Card>
        <CardHeader>
          <CardTitle>Assign Exam to Users</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-2 text-xs text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmAssignOpen(true);
            }}
            className="space-y-4 text-sm"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Select Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">-- Choose exam --</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.title} ({exam.skill})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Select Users (candidates)
              </label>
              <div className="max-h-60 overflow-auto rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700">
                {users
                  .filter((u) => u.role === 'user')
                  .map((u) => (
                    <label
                      key={u._id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => toggleUser(u._id)}
                      />
                      <span>
                        {u.name} ({u.email})
                      </span>
                    </label>
                  ))}
                {users.filter((u) => u.role === 'user').length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400">
                    No users found. Register as user first.
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning…' : 'Assign Exam'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmAssignOpen}
        title="Assign exam to selected users?"
        description="The selected candidates will see this exam in their dashboards."
        confirmLabel="Assign"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setConfirmAssignOpen(false);
          await handleAssign();
        }}
        onCancel={() => setConfirmAssignOpen(false)}
      />
    </AdminLayout>
  );
}
