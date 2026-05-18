import { Router } from "express";
import { getFeed, getTrending, getStoryById, createStory, updateStory, deleteStory, getUserStories, saveStory } from "../controllers/story.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.get("/feed", optionalAuth, getFeed);
router.get("/trending", optionalAuth, getTrending);
router.get("/user/:userId", optionalAuth, getUserStories);
router.post("/", requireAuth, upload.single("cover_image"), createStory);
router.put("/:id", requireAuth, upload.single("cover_image"), updateStory);
router.delete("/:id", requireAuth, deleteStory);
router.post("/:id/save", requireAuth, saveStory);
router.get("/:id", optionalAuth, getStoryById);

export default router;
