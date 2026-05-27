import { Router } from "express";
import { register, login, logout, getCurrentUser, refreshToken, forgotPassword, googleCallback } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/google-callback", googleCallback);

export default router;
