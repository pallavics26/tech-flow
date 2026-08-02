"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "@/types";

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string) => void;
}

const priorityDot: Record<string, string> = {
  High: "bg-brand-500",
  Medium: "bg-amber-500",
  Low: "bg-teal-500",
};

export default function Card({ card, onEdit, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { type: "Card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-900 border-2 border-brand-400 rounded-lg h-[52px] opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(card)}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2.5 shadow-sm hover:shadow-md dark:hover:border-gray-700 transition cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {card.priority && (
            <span
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityDot[card.priority] || "bg-gray-400"}`}
              title={`${card.priority} priority`}
            />
          )}
          <p className="text-sm text-gray-800 dark:text-gray-100 break-words">
            {card.title}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          className="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-xs shrink-0"
        >
          ✕
        </button>
      </div>
      {card.description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
          {card.description}
        </p>
      )}
    </div>
  );
}