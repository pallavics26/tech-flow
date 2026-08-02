"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import { Board } from "@/types";

const accentColors = [
  { bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-400" },
  { bar: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
  { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-500" },
  { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
];

function getAccent(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return accentColors[Math.abs(hash) % accentColors.length];
}

function DashboardContent() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const res = await api.get("/boards");
      setBoards(res.data.boards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(e: FormEvent) {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/boards", { title: newBoardTitle });
      setBoards([res.data.board, ...boards]);
      setNewBoardTitle("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBoard(id: string) {
    if (!confirm("Delete this board? This cannot be undone.")) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards(boards.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Boards</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition"
          >
            + New Board
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateBoard}
            className="mb-6 flex gap-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <input
              autoFocus
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Board title (e.g. Placement Prep)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading boards...</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              You don&apos;t have any boards yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-brand-500 font-medium"
            >
              Create your first board →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => {
              const accent = getAccent(board.title);
              return (
                <div
                  key={board.id}
                  className="group relative bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md dark:hover:shadow-none dark:hover:border-gray-700 transition"
                >
                  <div className={`h-1.5 ${accent.bar}`} />
                  <Link href={`/board/${board.id}`} className="block p-5">
                    <h2 className="font-semibold text-lg mb-1 pr-6">
                      {board.title}
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created {new Date(board.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteBoard(board.id)}
                    className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    title="Delete board"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}