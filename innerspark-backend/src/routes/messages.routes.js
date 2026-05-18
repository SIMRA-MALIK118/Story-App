import { Router } from "express";
import { getConversations, getMessages, sendMessage, getUnreadCount } from "../controllers/messages.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getConversations);
router.get("/unread", requireAuth, getUnreadCount);
router.get("/:userId", requireAuth, getMessages);
router.post("/:userId", requireAuth, sendMessage);

export default router;
