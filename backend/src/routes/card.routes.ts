import { Router } from "express";
import {
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
  suggestPriority,
} from "../controllers/card.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createCard);
router.patch("/reorder", reorderCards); // must be before /:id to avoid route clash
router.post("/:id/suggest-priority", suggestPriority);
router.patch("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;