import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createListSchema,
  updateListSchema,
  reorderListsSchema,
} from "../utils/validation";

// Helper: confirms the board belongs to the logged-in user
async function assertBoardOwnership(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });
  return board;
}

// POST /api/lists
export async function createList(req: AuthRequest, res: Response) {
  const parsed = createListSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, boardId } = parsed.data;

  const board = await assertBoardOwnership(boardId, req.user!.userId);
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
  });
  const position = lastList ? lastList.position + 1 : 0;

  const list = await prisma.list.create({
    data: { title, boardId, position },
    include: { cards: true },
  });

  res.status(201).json({ list });
}

// PATCH /api/lists/:id
export async function updateList(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const parsed = updateListSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const existing = await prisma.list.findUnique({
    where: { id },
    include: { board: true },
  });

  if (!existing || existing.board.ownerId !== req.user!.userId) {
    return res.status(404).json({ message: "List not found" });
  }

  const list = await prisma.list.update({
    where: { id },
    data: parsed.data,
  });

  res.json({ list });
}

// DELETE /api/lists/:id
export async function deleteList(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.list.findUnique({
    where: { id },
    include: { board: true },
  });

  if (!existing || existing.board.ownerId !== req.user!.userId) {
    return res.status(404).json({ message: "List not found" });
  }

  await prisma.list.delete({ where: { id } });

  res.json({ message: "List deleted successfully" });
}

// PATCH /api/lists/reorder - bulk update positions after drag-drop
export async function reorderLists(req: AuthRequest, res: Response) {
  const parsed = reorderListsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { lists } = parsed.data;

  // Verify ownership via the first list's board (all lists belong to the same board on the client)
  if (lists.length > 0) {
    const firstList = await prisma.list.findUnique({
      where: { id: lists[0].id },
      include: { board: true },
    });
    if (!firstList || firstList.board.ownerId !== req.user!.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
  }

  await prisma.$transaction(
    lists.map((l) =>
      prisma.list.update({
        where: { id: l.id },
        data: { position: l.position },
      })
    )
  );

  res.json({ message: "Lists reordered successfully" });
}
