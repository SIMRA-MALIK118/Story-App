import { supabaseAdmin } from "../config/supabase.js";
import { uploadStoryImage } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, mood } = req.query;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("stories")
    .select(`*, profiles(id, name, username, avatar_url), reactions(count), comments(count)`)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (mood) query = query.eq("mood", mood);

  const { data, error, count } = await query;
  if (error) throw new ApiError(500, error.message);

  res.json(new ApiResponse(200, { stories: data, total: count, page: +page, limit: +limit }));
});

export const searchStories = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q?.trim()) return res.json(new ApiResponse(200, { stories: [] }));

  // Search by title/content AND by author name/username
  const [storiesRes, profilesRes] = await Promise.allSettled([
    supabaseAdmin
      .from("stories")
      .select(`*, profiles(id, name, username, avatar_url), reactions(count)`)
      .eq("is_published", true)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order("views_count", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("profiles")
      .select("id")
      .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(20),
  ]);

  const byText = storiesRes.status === "fulfilled" ? storiesRes.value.data || [] : [];

  let byAuthor = [];
  if (profilesRes.status === "fulfilled" && profilesRes.value.data?.length) {
    const authorIds = profilesRes.value.data.map(p => p.id);
    const { data: authorStories } = await supabaseAdmin
      .from("stories")
      .select(`*, profiles(id, name, username, avatar_url), reactions(count)`)
      .eq("is_published", true)
      .in("user_id", authorIds)
      .order("views_count", { ascending: false })
      .limit(30);
    byAuthor = authorStories || [];
  }

  // Merge and deduplicate by id
  const seen = new Set();
  const merged = [...byText, ...byAuthor].filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  res.json(new ApiResponse(200, { stories: merged }));
});

export const getTrending = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select(`*, profiles(id, name, username, avatar_url), reactions(count)`)
    .eq("is_published", true)
    .order("views_count", { ascending: false })
    .limit(20);

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { stories: data }));
});

export const getStoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select(`*, profiles(id, name, username, avatar_url, bio), reactions(*), comments(*, profiles(name, username, avatar_url))`)
    .eq("id", id)
    .single();

  if (error || !data) throw new ApiError(404, "Story not found");

  // Increment view count
  await supabaseAdmin.from("stories").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id);

  // Record read for authenticated user (for streak/stats tracking)
  if (req.user) {
    supabaseAdmin.from("story_reads").upsert(
      { user_id: req.user.id, story_id: id, created_at: new Date().toISOString() },
      { onConflict: "user_id,story_id", ignoreDuplicates: true }
    ).then(() => {}).catch(() => {});
  }

  res.json(new ApiResponse(200, { story: data }));
});

export const createStory = asyncHandler(async (req, res) => {
  const { title, content, mood, category, background_gradient, is_anonymous, is_ai_generated } = req.body;
  if (!title || !content) throw new ApiError(400, "Title and content are required");

  let cover_image = null;
  if (req.file) {
    const result = await uploadStoryImage(req.file.buffer);
    cover_image = result.secure_url;
  }

  const { data, error } = await supabaseAdmin.from("stories").insert({
    user_id: req.user.id,
    title,
    content,
    mood: mood || "general",
    category: category || "General",
    background_gradient: parseInt(background_gradient) || 0,
    cover_image,
    is_anonymous: is_anonymous === "true" || is_anonymous === true,
    is_ai_generated: is_ai_generated === "true" || is_ai_generated === true,
    is_published: true,
    views_count: 0,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) throw new ApiError(500, error.message);

  // Notify followers about the new story (background, skip anonymous)
  const isAnon = is_anonymous === "true" || is_anonymous === true;
  if (!isAnon && data?.id) {
    supabaseAdmin.from("follows").select("follower_id").eq("following_id", req.user.id)
      .then(({ data: followers }) => {
        if (!followers?.length) return;
        return supabaseAdmin.from("notifications").insert(
          followers.map(f => ({
            user_id: f.follower_id,
            actor_id: req.user.id,
            type: "new_post",
            story_id: data.id,
          }))
        );
      }).catch(() => {});
  }

  res.status(201).json(new ApiResponse(201, { story: data }, "Story published!"));
});

export const updateStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, mood, category, background_gradient } = req.body;

  const { data: existing } = await supabaseAdmin.from("stories").select("user_id, cover_image").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Story not found");
  if (existing.user_id !== req.user.id) throw new ApiError(403, "Not authorized");

  let cover_image = existing.cover_image;
  if (req.file) {
    const result = await uploadStoryImage(req.file.buffer);
    cover_image = result.secure_url;
  }
  // If cover was explicitly removed (field sent as empty string)
  if (req.body.cover_image === "" || req.body.remove_cover === "true") {
    cover_image = null;
  }

  const updateData = {
    updated_at: new Date().toISOString(),
    ...(title && { title }),
    ...(content && { content }),
    ...(mood && { mood }),
    ...(category && { category }),
    ...(background_gradient !== undefined && { background_gradient: parseInt(background_gradient) || 0 }),
    cover_image,
  };

  const { data, error } = await supabaseAdmin
    .from("stories")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { story: data }, "Story updated"));
});

export const deleteStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabaseAdmin.from("stories").select("user_id").eq("id", id).single();
  if (!existing) throw new ApiError(404, "Story not found");
  if (existing.user_id !== req.user.id) throw new ApiError(403, "Not authorized");

  await supabaseAdmin.from("stories").delete().eq("id", id);
  res.json(new ApiResponse(200, null, "Story deleted"));
});

export const getUserStories = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabaseAdmin
    .from("stories")
    .select(`*, reactions(count), comments(count)`)
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { stories: data }));
});

export const saveStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data: existing } = await supabaseAdmin
    .from("saved_stories")
    .select("id")
    .eq("user_id", req.user.id)
    .eq("story_id", id)
    .single();

  if (existing) {
    await supabaseAdmin.from("saved_stories").delete().eq("id", existing.id);
    return res.json(new ApiResponse(200, { saved: false }, "Removed from saved"));
  }

  await supabaseAdmin.from("saved_stories").insert({ user_id: req.user.id, story_id: id });
  res.json(new ApiResponse(200, { saved: true }, "Story saved"));
});
