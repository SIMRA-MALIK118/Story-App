import { supabaseAdmin } from "../config/supabase.js";
import { uploadToCloudinary, uploadBanner } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) throw new ApiError(404, "User not found");

  const queries = [
    supabaseAdmin.from("stories").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("is_published", true),
    supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile.id),
    supabaseAdmin.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profile.id),
  ];

  if (req.user) {
    queries.push(
      supabaseAdmin.from("follows").select("id").eq("follower_id", req.user.id).eq("following_id", profile.id).single()
    );
  }

  // Use allSettled so missing tables don't crash the whole request
  const results = await Promise.allSettled(queries);
  const storiesCount  = results[0].status === "fulfilled" ? results[0].value.count || 0 : 0;
  const followersCount = results[1].status === "fulfilled" ? results[1].value.count || 0 : 0;
  const followingCount = results[2].status === "fulfilled" ? results[2].value.count || 0 : 0;
  const isFollowing = req.user && results[3]?.status === "fulfilled" ? !!(results[3].value.data) : false;

  res.json(new ApiResponse(200, {
    profile,
    stats: { stories: storiesCount, followers: followersCount, following: followingCount },
    isFollowing,
  }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, username } = req.body;

  if (username) {
    const { data: taken } = await supabaseAdmin.from("profiles").select("id").eq("username", username).neq("id", req.user.id).single();
    if (taken) throw new ApiError(409, "Username already taken");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ name, bio, username, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { profile: data }, "Profile updated"));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image provided");

  const result = await uploadToCloudinary(req.file.buffer);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ avatar_url: result.secure_url, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { avatar_url: result.secure_url, profile: data }, "Avatar updated"));
});

export const uploadBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image provided");

  const result = await uploadBanner(req.file.buffer);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ banner_url: result.secure_url, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { banner_url: result.secure_url, profile: data }, "Banner updated"));
});

export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) throw new ApiError(400, "Cannot follow yourself");

  const { data: existing } = await supabaseAdmin
    .from("follows")
    .select("id")
    .eq("follower_id", req.user.id)
    .eq("following_id", userId)
    .single();

  if (existing) {
    await supabaseAdmin.from("follows").delete().eq("id", existing.id);
    return res.json(new ApiResponse(200, { following: false }, "Unfollowed"));
  }

  await supabaseAdmin.from("follows").insert({ follower_id: req.user.id, following_id: userId });

  supabaseAdmin.from("notifications")
    .insert({ user_id: userId, actor_id: req.user.id, type: "follow" })
    .then(() => {}).catch(() => {});

  res.json(new ApiResponse(200, { following: true }, "Following"));
});

export const getMyLikedIds = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("reactions")
    .select("story_id")
    .eq("user_id", req.user.id)
    .eq("type", "like");

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { likedIds: (data || []).map(r => r.story_id) }));
});

export const getProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, username, avatar_url, bio, banner_url")
    .eq("id", userId)
    .single();

  if (error || !profile) throw new ApiError(404, "User not found");
  res.json(new ApiResponse(200, { profile }));
});

export const getMe = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .single();
  if (error || !data) throw new ApiError(404, "Profile not found");
  res.json(new ApiResponse(200, { profile: data }));
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;
  if (!preferences || typeof preferences !== "object") throw new ApiError(400, "Invalid preferences");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ preferences, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select("preferences")
    .single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { preferences: data.preferences }, "Preferences saved"));
});

export const getLikedStories = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("reactions")
    .select(`story_id, stories(*, profiles(name, username, avatar_url))`)
    .eq("user_id", req.user.id)
    .eq("type", "like")
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { stories: (data || []).map(d => d.stories).filter(Boolean) }));
});

export const getSavedStories = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("saved_stories")
    .select(`story_id, stories(*, profiles(name, username, avatar_url))`)
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { stories: data.map(d => d.stories) }));
});
