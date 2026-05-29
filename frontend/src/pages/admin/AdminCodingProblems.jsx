import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  listCodingProblems,
  createCodingProblem,
  getProblemSubmissions,
  setSubmissionMarks,
  publishSubmission,
} from '../../services/api';

export default function AdminCodingProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    timeLimit: 2,
    languageSupport: ['js'],
  });

  const [marksEditing, setMarksEditing] = useState({ id: null, value: '' });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await listCodingProblems();
        setProblems(data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load coding problems';
        setError(msg);
        toast.error(msg);
      }
      setLoading(false);
    };
    fetchProblems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...newProblem,
        languageSupport: newProblem.languageSupport,
      };
      const { data } = await createCodingProblem(payload);
      setProblems((prev) => [data, ...prev]);
      setNewProblem({
        title: '',
        description: '',
        timeLimit: 2,
        languageSupport: ['js'],
      });
      toast.success('Coding problem created.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create problem';
      toast.error(msg);
    }
    setCreating(false);
  };

  const loadSubmissions = async (problemId) => {
    setSelectedProblemId(problemId);
    setSubsLoading(true);
    setSubmissions([]);
    try {
      const { data } = await getProblemSubmissions(problemId);
      setSubmissions(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load submissions';
      toast.error(msg);
    }
    setSubsLoading(false);
  };

  const handleMarksSave = async () => {
    if (!marksEditing.id) return;
    const value = Number(marksEditing.value);
    if (Number.isNaN(value)) {
      toast.error('Marks must be a number.');
      return;
    }
    try {
      const { data } = await setSubmissionMarks(marksEditing.id, value);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === marksEditing.id ? { ...s, marks: value } : s))
      );
      toast.success('Marks updated.');
      setMarksEditing({ id: null, value: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to set marks';
      toast.error(msg);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishSubmission(id);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, published: true } : s))
      );
      toast.success('Result published.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish result';
      toast.error(msg);
    }
  };

  return (
    <AdminLayout title="Coding Problems">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Coding Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Title
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  value={newProblem.title}
                  onChange={(e) =>
                    setNewProblem((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  rows={3}
                  value={newProblem.description}
                  onChange={(e) =>
                    setNewProblem((p) => ({ ...p, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Time limit (seconds)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    value={newProblem.timeLimit}
                    onChange={(e) =>
                      setNewProblem((p) => ({ ...p, timeLimit: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Languages
                  </label>
                  <select
                    multiple
                    className="h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                    value={newProblem.languageSupport}
                    onChange={(e) =>
                      setNewProblem((p) => ({
                        ...p,
                        languageSupport: Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value
                        ),
                      }))
                    }
                  >
                    <option value="js">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Test case configuration (public/hidden inputs & outputs) can be managed
                via the backend or a dedicated editor later.
              </p>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create Problem'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Problems</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : problems.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No coding problems created yet.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {problems.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Time: {p.timeLimit}s • Languages:{' '}
                        {(p.languageSupport || []).join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => loadSubmissions(p._id)}
                    >
                      View Submissions
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {subsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !selectedProblemId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a coding problem to view its submissions.
              </p>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No submissions yet for this problem.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <th className="px-3 py-2">Candidate</th>
                      <th className="px-3 py-2">Runs</th>
                      <th className="px-3 py-2">Submits</th>
                      <th className="px-3 py-2">Accuracy</th>
                      <th className="px-3 py-2">Last Submit</th>
                      <th className="px-3 py-2">Marks</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 text-xs text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-200"
                      >
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {s.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{s.runCount}</td>
                        <td className="px-3 py-2">{s.submitCount}</td>
                        <td className="px-3 py-2">{s.accuracy ?? 0}%</td>
                        <td className="px-3 py-2">
                          {s.lastSubmit
                            ? new Date(s.lastSubmit).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-3 py-2">
                          {marksEditing.id === s.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                className="w-16 rounded border border-slate-300 bg-white px-1 py-0.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                                value={marksEditing.value}
                                onChange={(e) =>
                                  setMarksEditing((m) => ({
                                    ...m,
                                    value: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleMarksSave}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <span>{s.marks ?? '-'}</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {s.published ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Published
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setMarksEditing({ id: s.id, value: s.marks ?? '' })
                              }
                            >
                              Give Marks
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={s.published}
                              onClick={() => handlePublish(s.id)}
                            >
                              Publish
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

