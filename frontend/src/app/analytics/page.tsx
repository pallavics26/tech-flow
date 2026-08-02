"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksPerList: Record<string, number>;
  tasksThisWeek: number;
  tasksLastWeek: number;
}

const accentColors = [
  { text: "text-brand-600 dark:text-brand-400" },
  { text: "text-teal-600 dark:text-teal-400" },
  { text: "text-violet-600 dark:text-violet-400" },
  { text: "text-amber-600 dark:text-amber-500" },
];

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get("/analytics");
        setData(res.data);
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const chartData = data
    ? Object.entries(data.tasksPerList).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const isDark = theme === "dark";
  const gridColor = isDark ? "#27272a" : "#e5e7eb";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const barColor = isDark ? "#fb7360" : "#f2603f";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#3f3f46" : "#e5e7eb";
  const tooltipText = isDark ? "#f4f4f5" : "#111827";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-canvas-dark">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">
            Analytics
          </h1>

          {loading && (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          )}
          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

          {data && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Tasks"
                  value={data.totalTasks}
                  accent={accentColors[0]}
                />
                <StatCard
                  label="Completed"
                  value={data.completedTasks}
                  accent={accentColors[1]}
                />
                <StatCard
                  label="Completion Rate"
                  value={data.completionRate + "%"}
                  accent={accentColors[2]}
                />
                <StatCard
                  label="This Week"
                  value={data.tasksThisWeek}
                  accent={accentColors[3]}
                />
              </div>

              <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  Tasks per List
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: "1px solid " + tooltipBorder,
                        borderRadius: "8px",
                        color: tooltipText,
                      }}
                      labelStyle={{ color: tooltipText }}
                      cursor={{
                        fill: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.03)",
                      }}
                    />
                    <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard(props: {
  label: string;
  value: string | number;
  accent: { text: string };
}) {
  return (
    <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {props.label}
      </p>
      <p className={"text-2xl font-bold " + props.accent.text}>
        {props.value}
      </p>
    </div>
  );
}