import { Mood, Category } from "@/types";

export const MOODS: { value: Mood; label: string; emoji: string; color: string; bg: string }[] = [
  { value: "happy",   label: "Happy",   emoji: "😊", color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
  { value: "sad",     label: "Sad",     emoji: "😔", color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  { value: "growth",  label: "Growth",  emoji: "🌱", color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  { value: "failure", label: "Failure", emoji: "💪", color: "#F87171", bg: "rgba(248,113,113,0.15)" },
  { value: "love",    label: "Love",    emoji: "❤️", color: "#F472B6", bg: "rgba(244,114,182,0.15)" },
  { value: "courage", label: "Courage", emoji: "🔥", color: "#FB923C", bg: "rgba(251,146,60,0.15)" },
];

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "success",      label: "Success",      icon: "🏆" },
  { value: "depression",   label: "Depression",   icon: "🌧️" },
  { value: "discipline",   label: "Discipline",   icon: "⚡" },
  { value: "selfgrowth",   label: "Self Growth",  icon: "🌟" },
  { value: "relationship", label: "Relationship", icon: "💞" },
];

export const INTERESTS = [
  { value: "success",      label: "Success Stories",  icon: "🏆", description: "Inspiring journeys to the top" },
  { value: "depression",   label: "Mental Health",    icon: "🧠", description: "Stories of healing and hope" },
  { value: "discipline",   label: "Discipline",       icon: "⚡", description: "Building powerful habits" },
  { value: "selfgrowth",   label: "Self Growth",      icon: "🌱", description: "Personal transformation" },
  { value: "relationship", label: "Relationships",    icon: "💞", description: "Love, loss, and connection" },
  { value: "courage",      label: "Courage",          icon: "🔥", description: "Facing fears head on" },
  { value: "failure",      label: "Failure → Comeback",icon: "💪", description: "Rising after the fall" },
  { value: "love",         label: "Love Stories",     icon: "❤️", description: "Stories of the heart" },
];

export const ACHIEVEMENTS = [
  { id: "first_read",   name: "First Read",    icon: "📖", description: "Read your first story", condition: "reads_1",    xp: 10 },
  { id: "streak_3",     name: "3-Day Streak",  icon: "🔥", description: "Read for 3 days in a row", condition: "streak_3", xp: 30 },
  { id: "streak_7",     name: "Week Warrior",  icon: "⚡", description: "7-day reading streak", condition: "streak_7",   xp: 100 },
  { id: "reads_10",     name: "Story Lover",   icon: "💜", description: "Read 10 stories", condition: "reads_10",       xp: 50 },
  { id: "reads_50",     name: "Bookworm",      icon: "🦋", description: "Read 50 stories", condition: "reads_50",       xp: 150 },
  { id: "first_post",   name: "Storyteller",   icon: "✍️", description: "Posted your first story", condition: "posts_1", xp: 25 },
  { id: "posts_5",      name: "Author",        icon: "🌟", description: "Posted 5 stories", condition: "posts_5",       xp: 75 },
  { id: "likes_10",     name: "Inspiring",     icon: "✨", description: "Got 10 likes total", condition: "likes_10",    xp: 60 },
  { id: "ai_story",     name: "AI Creator",    icon: "🤖", description: "Created a story with AI", condition: "ai_1",   xp: 40 },
];

export const STORY_BACKGROUNDS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
  "linear-gradient(135deg, #0D0D14 0%, #8B5CF6 100%)",
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #0D0D14 0%, #EC4899 100%)",
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const PAGINATION_LIMIT = 10;
