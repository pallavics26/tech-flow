"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ListComponent from "@/components/List";
import CardComponent from "@/components/Card";
import CardModal from "@/components/CardModal";
import api from "@/lib/axios";
import { Board, List, Card } from "@/types";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

function BoardContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const [activeList, setActiveList] = useState<List | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeUsers, setActiveUsers] = useState<
    { userId: string; name: string }[]
  >([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("join-board", { boardId: id, userId: user.id, name: user.name });

    socket.on("presence:update", (users: { userId: string; name: string }[]) => {
      setActiveUsers(users);
    });

    socket.on("card:created", (card) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === card.listId ? { ...l, cards: [...l.cards, card] } : l
        )
      );
    });

    socket.on("card:updated", (updatedCard) => {
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === updatedCard.id ? { ...c, ...updatedCard } : c
          ),
        }))
      );
    });

    socket.on("card:deleted", ({ id: deletedId }: { id: string }) => {
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          cards: l.cards.filter((c) => c.id !== deletedId),
        }))
      );
    });

    socket.on("cards:reordered", () => {
      fetchBoard();
    });

    return () => {
      socket.emit("leave-board", id);
      socket.off("presence:update");
      socket.off("card:created");
      socket.off("card:updated");
      socket.off("card:deleted");
      socket.off("cards:reordered");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function fetchBoard() {
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data.board);
      setLists(res.data.board.lists || []);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  // ---------- List actions ----------
  async function handleAddList(e: FormEvent) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await api.post("/lists", { title: newListTitle, boardId: id });
      setLists([...lists, { ...res.data.list, cards: [] }]);
      setNewListTitle("");
      setAddingList(false);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteList(listId: string) {
    if (!confirm("Delete this list and all its cards?")) return;
    setLists(lists.filter((l) => l.id !== listId));
    try {
      await api.delete(`/lists/${listId}`);
    } catch (err) {
      console.error(err);
      fetchBoard();
    }
  }

  async function handleUpdateListTitle(listId: string, title: string) {
    setLists(lists.map((l) => (l.id === listId ? { ...l, title } : l)));
    try {
      await api.patch(`/lists/${listId}`, { title });
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Card actions ----------
  async function handleAddCard(listId: string, title: string) {
    try {
      const res = await api.post("/cards", { title, listId });
      setLists(
        lists.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, res.data.card] } : l
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteCard(cardId: string) {
    setLists(
      lists.map((l) => ({
        ...l,
        cards: l.cards.filter((c) => c.id !== cardId),
      }))
    );
    try {
      await api.delete(`/cards/${cardId}`);
    } catch (err) {
      console.error(err);
      fetchBoard();
    }
  }

  async function handleSaveCard(
    cardId: string,
    title: string,
    description: string
  ) {
    setLists(
      lists.map((l) => ({
        ...l,
        cards: l.cards.map((c) =>
          c.id === cardId ? { ...c, title, description } : c
        ),
      }))
    );
    try {
      await api.patch(`/cards/${cardId}`, { title, description });
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Drag and Drop ----------
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "List") {
      setActiveList(active.data.current.list);
    } else if (active.data.current?.type === "Card") {
      setActiveCard(active.data.current.card);
    }
  }

  function findListByCardId(cardId: string): List | undefined {
    return lists.find((l) => l.cards.some((c) => c.id === cardId));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    if (!isActiveCard) return;

    const isOverCard = over.data.current?.type === "Card";
    const isOverList = over.data.current?.type === "List";

    if (isOverCard) {
      setLists((prev) => {
        const sourceList = prev.find((l) =>
          l.cards.some((c) => c.id === activeId)
        );
        const targetList = prev.find((l) =>
          l.cards.some((c) => c.id === overId)
        );
        if (!sourceList || !targetList) return prev;

        if (sourceList.id === targetList.id) {
          const oldIndex = sourceList.cards.findIndex((c) => c.id === activeId);
          const newIndex = sourceList.cards.findIndex((c) => c.id === overId);
          const reordered = arrayMove(sourceList.cards, oldIndex, newIndex);
          return prev.map((l) =>
            l.id === sourceList.id ? { ...l, cards: reordered } : l
          );
        } else {
          const movingCard = sourceList.cards.find((c) => c.id === activeId)!;
          const newSourceCards = sourceList.cards.filter(
            (c) => c.id !== activeId
          );
          const overIndex = targetList.cards.findIndex((c) => c.id === overId);
          const newTargetCards = [...targetList.cards];
          newTargetCards.splice(overIndex, 0, {
            ...movingCard,
            listId: targetList.id,
          });

          return prev.map((l) => {
            if (l.id === sourceList.id) return { ...l, cards: newSourceCards };
            if (l.id === targetList.id) return { ...l, cards: newTargetCards };
            return l;
          });
        }
      });
    }

    if (isOverList) {
      const targetListId = over.data.current?.listId as string;
      setLists((prev) => {
        const sourceList = prev.find((l) =>
          l.cards.some((c) => c.id === activeId)
        );
        const targetList = prev.find((l) => l.id === targetListId);
        if (!sourceList || !targetList || sourceList.id === targetList.id)
          return prev;

        const movingCard = sourceList.cards.find((c) => c.id === activeId)!;
        const newSourceCards = sourceList.cards.filter(
          (c) => c.id !== activeId
        );
        const newTargetCards = [
          ...targetList.cards,
          { ...movingCard, listId: targetList.id },
        ];

        return prev.map((l) => {
          if (l.id === sourceList.id) return { ...l, cards: newSourceCards };
          if (l.id === targetList.id) return { ...l, cards: newTargetCards };
          return l;
        });
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveList(null);
    setActiveCard(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (active.data.current?.type === "List") {
      if (activeId === overId) return;
      const oldIndex = lists.findIndex((l) => l.id === activeId);
      const newIndex = lists.findIndex((l) => l.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(lists, oldIndex, newIndex).map((l, idx) => ({
        ...l,
        position: idx,
      }));
      setLists(reordered);

      try {
        await api.patch("/lists/reorder", {
          lists: reordered.map((l) => ({ id: l.id, position: l.position })),
        });
      } catch (err) {
        console.error(err);
        fetchBoard();
      }
      return;
    }

    if (active.data.current?.type === "Card") {
      const affectedLists = lists;
      const payload = affectedLists.flatMap((l) =>
        l.cards.map((c, idx) => ({ id: c.id, position: idx, listId: l.id }))
      );

      try {
        await api.patch("/cards/reorder", { cards: payload });
      } catch (err) {
        console.error(err);
        fetchBoard();
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
          Loading board...
        </p>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ←
        </Link>
        <h1 className="font-semibold text-lg dark:text-gray-100">{board.title}</h1>
        <div className="flex-1" />
        <div className="flex items-center -space-x-2">
          {activeUsers.map((u) => (
            <div
              key={u.userId}
              title={u.name}
              className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center border-2 border-white dark:border-surface-dark"
            >
              {u.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-4 dark:bg-canvas-dark">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 h-full items-start">
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <ListComponent
                  key={list.id}
                  list={list}
                  onDeleteList={handleDeleteList}
                  onUpdateListTitle={handleUpdateListTitle}
                  onAddCard={handleAddCard}
                  onEditCard={setEditingCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </SortableContext>

            <div className="w-72 shrink-0">
              {addingList ? (
                <form
                  onSubmit={handleAddList}
                  className="bg-gray-100 dark:bg-surface-dark rounded-xl p-3 space-y-2"
                >
                  <input
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-brand-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brand-600 transition"
                    >
                      Add list
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingList(false)}
                      className="text-gray-500 dark:text-gray-400 text-sm px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="w-full text-left text-sm text-gray-500 dark:text-gray-400 bg-gray-100/70 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl px-3 py-2.5 transition"
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeList && (
              <div className="w-72 bg-gray-100 dark:bg-surface-dark rounded-xl p-3 shadow-lg rotate-2">
                <p className="text-sm font-semibold dark:text-gray-100">
                  {activeList.title}
                </p>
              </div>
            )}
            {activeCard && (
              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 shadow-lg rotate-2 w-64">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  {activeCard.title}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {editingCard && (
        <CardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <ProtectedRoute>
      <BoardContent />
    </ProtectedRoute>
  );
}