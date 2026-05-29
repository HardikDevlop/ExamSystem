import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Search, Trash2, UserRoundCheck, Users } from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { deleteAdminUser, getAdminUsers } from '../../services/api';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [query, setQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers();
      setUsersList((data || []).filter((user) => user.role === 'user'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return usersList;
    return usersList.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }, [query, usersList]);

  const handleDelete = async (userId) => {
    setDeletingId(userId);
    try {
      await deleteAdminUser(userId);
      setUsersList((current) => current.filter((user) => user._id !== userId));
      toast.success('User deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-200">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Registered candidates
                </p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {loading ? '-' : usersList.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <UserRoundCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Manage records
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Name, email, and deletion
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="flex-col items-stretch sm:flex-row sm:items-center">
            <CardTitle>Candidate Users</CardTitle>
            <label className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </label>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No candidate users found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-slate-100 text-xs text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-200"
                      >
                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-50">
                          {user.name}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {user.email}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Button
                            size="sm"
                            variant="danger"
                            className="gap-2"
                            disabled={deletingId !== null}
                            onClick={() => setConfirmUser(user)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
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

      <ConfirmDialog
        open={!!confirmUser}
        title="Delete this user?"
        description={
          confirmUser
            ? `${confirmUser.name} and related submissions will be removed from the database.`
            : ''
        }
        confirmLabel={deletingId === confirmUser?._id ? 'Deleting...' : 'Delete user'}
        cancelLabel="Cancel"
        onConfirm={async () => {
          const userId = confirmUser?._id;
          setConfirmUser(null);
          if (userId) {
            await handleDelete(userId);
          }
        }}
        onCancel={() => setConfirmUser(null)}
      />
    </AdminLayout>
  );
}
