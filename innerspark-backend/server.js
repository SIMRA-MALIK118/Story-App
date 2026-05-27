import { config } from "dotenv";
config();

import http from "http";
import { WebSocketServer } from "ws";
import { clients, broadcastToAll, getOnlineUserIds } from "./src/utils/wsClients.js";

const { default: app } = await import("./src/app.js");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const userId = url.searchParams.get("userId");
  if (!userId) { ws.close(); return; }

  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(ws);

  // Tell this user who's currently online
  try {
    ws.send(JSON.stringify({ type: "online_users", userIds: getOnlineUserIds() }));
  } catch {}

  // Tell everyone else this user just came online
  broadcastToAll({ type: "user_online", userId }, userId);

  ws.on("close", () => {
    clients.get(userId)?.delete(ws);
    if (clients.get(userId)?.size === 0) {
      clients.delete(userId);
      broadcastToAll({ type: "user_offline", userId });
    }
  });

  ws.on("error", () => {
    clients.get(userId)?.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 InnerSpark API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}?userId=<id>`);
  console.log(`🔑 Supabase URL: ${process.env.SUPABASE_URL ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_ANON_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🤖 Groq Key: ${process.env.GROQ_API_KEY ? "✅ loaded" : "❌ MISSING"}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});
