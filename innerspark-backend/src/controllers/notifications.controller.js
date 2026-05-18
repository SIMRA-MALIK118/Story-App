import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const { data: notifs, error } = await supabaseAdmin
    .from("notifications")
    .select("id, type, is_read, created_at, story_id, actor_id")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new ApiError(500, error.message);
  if (!notifs?.length) return res.json(new ApiResponse(200, { notifications: [] }));

  const actorIds = [...new Set(notifs.map(n => n.actor_id).filter(Boolean))];
  const storyIds = [...new Set(notifs.map(n => n.story_id).filter(Boolean))];

  const [actorsRes, storiesRes] = await Promise.allSettled([
    actorIds.length
      ? supabaseAdmin.from("profiles").select("id, name, username, avatar_url").in("id", actorIds)
      : Promise.resolve({ data: [] }),
    storyIds.length
      ? supabaseAdmin.from("stories").select("id, title").in("id", storyIds)
      : Promise.resolve({ data: [] }),
  ]);

  const actorMap = Object.fromEntries(
    (actorsRes.status === "fulfilled" ? actorsRes.value.data || [] : []).map(a => [a.id, a])
  );
  const storyMap = Object.fromEntries(
    (storiesRes.status === "fulfilled" ? storiesRes.value.data || [] : []).map(s => [s.id, s])
  );

  const notifications = notifs.map(n => ({
    ...n,
    actor: actorMap[n.actor_id] || null,
    story: n.story_id ? (storyMap[n.story_id] || null) : null,
  }));

  res.json(new ApiResponse(200, { notifications }));
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const { count, error } = await supabaseAdmin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", req.user.id)
    .eq("is_read", false);

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { count: count || 0 }));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", req.user.id)
    .eq("is_read", false);

  res.json(new ApiResponse(200, null, "All notifications marked as read"));
});
