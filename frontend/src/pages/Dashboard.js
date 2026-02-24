import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../components/layout/UserLayout';
import { ExamCard } from '../components/dashboard/ExamCard';
import { Skeleton } from '../components/ui/Skeleton';
import { getMyExams } from '../services/api';

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyExams();
        let submittedIds = [];
        try {
          const raw = localStorage.getItem('submittedExams');
          submittedIds = raw ? JSON.parse(raw) : [];
        } catch {
          submittedIds = [];
        }
        const mapped = data.map((e) => ({
          ...e,
          status: submittedIds.includes(e._id) ? 'completed' : 'assigned',
        }));
        setExams(mapped);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exams');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <UserLayout title="My Exams">
      {error && (
        <p className="mb-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : exams.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No exams assigned to you yet.
        </p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onStart={() => navigate(`/exam/${exam._id}`)}
              onViewResult={() => navigate(`/result?examId=${exam._id}`)}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
