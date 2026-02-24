/**
 * Create Exam - modern UI with document upload for questions
 */
import React, { useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { createExam, uploadQuestions } from '../../services/api';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [examId, setExamId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [suggestedCount, setSuggestedCount] = useState(20);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const handleCreateExam = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await createExam({ title, skill });
      setExamId(data._id);
      setMessage('Exam created. Now add questions below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    }
    setLoading(false);
  };

  const handleUploadQuestions = async () => {
    if (!examId) {
      setError('Create an exam first.');
      return;
    }
    if (!uploadFile) {
      setError('Please upload a .txt or .docx file.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('examId', examId);
      formData.append('suggestedCount', suggestedCount);
      formData.append('file', uploadFile);

      const { data } = await uploadQuestions(formData);
      setMessage(data.message || 'Questions uploaded successfully.');
      toast.success(data.message || 'Questions uploaded successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload questions');
      toast.error('Failed to upload questions');
    }
    setLoading(false);
  };

  return (
    <AdminLayout title="Create Exam">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Create Exam</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the basic details of your exam.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirmCreateOpen(true);
              }}
              className="space-y-3 text-sm"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. JavaScript Basics"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Skill
                </label>
                <input
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  required
                  placeholder="e.g. JavaScript"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
              </div>

              {message && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="mt-1">
                {loading ? 'Creating…' : 'Create Exam'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {examId && (
          <Card>
            <CardHeader className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Upload Questions Document</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a .txt or .docx file. Each line should be:
                  <br />
                  <span className="font-mono text-[11px]">
                    Question | Option 1 | Option 2 | Option 3 | Option 4 | CorrectOption(1-4)
                  </span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirmUploadOpen(true);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Upload file
                  </label>
                  <input
                    type="file"
                    accept=".txt,.docx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="block w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-primary-500 dark:text-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Number of questions (suggestions)
                  </label>
                  <select
                    value={suggestedCount}
                    onChange={(e) => setSuggestedCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  >
                    <option value={20}>20 questions</option>
                    <option value={50}>50 questions</option>
                    <option value={100}>100 questions</option>
                  </select>
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {message}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="mt-1">
                  {loading ? 'Uploading…' : 'Upload & Create Questions'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <ConfirmDialog
        open={confirmCreateOpen}
        title="Create this exam?"
        description="You can still upload questions after creating the exam."
        confirmLabel="Create exam"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setConfirmCreateOpen(false);
          await handleCreateExam();
        }}
        onCancel={() => setConfirmCreateOpen(false)}
      />
      <ConfirmDialog
        open={confirmUploadOpen}
        title="Upload questions for this exam?"
        description="The questions from your file will be stored for this exam."
        confirmLabel="Upload"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setConfirmUploadOpen(false);
          await handleUploadQuestions();
        }}
        onCancel={() => setConfirmUploadOpen(false)}
      />
    </AdminLayout>
  );
}
