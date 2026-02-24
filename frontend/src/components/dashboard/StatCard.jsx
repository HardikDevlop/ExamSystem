import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { cn } from "../../utils/cn";

export function StatCard({ label, value, icon: Icon, accentClass }) {
  return (
    <Card className="flex flex-col gap-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {Icon && (
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-slate-800 dark:text-primary-300",
                accentClass
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

