import { Router } from "express";
import { getProfile, getProfileById, getMyLikedIds, updateProfile, uploadAvatar, uploadBannerImage, followUser, getSavedStories } from "../controllers/user.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.get("/me/saved", requireAuth, getSavedStories);
router.get("/me/liked-ids", requireAuth, getMyLikedIds);
router.put("/me/profile", requireAuth, updateProfile);
router.post("/me/avatar", requireAuth, upload.single("avatar"), uploadAvatar);
router.post("/me/banner", requireAuth, upload.single("banner"), uploadBannerImage);
router.get("/id/:userId", getProfileById);
router.get("/:username", optionalAuth, getProfile);
router.post("/:userId/follow", requireAuth, followUser);

export default router;
