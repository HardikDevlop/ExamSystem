import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Users,
  FileText,
  LogOut,
  ClipboardList,
  UserCircle2,
  BookOpenText,
} from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/create-exam", label: "Create Exam", icon: FilePlus2 },
  { to: "/admin/exams", label: "Exams", icon: BookOpenText },
  { to: "/admin/assign", label: "Assign Exam", icon: Users },
  { to: "/admin/responses", label: "Responses", icon: FileText },
];

const userLinks = [
  { to: "/dashboard", label: "My Exams", icon: ClipboardList },
  { to: "/result", label: "Results", icon: ListChecks },
];

export function Sidebar({ role = "admin", onLogout }) {
  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {role === "admin" ? "Admin" : "Candidate"}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Online Exam
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 text-sm">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                "text-slate-600 hover:bg-primary-50 hover:text-primary-700",
                "dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-200",
                isActive &&
                  "bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-200"
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

