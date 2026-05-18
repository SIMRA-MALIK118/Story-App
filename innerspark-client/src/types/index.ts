export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  profilePic?: string;
  bio?: string;
  role: "user" | "pro" | "admin";
  interests: string[];
  preferredMoods: string[];
  onboardingCompleted: boolean;
  followers: string[];
  following: string[];
  savedStories: string[];
  streak: number;
  lastReadDate?: string;
  totalReads: number;
  totalStoriesPosted: number;
  xpPoints: number;
  achievements: Achievement[];
  createdAt: string;
}

export interface Story {
  _id: string;
  title: string;
  content: string;
  image?: string;
  backgroundGradient?: string;
  mood: Mood;
  category: Category;
  author: User | string;
  isAnonymous: boolean;
  isAIGenerated: boolean;
  likes: string[];
  likesCount: number;
  views: number;
  commentsCount: number;
  sharesCount: number;
  reactions: Reaction[];
  tags: string[];
  isTrending: boolean;
  isFeatured: boolean;
  isEphemeral: boolean;
  expiresAt?: string;
  aiPrompt?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  storyId: string;
  likes: string[];
  createdAt: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: "like" | "comment" | "follow" | "daily_reminder" | "achievement";
  story?: Story;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DailyMood {
  _id: string;
  userId: string;
  date: string;
  mood: Mood;
  note?: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  freezeCount: number;
}

export interface DashboardStats {
  totalReads: number;
  totalStories: number;
  totalLikes: number;
  streak: Streak;
  xpPoints: number;
  moodHistory: DailyMood[];
  recentAchievements: Achievement[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type Mood = "happy" | "sad" | "growth" | "failure" | "love" | "courage";
export type Category =
  | "success"
  | "depression"
  | "discipline"
  | "selfgrowth"
  | "relationship";

export interface AIGenerateRequest {
  prompt: string;
  mood?: Mood;
  category?: Category;
  style?: "express" | "guided" | "remix";
}

export interface AIGenerateResponse {
  title: string;
  content: string;
  mood: Mood;
  category: Category;
  tags: string[];
}
