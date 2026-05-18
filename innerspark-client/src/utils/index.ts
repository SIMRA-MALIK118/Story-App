import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Mood } from "@/types";
import { MOODS } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMoodConfig(mood: Mood) {
  return MOODS.find((m) => m.value === mood) || MOODS[0];
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function readingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
