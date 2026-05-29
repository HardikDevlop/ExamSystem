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

    const escapeHtml = (value) =>
      String(value || '-')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const percentage = result.totalMarks
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;
    const wrong = result.totalMarks - result.score;
    const evaluatedAt = result.evaluatedAt
      ? new Date(result.evaluatedAt).toLocaleString()
      : '-';
    const submittedAt = result.submittedAt
      ? new Date(result.submittedAt).toLocaleString()
      : '-';
    const generatedAt = new Date().toLocaleString();
    const status = percentage >= 40 ? 'Pass' : 'Needs Improvement';

    const content = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Result Report - ${escapeHtml(result.examId?.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f1f5f9; color: #0f172a; font-family: Arial, sans-serif; }
    .page { max-width: 820px; margin: 32px auto; background: #fff; border: 1px solid #e2e8f0; padding: 36px; }
    .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 18px; }
    .brand { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: #2563eb; text-transform: uppercase; }
    h1 { margin: 8px 0 0; font-size: 28px; }
    .badge { align-self: flex-start; border: 1px solid #bfdbfe; border-radius: 999px; color: #1d4ed8; padding: 8px 14px; font-size: 12px; font-weight: 700; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 26px; }
    .field { border: 1px solid #e2e8f0; padding: 14px; }
    .label { color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase; }
    .value { margin-top: 6px; font-size: 15px; font-weight: 700; }
    .score { margin-top: 28px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 22px; display: grid; grid-template-columns: 1.1fr .9fr; gap: 20px; }
    .score-number { font-size: 44px; font-weight: 800; color: #1d4ed8; line-height: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 26px; }
    th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
    th { background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: .6px; }
    .footer { margin-top: 30px; color: #64748b; font-size: 11px; text-align: center; }
    @media print { body { background: #fff; } .page { margin: 0; border: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <section class="header">
      <div>
        <div class="brand">Online Examination System</div>
        <h1>Result Report</h1>
      </div>
      <div class="badge">${escapeHtml(status)}</div>
    </section>
    <section class="grid">
      <div class="field"><div class="label">Candidate Name</div><div class="value">${escapeHtml(result.userId?.name)}</div></div>
      <div class="field"><div class="label">Candidate Email</div><div class="value">${escapeHtml(result.userId?.email)}</div></div>
      <div class="field"><div class="label">Exam</div><div class="value">${escapeHtml(result.examId?.title)}</div></div>
      <div class="field"><div class="label">Skill</div><div class="value">${escapeHtml(result.examId?.skill)}</div></div>
    </section>
    <section class="score">
      <div>
        <div class="label">Final Score</div>
        <div class="score-number">${result.score}/${result.totalMarks}</div>
      </div>
      <div>
        <div class="label">Percentage</div>
        <div class="score-number">${percentage}%</div>
      </div>
    </section>
    <table>
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Correct Answers</td><td>${result.score}</td></tr>
        <tr><td>Wrong Answers</td><td>${wrong}</td></tr>
        <tr><td>Total Questions</td><td>${result.totalMarks}</td></tr>
        <tr><td>Submitted At</td><td>${escapeHtml(submittedAt)}</td></tr>
        <tr><td>Evaluated At</td><td>${escapeHtml(evaluatedAt)}</td></tr>
        <tr><td>Report Generated At</td><td>${escapeHtml(generatedAt)}</td></tr>
      </tbody>
    </table>
    <p class="footer">This report is generated from the Online Examination System.</p>
  </main>
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result-report-${result.examId?._id || 'exam'}.html`;
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
