import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getResult } from '../services/api';
import { UserLayout } from '../components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { Download, Trophy } from 'lucide-react';

export default function Result() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId');
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

  const handleDownload = () => {
    if (!result || result.score === null) return;
    const content = `Exam: ${result.examId?.title}\nScore: ${result.score} / ${
      result.totalMarks
    }\nEvaluated at: ${
      result.evaluatedAt
        ? new Date(result.evaluatedAt).toLocaleString()
        : '-'
    }`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result-${result.examId?._id || 'exam'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <UserLayout title="Result">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </UserLayout>
    );
  }

  const percentage =
    result && result.totalMarks
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;

  return (
    <UserLayout title="Result">
      {error && (
        <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {result && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <Card className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Exam
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {result.examId?.title}
                </p>
              </div>
            </div>
            {result.score === null ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your submission has not been evaluated yet. Please wait for the
                admin.
              </p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20">
                  <svg className="h-20 w-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-primary-500"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={
                        2 * Math.PI * 34 * (1 - percentage / 100)
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-semibold text-slate-900 dark:text-slate-50">
                    <span>{percentage}%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Score
                    </span>
                  </div>
                </div>
                <div className="text-left text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="font-semibold">Score:</span> {result.score}{' '}
                    / {result.totalMarks}
                  </p>
                  <p>
                    <span className="font-semibold">Evaluated at:</span>{' '}
                    {result.evaluatedAt
                      ? new Date(result.evaluatedAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {result && result.score !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-semibold">Correct:</span> {result.score}
                </p>
                <p>
                  <span className="font-semibold">Wrong:</span>{' '}
                  {result.totalMarks - result.score}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="inline-flex items-center gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                  Download result
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </UserLayout>
  );
}
