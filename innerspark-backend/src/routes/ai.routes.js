import { Router } from "express";
import { generateStory, generateQuote } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { aiRateLimit } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/generate", requireAuth, aiRateLimit, generateStory);
router.get("/quote", generateQuote);

export default router;
