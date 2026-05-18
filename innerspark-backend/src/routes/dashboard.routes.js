import { Router } from "express";
import { getStats, logMood, getMoodHistory, updateStreak, getWeeklyActivity } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", requireAuth, getStats);
router.post("/mood", requireAuth, logMood);
router.get("/mood/history", requireAuth, getMoodHistory);
router.post("/streak", requireAuth, updateStreak);
router.get("/activity", requireAuth, getWeeklyActivity);

export default router;
