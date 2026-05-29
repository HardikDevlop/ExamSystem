import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { UserLayout } from '../components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import {
  getCodingProblemForUser,
  runCandidateCode,
  submitCandidateCode,
} from '../services/api';

const AUTO_SAVE_INTERVAL_MS = 30000;

export default function CodingExam() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [language, setLanguage] = useState('js');
  const [code, setCode] = useState('');
  const [runResults, setRunResults] = useState([]);
  const [submitResults, setSubmitResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null); // seconds, optional

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await getCodingProblemForUser(problemId);
        setProblem(data);
        if (data.languageSupport && data.languageSupport.length) {
          setLanguage(data.languageSupport[0]);
        }
        // Load draft from localStorage
        const draftKey = `coding_draft_${problemId}`;
        const stored = localStorage.getItem(draftKey);
        if (stored) {
          setCode(stored);
        }
        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60); // treat timeLimit as minutes for UI
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load coding problem');
      }
      setLoading(false);
    };
    fetchProblem();
  }, [problemId]);

  // Auto-save draft
  useEffect(() => {
    if (!problemId) return;
    const key = `coding_draft_${problemId}`;
    const interval = setInterval(() => {
      localStorage.setItem(key, code || '');
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [code, problemId]);

  // Optional timer auto-submit (using timeLeft if set)
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      // Auto-submit last code
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setRunResults([]);
    try {
      const { data } = await runCandidateCode(problemId, { code, language });
      setRunResults(data.results || []);
      toast.success('Code run on public test cases.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run code');
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setSubmitResults([]);
    try {
      const { data } = await submitCandidateCode(problemId, { code, language });
      setSubmitResults(data.results || []);
      toast.success('Submission received.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit code');
    }
    setSubmitting(false);
  };

  const renderResultsGrid = (title, results) => {
    if (!results || !results.length) return null;
    const passed = results.filter((r) => r.status === 'PASS').length;
    const total = results.length;
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {results.map((r) => (
              <div
                key={r.index}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="font-medium">TC{r.index}</span>
                <span
                  className={
                    r.status === 'PASS'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500 dark:text-red-400'
                  }
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Passed: {passed} / {total}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <UserLayout title="Coding Exam">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </UserLayout>
    );
  }

  if (error || !problem) {
    return (
      <UserLayout title="Coding Exam">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error || 'Problem not found'}
        </p>
      </UserLayout>
    );
  }

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
  const seconds = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null;

  return (
    <UserLayout title={problem.title}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{problem.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
            <p className="whitespace-pre-wrap text-xs sm:text-sm">
              {problem.description}
            </p>
            {problem.constraints && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Constraints
                </p>
                <p className="whitespace-pre-wrap text-xs">
                  {problem.constraints}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Languages:{' '}
                <span className="font-medium">
                  {(problem.languageSupport || []).join(', ')}
                </span>
              </span>
              {timeLeft !== null && (
                <span>
                  Time remaining:{' '}
                  <span className="font-mono font-semibold text-primary-600 dark:text-primary-300">
                    {minutes}:{seconds}
                  </span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Code Editor</CardTitle>
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {(problem.languageSupport || ['js']).map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'js' ? 'JavaScript' : lang === 'python' ? 'Python' : 'C++'}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="h-64 w-full md:h-80">
              <Editor
                height="100%"
                defaultLanguage={
                  language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'javascript'
                }
                language={
                  language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'javascript'
                }
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Code auto-saves every 30 seconds.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={running}
                  onClick={handleRun}
                >
                  {running ? 'Running…' : 'Run (Public TCs)'}
                </Button>
                <Button
                  size="sm"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {renderResultsGrid('Public Test Cases (Run)', runResults)}
      {renderResultsGrid('Hidden Test Cases (Submit)', submitResults)}
    </UserLayout>
  );
}

