import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

export function DataTable({ title, columns, data, loading, emptyMessage }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 font-medium">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.length > 0
                ? data.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 text-xs text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-200"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-2">
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={columns.length} className="px-3 py-6 text-center text-xs text-slate-500">
                        {emptyMessage || "No data available"}
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

