import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getAdminExamDetail, deleteExam } from '../../services/api';
import api from '../../services/api';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/admin/exams');
        setExams(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load exams';
        setError(msg);
        toast.error(msg);
      }
      setLoading(false);
    };
    fetchExams();
  }, []);

  const handleViewQuestions = async (examId) => {
    setSelectedExamId(examId);
    setDetailLoading(true);
    setExamDetail(null);
    try {
      const { data } = await getAdminExamDetail(examId);
      setExamDetail(data);
      toast.success('Loaded exam questions.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load exam questions';
      setError(msg);
      toast.error(msg);
    }
    setDetailLoading(false);
  };

  return (
    <AdminLayout title="Exams">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>All Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : exams.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No exams created yet.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {exams.map((exam) => (
                  <div
                    key={exam._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {exam.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Skill: {exam.skill}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewQuestions(exam._id)}
                      >
                        View Questions
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteId(exam._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {detailLoading && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!detailLoading && !examDetail && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select an exam to view its questions.
              </p>
            )}
            {!detailLoading && examDetail && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {examDetail.exam.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Skill: {examDetail.exam.skill}
                  </p>
                </div>
                {examDetail.questions.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No questions added for this exam yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {examDetail.questions.map((q, idx) => (
                      <div
                        key={q._id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                      >
                        <p className="font-semibold">
                          Q{idx + 1}. {q.question}
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                          {q.options.map((opt, oIdx) => (
                            <li
                              key={oIdx}
                              className={
                                oIdx === q.correctAnswer
                                  ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-600 dark:text-slate-300'
                              }
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={!!deleteId}
        title="Delete this exam?"
        description="This will permanently remove the exam, its questions, and all related responses."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          const id = deleteId;
          setDeleteId(null);
          if (!id) return;
          try {
            await deleteExam(id);
            setExams((prev) => prev.filter((e) => e._id !== id));
            if (selectedExamId === id) {
              setSelectedExamId(null);
              setExamDetail(null);
            }
            toast.success('Exam deleted.');
          } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete exam';
            setError(msg);
            toast.error(msg);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}

