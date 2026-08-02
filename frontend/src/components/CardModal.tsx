"use client";

import { useState, FormEvent } from "react";
import { Card } from "@/types";
import api from "@/lib/axios";

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onSave: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
}

export default function CardModal({
  card,
  onClose,
  onSave,
  onDelete,
}: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(card.id, title, description);
    onClose();
  }

  async function handleSuggestPriority() {
    setSuggesting(true);
    setSuggestError("");
    try {
      const res = await api.post(`/cards/${card.id}/suggest-priority`);
      setPriority(res.data.card.priority);
    } catch (err) {
      setSuggestError("Couldn't get a suggestion, try again.");
    } finally {
      setSuggesting(false);
    }
  }

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl w-full max-w-md p-6 shadow-xl border border-transparent dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a more detailed description..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSuggestPriority}
              disabled={suggesting}
              className="text-sm px-3 py-1.5 rounded-lg border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition disabled:opacity-50"
            >
              {suggesting ? "Thinking..." : "Suggest Priority"}
            </button>
            {priority && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${priorityColors[priority] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
              >
                {priority}
              </span>
            )}
          </div>
          {suggestError && (
            <p className="text-xs text-red-500 dark:text-red-400">{suggestError}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onDelete(card.id);
                onClose();
              }}
              className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
            >
              Delete card
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}