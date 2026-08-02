import { Router } from "express";
import {
  getBoards,
  getBoardById,
  createBoard,
  deleteBoard,
} from "../controllers/board.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware); // all board routes require auth

router.get("/", getBoards);
router.get("/:id", getBoardById);
router.post("/", createBoard);
router.delete("/:id", deleteBoard);

export default router;
