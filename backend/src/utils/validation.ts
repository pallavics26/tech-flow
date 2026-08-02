import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const createListSchema = z.object({
  title: z.string().min(1, "Title is required"),
  boardId: z.string().uuid("Invalid board id"),
});

export const updateListSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().optional(),
});

export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  listId: z.string().uuid("Invalid list id"),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().int().optional(),
  listId: z.string().uuid().optional(), // allows moving card to another list
});

export const reorderCardsSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int(),
      listId: z.string().uuid(),
    })
  ),
});

export const reorderListsSchema = z.object({
  lists: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int(),
    })
  ),
});
