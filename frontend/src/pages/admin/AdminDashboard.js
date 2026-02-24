import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { Button } from "../../components/ui/Button";
import { Users, FileText, Clock3, CheckCircle2 } from "lucide-react";
import { getResponses } from "../../services/api";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, examsRes, responsesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/exams"),
          getResponses(),
        ]);

        const allResponses = responsesRes.data || [];
        const pending = allResponses.filter((r) => r.score === null).length;
        const completed = allResponses.filter((r) => r.score !== null).length;

        setStats({
          users: usersRes.data?.length || 0,
          exams: examsRes.data?.length || 0,
          pending,
          completed,
        });
        setResponses(allResponses.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statItems = [
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Total Exams", value: stats.exams, icon: FileText },
    { label: "Pending Evaluations", value: stats.pending, icon: Clock3 },
    { label: "Completed Exams", value: stats.completed, icon: CheckCircle2 },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statItems.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={loading ? "…" : s.value}
              icon={s.icon}
            />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <DataTable
              title="Recent Responses"
              columns={[
                { key: "user", header: "User", render: (r) => r.userId?.name },
                { key: "exam", header: "Exam", render: (r) => r.examId?.title },
                {
                  key: "status",
                  header: "Status",
                  render: (r) =>
                    r.score === null ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Pending
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {r.score}/{r.totalMarks}
                      </span>
                    ),
                },
              ]}
              data={responses}
              loading={loading}
              emptyMessage="No responses yet."
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link to="/admin/create-exam">
                <Button className="w-full justify-start" variant="primary">
                  Create Exam & Add Questions
                </Button>
              </Link>
              <Link to="/admin/assign">
                <Button className="w-full justify-start" variant="secondary">
                  Assign Exam to Users
                </Button>
              </Link>
              <Link to="/admin/responses">
                <Button className="w-full justify-start" variant="secondary">
                  View Submissions & Get Score
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
