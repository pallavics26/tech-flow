"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
              T
            </div>
            Tech-Flow
          </Link>
          <Link
            href="/analytics"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 transition"
          >
            Analytics
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {user && (
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {user.name}
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}