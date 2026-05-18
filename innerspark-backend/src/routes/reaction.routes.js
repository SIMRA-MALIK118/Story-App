import { Router } from "express";
import { toggleLike, getReactions, addComment, getComments } from "../controllers/reaction.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/stories/:storyId/like", requireAuth, toggleLike);
router.get("/stories/:storyId/reactions", optionalAuth, getReactions);
router.post("/stories/:storyId/comments", requireAuth, addComment);
router.get("/stories/:storyId/comments", getComments);

export default router;
