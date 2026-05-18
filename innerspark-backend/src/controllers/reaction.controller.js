import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

const notify = (userId, actorId, type, storyId = null) => {
  if (userId === actorId) return; // no self-notifications
  supabaseAdmin.from("notifications").insert({
    user_id: userId, actor_id: actorId, type, story_id: storyId,
  }).then(() => {}).catch(() => {});
};

export const toggleLike = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  const { data: existing } = await supabaseAdmin
    .from("reactions")
    .select("id")
    .eq("user_id", req.user.id)
    .eq("story_id", storyId)
    .eq("type", "like")
    .single();

  if (existing) {
    await supabaseAdmin.from("reactions").delete().eq("id", existing.id);
    return res.json(new ApiResponse(200, { liked: false }));
  }

  await supabaseAdmin.from("reactions").insert({ user_id: req.user.id, story_id: storyId, type: "like" });

  // Notify story owner
  const { data: story } = await supabaseAdmin.from("stories").select("user_id").eq("id", storyId).single();
  if (story) notify(story.user_id, req.user.id, "like", storyId);

  res.json(new ApiResponse(200, { liked: true }));
});

export const getReactions = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  const { count: likesCount } = await supabaseAdmin
    .from("reactions")
    .select("id", { count: "exact", head: true })
    .eq("story_id", storyId)
    .eq("type", "like");

  let userLiked = false;
  if (req.user) {
    const { data } = await supabaseAdmin
      .from("reactions")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", req.user.id)
      .eq("type", "like")
      .single();
    userLiked = !!data;
  }

  res.json(new ApiResponse(200, { likes: likesCount || 0, userLiked }));
});

export const addComment = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { content } = req.body;
  if (!content?.trim()) throw new ApiError(400, "Comment cannot be empty");

  const { data, error } = await supabaseAdmin.from("comments").insert({
    user_id: req.user.id,
    story_id: storyId,
    content,
    created_at: new Date().toISOString(),
  }).select(`*, profiles(name, username, avatar_url)`).single();

  if (error) throw new ApiError(500, error.message);

  // Notify story owner
  const { data: story } = await supabaseAdmin.from("stories").select("user_id").eq("id", storyId).single();
  if (story) notify(story.user_id, req.user.id, "comment", storyId);

  res.status(201).json(new ApiResponse(201, { comment: data }, "Comment added"));
});

export const getComments = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select(`*, profiles(name, username, avatar_url)`)
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { comments: data }));
});
