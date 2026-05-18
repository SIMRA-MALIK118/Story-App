import { Router } from "express";
import { getNotifications, getUnreadCount, markAllRead } from "../controllers/notifications.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.put("/read", requireAuth, markAllRead);

export default router;
