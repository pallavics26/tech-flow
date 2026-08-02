import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createBoardSchema } from "../utils/validation";

// GET /api/boards - all boards owned by the logged-in user
export async function getBoards(req: AuthRequest, res: Response) {
  const boards = await prisma.board.findMany({
    where: { ownerId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });

  res.json({ boards });
}

// GET /api/boards/:id - single board with lists + cards (nested, ordered)
export async function getBoardById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const board = await prisma.board.findFirst({
    where: { id, ownerId: req.user!.userId },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: { orderBy: { position: "asc" } },
        },
      },
    },
  });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  res.json({ board });
}

// POST /api/boards
export async function createBoard(req: AuthRequest, res: Response) {
  const parsed = createBoardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const board = await prisma.board.create({
    data: {
      title: parsed.data.title,
      ownerId: req.user!.userId,
    },
  });

  res.status(201).json({ board });
}

// DELETE /api/boards/:id
export async function deleteBoard(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const board = await prisma.board.findFirst({
    where: { id, ownerId: req.user!.userId },
  });

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  await prisma.board.delete({ where: { id } });

  res.json({ message: "Board deleted successfully" });
}
