import { supabaseAdmin } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    { count: storiesCount },
    { count: readsCount },
    { data: streak },
    { data: profile },
    { data: userStories },
  ] = await Promise.all([
    supabaseAdmin.from("stories").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("story_reads").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("streaks").select("*").eq("user_id", userId).single(),
    supabaseAdmin.from("profiles").select("xp, level").eq("id", userId).single(),
    supabaseAdmin.from("stories").select("id").eq("user_id", userId),
  ]);

  const storyIds = (userStories || []).map(s => s.id);
  let likesCount = 0;
  if (storyIds.length > 0) {
    const { count } = await supabaseAdmin
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .in("story_id", storyIds)
      .eq("type", "like");
    likesCount = count || 0;
  }

  res.json(new ApiResponse(200, {
    stories: storiesCount || 0,
    reads: readsCount || 0,
    likes: likesCount,
    streak: streak?.current_streak || 0,
    longest_streak: streak?.longest_streak || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
  }));
});

export const logMood = asyncHandler(async (req, res) => {
  const { mood, note } = req.body;
  if (!mood) throw new ApiError(400, "Mood is required");

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin.from("daily_moods").upsert({
    user_id: req.user.id,
    mood,
    note: note || null,
    date: today,
  }, { onConflict: "user_id,date" }).select().single();

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { mood: data }, "Mood logged"));
});

export const getMoodHistory = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const from = new Date();
  from.setDate(from.getDate() - days);

  const { data, error } = await supabaseAdmin
    .from("daily_moods")
    .select("*")
    .eq("user_id", req.user.id)
    .gte("date", from.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (error) throw new ApiError(500, error.message);
  res.json(new ApiResponse(200, { moods: data }));
});

export const updateStreak = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabaseAdmin.from("streaks").select("*").eq("user_id", userId).single();

  if (!existing) {
    const { data } = await supabaseAdmin.from("streaks").insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_activity: today }).select().single();
    return res.json(new ApiResponse(200, { streak: data }));
  }

  const lastDate = new Date(existing.last_activity);
  const todayDate = new Date(today);
  const diff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  let newStreak = existing.current_streak;
  if (diff === 1) newStreak += 1;
  else if (diff > 1) newStreak = 1;

  const { data } = await supabaseAdmin.from("streaks").update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, existing.longest_streak),
    last_activity: today,
  }).eq("user_id", userId).select().single();

  res.json(new ApiResponse(200, { streak: data }));
});

export const getWeeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const { data: reads } = await supabaseAdmin
    .from("story_reads")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", days[0]);

  const activity = days.map(day => ({
    date: day,
    reads: reads?.filter(r => r.created_at.startsWith(day)).length || 0,
  }));

  res.json(new ApiResponse(200, { activity }));
});
