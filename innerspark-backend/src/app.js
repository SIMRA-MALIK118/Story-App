import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { generalRateLimit } from "./middleware/rateLimit.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import storyRoutes from "./routes/story.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimit);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "InnerSpark API", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", reactionRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error", errors: err.errors || [] });
});

export default app;
