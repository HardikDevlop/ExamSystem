/**
 * View submitted responses and Get Score button
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getResponses, getScore } from '../../services/api';

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoringId, setScoringId] = useState(null);
  const [error, setError] = useState('');
  const [confirmScoreId, setConfirmScoreId] = useState(null);

  const fetchResponses = async () => {
    try {
      const { data } = await getResponses();
      setResponses(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load responses';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleGetScore = async (responseId) => {
    setScoringId(responseId);
    setError('');
    try {
      await getScore(responseId);
      toast.success('Score calculated for this response.');
      await fetchResponses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to calculate score';
      setError(msg);
      toast.error(msg);
    }
    setScoringId(null);
  };

  return (
    <AdminLayout title="Responses">
      <Card>
        <CardHeader>
          <CardTitle>Submitted Responses</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : responses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No submissions yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 text-xs">
              {responses.map((r) => (
                <div
                  key={r._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {r.userId?.name} ({r.userId?.email})
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {r.examId?.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Submitted: {new Date(r.createdAt).toLocaleString()}
                      {r.score !== null &&
                        ` • Score: ${r.score}/${r.totalMarks}`}
                    </p>
                  </div>
                  <div>
                    {r.score === null ? (
                      <Button
                        size="sm"
                        onClick={() => setConfirmScoreId(r._id)}
                        disabled={scoringId !== null}
                      >
                        {scoringId === r._id ? 'Calculating…' : 'Get Score'}
                      </Button>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Evaluated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!confirmScoreId}
        title="Calculate score for this response?"
        description="The system will evaluate the answers and save the score."
        confirmLabel="Get score"
        cancelLabel="Cancel"
        onConfirm={async () => {
          const id = confirmScoreId;
          setConfirmScoreId(null);
          if (id) {
            await handleGetScore(id);
          }
        }}
        onCancel={() => setConfirmScoreId(null)}
      />
    </AdminLayout>
  );
}
