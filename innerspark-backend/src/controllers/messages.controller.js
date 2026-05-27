import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";
import { broadcastToUser } from "../utils/wsClients.js";

export const getConversations = asyncHandler(async (req, res) => {
  const me = req.user.id;

  const { data: msgs, error } = await supabaseAdmin
    .from("messages")
    .select("id, content, created_at, is_read, from_user, to_user")
    .or(`from_user.eq.${me},to_user.eq.${me}`)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message);

  const partnerIds = [...new Set((msgs || []).map(m => m.from_user === me ? m.to_user : m.from_user))];

  let profileMap = {};
  if (partnerIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, avatar_url")
      .in("id", partnerIds);
    (profiles || []).forEach(p => { profileMap[p.id] = p; });
  }

  const map = new Map();
  for (const msg of msgs || []) {
    const partnerId = msg.from_user === me ? msg.to_user : msg.from_user;
    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partner: profileMap[partnerId] || { id: partnerId, name: "Unknown", username: "unknown", avatar_url: null },
        latestMessage: msg,
        unread: (!msg.is_read && msg.to_user === me) ? 1 : 0
      });
    } else if (!msg.is_read && msg.to_user === me) {
      map.get(partnerId).unread += 1;
    }
  }

  res.json(new ApiResponse(200, { conversations: Array.from(map.values()) }));
});

export const getMessages = asyncHandler(async (req, res) => {
  const me = req.user.id;
  const { userId } = req.params;
  const { before, limit = 30 } = req.query;

  let query = supabaseAdmin
    .from("messages")
    .select("id, content, created_at, is_read, from_user, to_user, sender:profiles(id, name, username, avatar_url)")
    .or(`and(from_user.eq.${me},to_user.eq.${userId}),and(from_user.eq.${userId},to_user.eq.${me})`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message);

  supabaseAdmin.from("messages")
    .update({ is_read: true })
    .eq("from_user", userId)
    .eq("to_user", me)
    .eq("is_read", false)
    .then(() => {}).catch(() => {});

  res.json(new ApiResponse(200, { messages: (data || []).reverse() }));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { userId } = req.params;
  if (!content?.trim()) throw new ApiError(400, "Message cannot be empty");

  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({ from_user: req.user.id, to_user: userId, content: content.trim() })
    .select("id, content, created_at, is_read, from_user, to_user, sender:profiles(id, name, username, avatar_url)")
    .single();

  if (error) throw new ApiError(500, error.message);

  broadcastToUser(userId, { type: "new_message", message: data });
  broadcastToUser(req.user.id, { type: "new_message", message: data });

  supabaseAdmin.from("notifications")
    .insert({ user_id: userId, actor_id: req.user.id, type: "message" })
    .then(({ error: nErr }) => { if (nErr) console.error("[notif] message insert failed:", nErr.message); })
    .catch(e => console.error("[notif] message insert error:", e.message));

  res.status(201).json(new ApiResponse(201, { message: data }));
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const { count } = await supabaseAdmin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("to_user", req.user.id)
    .eq("is_read", false);

  res.json(new ApiResponse(200, { unread: count || 0 }));
});
