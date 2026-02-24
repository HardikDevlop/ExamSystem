import React from "react";
import { cn } from "../../utils/cn";

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-2", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={cn("text-sm font-semibold text-slate-900 dark:text-slate-50", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400", className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn("mt-2", className)}>{children}</div>;
}

