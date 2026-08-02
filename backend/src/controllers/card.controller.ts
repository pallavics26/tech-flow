import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createCardSchema,
  updateCardSchema,
  reorderCardsSchema,
} from "../utils/validation";
import { suggestCardPriority } from "../utils/gemini";
import { io } from "../server";

// Helper: confirms the list's board belongs to the logged-in user
async function assertListOwnership(listId: string, userId: string) {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { board: true },
  });
  if (!list || list.board.ownerId !== userId) return null;
  return list;
}

// POST /api/cards
export async function createCard(req: AuthRequest, res: Response) {
  const parsed = createCardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, description, listId } = parsed.data;

  const list = await assertListOwnership(listId, req.user!.userId);
  if (!list) {
    return res.status(404).json({ message: "List not found" });
  }

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
  });
  const position = lastCard ? lastCard.position + 1 : 0;

  const card = await prisma.card.create({
    data: { title, description, listId, position },
  });

  io.to(`board:${list.boardId}`).emit("card:created", card);

  res.status(201).json({ card });
}

// PATCH /api/cards/:id
export async function updateCard(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const parsed = updateCardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const existing = await prisma.card.findUnique({
    where: { id },
    include: { list: { include: { board: true } } },
  });

  if (!existing || existing.list.board.ownerId !== req.user!.userId) {
    return res.status(404).json({ message: "Card not found" });
  }

  // If moving to a different list, verify ownership of the target list too
  if (parsed.data.listId && parsed.data.listId !== existing.listId) {
    const targetList = await assertListOwnership(
      parsed.data.listId,
      req.user!.userId
    );
    if (!targetList) {
      return res.status(404).json({ message: "Target list not found" });
    }
  }

  const card = await prisma.card.update({
    where: { id },
    data: parsed.data,
  });

  io.to(`board:${existing.list.boardId}`).emit("card:updated", card);

  res.json({ card });}

// DELETE /api/cards/:id
export async function deleteCard(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.card.findUnique({
    where: { id },
    include: { list: { include: { board: true } } },
  });

  if (!existing || existing.list.board.ownerId !== req.user!.userId) {
    return res.status(404).json({ message: "Card not found" });
  }

  await prisma.card.delete({ where: { id } });

  io.to(`board:${existing.list.boardId}`).emit("card:deleted", { id });

  res.json({ message: "Card deleted successfully" });
}

// PATCH /api/cards/reorder - bulk update after drag-drop
// Handles both: reordering within the same list, and moving across lists
export async function reorderCards(req: AuthRequest, res: Response) {
  const parsed = reorderCardsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { cards } = parsed.data;

  if (cards.length > 0) {
    const firstCard = await prisma.card.findUnique({
      where: { id: cards[0].id },
      include: { list: { include: { board: true } } },
    });
    if (!firstCard || firstCard.list.board.ownerId !== req.user!.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
  }

  await prisma.$transaction(
    cards.map((c) =>
      prisma.card.update({
        where: { id: c.id },
        data: { position: c.position, listId: c.listId },
      })
    )
  );

  if (cards.length > 0) {
    const firstCard = await prisma.card.findUnique({
      where: { id: cards[0].id },
      include: { list: { include: { board: true } } },
    });
    if (firstCard) {
      io.to(`board:${firstCard.list.board.id}`).emit("cards:reordered", cards);
    }
  }

  res.json({ message: "Cards reordered successfully" });
}
// POST /api/cards/:id/suggest-priority
export async function suggestPriority(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.card.findUnique({
    where: { id },
    include: { list: { include: { board: true } } },
  });

  if (!existing || existing.list.board.ownerId !== req.user!.userId) {
    return res.status(404).json({ message: "Card not found" });
  }

  try {
    const suggestion = await suggestCardPriority(
      existing.title,
      existing.description
    );

    const card = await prisma.card.update({
      where: { id },
      data: { priority: suggestion.priority },
    });

    res.json({ card, reason: suggestion.reason });
  } catch (err) {
    console.error("AI suggestion error:", err);
    res.status(502).json({ message: "AI suggestion failed, try again later" });
  }}
