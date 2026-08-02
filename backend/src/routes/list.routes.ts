import { Router } from "express";
import {
  createList,
  updateList,
  deleteList,
  reorderLists,
} from "../controllers/list.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createList);
router.patch("/reorder", reorderLists); // must be before /:id to avoid route clash
router.patch("/:id", updateList);
router.delete("/:id", deleteList);

export default router;
