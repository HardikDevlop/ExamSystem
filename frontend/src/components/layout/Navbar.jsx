import React from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { MoonStar, SunMedium, UserCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

export function Navbar({ title }) {
  const { theme, toggleTheme } = useTheme();
  const userName = localStorage.getItem("userName") || "User";

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-2">
        {title && (
          <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <SunMedium className="h-4 w-4" />
          ) : (
            <MoonStar className="h-4 w-4" />
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 text-xs"
        >
          <UserCircle2 className="h-5 w-5 text-primary-500" />
          <span className="hidden sm:inline text-slate-700 dark:text-slate-200">
            {userName}
          </span>
        </Button>
      </div>
    </header>
  );
}

