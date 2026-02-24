import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getExam, submitExam, getResult } from '../services/api';
import { UserLayout } from '../components/layout/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const EXAM_DURATION_MINUTES = 15;

export default function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MINUTES * 60);
  const [started, setStarted] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getExam(id);
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam');
      }
      // Also check if user has already submitted this exam
      try {
        const res = await getResult(id);
        if (res.data?.response) {
          setHasSubmitted(true);
        }
      } catch (err) {
        // If 404 (no submission), ignore. Any other error we surface.
        const status = err.response?.status;
        if (status && status !== 404) {
          setError(err.response?.data?.message || 'Failed to check submission status');
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [started, timeLeft]);

  const handleOptionChange = (questionIndex, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
  };

  const performSubmit = async () => {
    const answersArray = Object.entries(answers).map(
      ([questionIndex, selectedOption]) => ({
        questionIndex: parseInt(questionIndex, 10),
        selectedOption,
      })
    );
    if (answersArray.length !== questions.length) {
      setError('Please answer all questions before submitting.');
      toast.error('Please answer all questions.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitExam({ examId: id, answers: answersArray });
      toast.success('Exam submitted successfully.');
      setHasSubmitted(true);
      // Mark this exam as submitted in localStorage so dashboard cards can reflect it
      try {
        const raw = localStorage.getItem('submittedExams');
        const parsed = raw ? JSON.parse(raw) : [];
        if (!parsed.includes(id)) {
          parsed.push(id);
          localStorage.setItem('submittedExams', JSON.stringify(parsed));
        }
      } catch {
        // ignore localStorage errors
      }
      navigate(`/result?examId=${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submit failed';
      setError(msg);
      toast.error('Failed to submit exam.');
    }
    setSubmitting(false);
  };

  const handleSubmitClick = () => {
    setConfirmSubmitOpen(true);
  };

  const total = questions.length;
  const progress = total ? ((currentIndex + 1) / total) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, '0');

  if (loading) {
    return (
      <UserLayout title="Exam">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </UserLayout>
    );
  }

  if (error && !exam) {
    return (
      <UserLayout title="Exam">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </UserLayout>
    );
  }

  const currentQuestion = questions[currentIndex];

  // If user has already submitted, show info + link instead of questions
  if (!loading && exam && hasSubmitted) {
    return (
      <UserLayout title={exam.title}>
        <Card className="space-y-3">
          <CardHeader>
            <CardTitle>{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>You have already submitted this exam. You cannot submit it again.</p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/result?examId=${id}`)}
            >
              View my result
            </Button>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout title={exam?.title || 'Exam'}>
      {exam && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl bg-white/80 p-4 shadow-soft dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Skill
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {exam.skill}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Time Remaining
                </p>
                <p className="font-mono text-lg font-semibold text-primary-600 dark:text-primary-300">
                  {minutes}:{seconds}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Question {currentIndex + 1} of {total}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {currentQuestion && (
            <motion.div
              key={currentQuestion._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle>
                    Q{currentIndex + 1}. {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentQuestion.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <input
                        type="radio"
                        className="h-4 w-4 text-primary-600"
                        name={`q${currentIndex}`}
                        checked={answers[currentIndex] === optIdx}
                        onChange={() => {
                          if (!started) setStarted(true);
                          handleOptionChange(currentIndex, optIdx);
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentIndex === total - 1}
                onClick={() =>
                  setCurrentIndex((idx) => Math.min(total - 1, idx + 1))
                }
              >
                Next
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleSubmitClick}
              disabled={submitting || total === 0}
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmSubmitOpen}
        title="Submit exam?"
        description="Once you submit, you will not be able to change your answers."
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmSubmitOpen(false);
          performSubmit();
        }}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </UserLayout>
  );
}
