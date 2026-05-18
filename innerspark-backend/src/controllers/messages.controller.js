import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const getConversations = asyncHandler(async (req, res) => {
  const me = req.user.id;

  // All messages involving me
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select(`
      id, content, created_at, is_read, from_user, to_user,
      sender:profiles!messages_from_user_fkey(id, name, username, avatar_url),
      receiver:profiles!messages_to_user_fkey(id, name, username, avatar_url)
    `)
    .or(`from_user.eq.${me},to_user.eq.${me}`)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message);

  // Group by partner, keep latest message per conversation
  const map = new Map();
  for (const msg of data || []) {
    const partnerId = msg.from_user === me ? msg.to_user : msg.from_user;
    if (!map.has(partnerId)) {
      const partner = msg.from_user === me ? msg.receiver : msg.sender;
      map.set(partnerId, { partner, latestMessage: msg, unread: (!msg.is_read && msg.to_user === me) ? 1 : 0 });
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
    .select(`
      id, content, created_at, is_read, from_user, to_user,
      sender:profiles!messages_from_user_fkey(id, name, username, avatar_url)
    `)
    .or(`and(from_user.eq.${me},to_user.eq.${userId}),and(from_user.eq.${userId},to_user.eq.${me})`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message);

  // Mark messages from the other user as read
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
    .select(`
      id, content, created_at, is_read, from_user, to_user,
      sender:profiles!messages_from_user_fkey(id, name, username, avatar_url)
    `)
    .single();

  if (error) throw new ApiError(500, error.message);

  // Notify the recipient (background)
  supabaseAdmin.from("notifications")
    .insert({ user_id: userId, actor_id: req.user.id, type: "message" })
    .then(() => {}).catch(() => {});

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
