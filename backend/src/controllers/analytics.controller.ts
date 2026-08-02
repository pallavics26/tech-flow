import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// GET /api/analytics
export async function getAnalytics(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  // Fetch all boards owned by this user, with lists and cards
  const boards = await prisma.board.findMany({
    where: { ownerId: userId },
    include: {
      lists: {
        include: { cards: true },
      },
    },
  });

  let totalTasks = 0;
  let completedTasks = 0;
  const tasksPerList: Record<string, number> = {};
  let tasksThisWeek = 0;
  let tasksLastWeek = 0;

  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  for (const board of boards) {
    for (const list of board.lists) {
      const isDoneList = /done|completed/i.test(list.title);
      const listKey = list.title;
      tasksPerList[listKey] = (tasksPerList[listKey] || 0) + list.cards.length;

      for (const card of list.cards) {
        totalTasks++;
        if (isDoneList) completedTasks++;

        const createdAt = new Date(card.createdAt);
        if (createdAt >= startOfThisWeek) {
          tasksThisWeek++;
        } else if (createdAt >= startOfLastWeek && createdAt < startOfThisWeek) {
          tasksLastWeek++;
        }
      }
    }
  }

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    totalTasks,
    completedTasks,
    completionRate,
    tasksPerList,
    tasksThisWeek,
    tasksLastWeek,
  });
}