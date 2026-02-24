import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { BadgeCheck, ClipboardList } from "lucide-react";

export function ExamCard({ exam, onStart, onViewResult }) {
  const isCompleted = exam.status === "completed";
  const [confirmResultOpen, setConfirmResultOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="flex flex-col gap-3">
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary-500" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {exam.title}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skill: <span className="font-medium">{exam.skill}</span>
              </p>
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {isCompleted ? (
                  <>
                    <BadgeCheck className="h-3 w-3 text-emerald-500" />
                    Completed
                  </>
                ) : (
                  <>Assigned</>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isCompleted && (
                <Button size="sm" onClick={onStart}>
                  Start
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirmResultOpen(true)}
                className="text-xs"
              >
                View Result
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <ConfirmDialog
        open={confirmResultOpen}
        title="View result for this exam?"
        description="You will see the latest evaluated result, if available."
        confirmLabel="View result"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmResultOpen(false);
          onViewResult && onViewResult();
        }}
        onCancel={() => setConfirmResultOpen(false)}
      />
    </>
  );
}

