"use client";

import { useState, FormEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { List as ListType, Card as CardType } from "@/types";
import CardComponent from "./Card";

interface ListProps {
  list: ListType;
  onDeleteList: (id: string) => void;
  onUpdateListTitle: (id: string, title: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string) => void;
}

export default function List({
  list,
  onDeleteList,
  onUpdateListTitle,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: ListProps) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: list.id, data: { type: "List", list } });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `list-${list.id}`,
    data: { type: "List", listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardIds = list.cards.map((c) => c.id);

  function handleAddCard(e: FormEvent) {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    onAddCard(list.id, newCardTitle);
    setNewCardTitle("");
    setAddingCard(false);
  }

  function handleTitleSave() {
    if (titleDraft.trim() && titleDraft !== list.title) {
      onUpdateListTitle(list.id, titleDraft);
    }
    setEditingTitle(false);
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 shrink-0 bg-gray-100 dark:bg-surface-dark border-2 border-brand-400 rounded-xl h-24 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 shrink-0 bg-gray-100 dark:bg-surface-dark rounded-xl flex flex-col max-h-full border border-transparent dark:border-gray-800"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing"
      >
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
            className="text-sm font-semibold bg-white dark:bg-gray-900 border border-brand-400 rounded px-2 py-1 w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-1"
          >
            {list.title}{" "}
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              {list.cards.length}
            </span>
          </h3>
        )}
        <button
          onClick={() => onDeleteList(list.id)}
          className="text-gray-400 dark:text-gray-600 hover:text-red-500 text-xs px-1"
          title="Delete list"
        >
          ✕
        </button>
      </div>

      <div
        ref={setDroppableRef}
        className="flex-1 overflow-y-auto px-2 space-y-2 pb-2 min-h-[20px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        {addingCard ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              rows={2}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-brand-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brand-600 transition"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingCard(false);
                  setNewCardTitle("");
                }}
                className="text-gray-500 dark:text-gray-400 text-sm px-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full text-left text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}