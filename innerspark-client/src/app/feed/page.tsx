"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Flame, Heart, Bookmark, MessageCircle, Share2, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/shared/BottomNav";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const CATS = ["All", "Success", "Growth", "Courage", "Love", "Healing"];

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#78350f,#b45309)",
  "linear-gradient(135deg,#4a044e,#a21caf)",
];

const MOOD_EMOJIS: Record<string, string> = {
  growth: "🌱", courage: "💪", success: "✨", love: "❤️",
  healing: "🌊", wisdom: "💡", general: "💜", fire: "🔥",
};

interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  category: string;
  background_gradient: number;
  cover_image: string | null;
  created_at: string;
  is_anonymous: boolean;
  profiles?: { id: string; name: string; username: string; avatar_url: string | null };
  reactions?: { count: number }[];
  comments?: { count: number }[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  localLikes?: number;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const [activecat, setActivecat] = useState("All");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  const displayName = (user as any)?.name || "there";

  const fetchStories = useCallback(async (category?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = category && category !== "All" ? `?category=${category}` : "";
      const [storiesRes, likedRes] = await Promise.allSettled([
        api.get(`/stories/feed${params}`),
        api.get("/users/me/liked-ids"),
      ]);

      const raw: Story[] = storiesRes.status === "fulfilled" ? storiesRes.value.data.data.stories || [] : [];
      const likedIds: string[] = likedRes.status === "fulfilled" ? likedRes.value.data.data.likedIds || [] : [];
      const likedSet = new Set(likedIds);

      setStories(raw.map(s => ({
        ...s,
        isLiked: likedSet.has(s.id),
        isBookmarked: false,
        localLikes: s.reactions?.[0]?.count ?? 0,
      })));

      if (storiesRes.status === "rejected") {
        setError("Couldn't load stories. Make sure the backend is running.");
        setStories([]);
      }
    } catch {
      setError("Couldn't load stories. Make sure the backend is running.");
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
    api.get("/messages/unread").then(r => setNotifCount(r.data.data.unread || 0)).catch(() => {});
  }, [fetchStories]);

  const handleCat = (cat: string) => {
    setActivecat(cat);
    fetchStories(cat === "All" ? undefined : cat);
  };

  const toggleLike = (id: string) => {
    setStories(s => s.map(st => st.id === id
      ? { ...st, isLiked: !st.isLiked, localLikes: st.isLiked ? (st.localLikes || 0) - 1 : (st.localLikes || 0) + 1 }
      : st
    ));
    api.post(`/stories/${id}/like`).catch(() => {});
  };

  const toggleBookmark = (id: string) => {
    setStories(s => s.map(st => st.id === id ? { ...st, isBookmarked: !st.isBookmarked } : st));
    const story = stories.find(s => s.id === id);
    if (story) api.post(`/stories/${id}/save`).catch(() => {});
  };

  const getGradient = (s: Story) => GRADIENTS[s.background_gradient % GRADIENTS.length] || GRADIENTS[0];
  const getMood = (s: Story) => {
    const key = (s.mood || "general").toLowerCase();
    return MOOD_EMOJIS[key] || "💜";
  };
  const getComments = (s: Story) => s.comments?.[0]?.count ?? 0;

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", background:"#0D0D14", position:"relative" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 14px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <div style={{ width:24, height:24, borderRadius:7, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Sparkles size={13} color="white" />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:"#A78BFA", letterSpacing:0.5 }}>INNERSPARK</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"white", margin:0, letterSpacing:-0.5 }}>
              Hey, {displayName} ✨
            </h1>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/explore" style={{ textDecoration:"none" }}>
              <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Search size={17} color="rgba(255,255,255,0.6)" />
              </div>
            </Link>
            <Link href="/chat" style={{ textDecoration:"none" }}>
              <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                <Bell size={17} color="rgba(255,255,255,0.6)" />
                {notifCount > 0 && (
                  <div style={{ position:"absolute", top:6, right:6, minWidth:16, height:16, borderRadius:8, background:"#EC4899", border:"1.5px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"white" }}>{notifCount > 9 ? "9+" : notifCount}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }} className="no-scrollbar">
          {CATS.map(cat => (
            <button key={cat} onClick={() => handleCat(cat)}
              style={{ flexShrink:0, padding:"7px 16px", borderRadius:50, fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                background: activecat === cat ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)",
                color: activecat === cat ? "white" : "rgba(255,255,255,0.45)",
                boxShadow: activecat === cat ? "0 0 14px rgba(139,92,246,0.3)" : "none",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories list */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px" }} className="no-scrollbar">

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>
                <div style={{ height:100, background:"rgba(255,255,255,0.06)" }} />
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
                    <div>
                      <div style={{ height:12, width:80, borderRadius:6, background:"rgba(255,255,255,0.06)", marginBottom:6 }} />
                      <div style={{ height:10, width:50, borderRadius:6, background:"rgba(255,255,255,0.04)" }} />
                    </div>
                  </div>
                  <div style={{ height:14, width:"80%", borderRadius:6, background:"rgba(255,255,255,0.06)", marginBottom:8 }} />
                  <div style={{ height:10, width:"95%", borderRadius:6, background:"rgba(255,255,255,0.04)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:14 }}>⚡</div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"white", margin:"0 0 8px" }}>Can't connect to server</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 20px" }}>{error}</p>
            <button onClick={() => fetchStories()}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", cursor:"pointer", color:"#A78BFA", fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", margin:"0 auto" }}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && stories.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📖</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:"0 0 8px" }}>No stories yet</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 20px" }}>
              Be the first to share your story!
            </p>
            <Link href="/create" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, background:"linear-gradient(to right,#8B5CF6,#EC4899)", color:"white", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              Write a story
            </Link>
          </div>
        )}

        {/* Real stories */}
        {!loading && !error && stories.map((story, i) => (
          <motion.div key={story.id}
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i * 0.07 }}
            style={{ marginBottom:16 }}
          >
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>

              {/* Hero — cover image OR gradient */}
              <div style={{ height: story.cover_image ? 160 : 100, position:"relative", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"12px 14px", overflow:"hidden" }}>
                {story.cover_image
                  ? <img src={story.cover_image} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} alt={story.title} />
                  : <div style={{ position:"absolute", inset:0, background:getGradient(story) }} />
                }
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.65))" }} />
                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:50, padding:"3px 10px", color:"white", fontWeight:600 }}>
                    {getMood(story)} {story.mood || story.category}
                  </span>
                  <Flame size={14} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>Trending</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding:"14px 16px" }}>
                {/* Author */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  {story.is_anonymous ? (
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1.5px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎭</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"white" }}>Anonymous</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{timeAgo(story.created_at)}</div>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/profile/u/${story.profiles?.id || (story as any).user_id}`} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1.5px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, overflow:"hidden" }}>
                        {story.profiles?.avatar_url
                          ? <img src={story.profiles.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                          : "👤"}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"white" }}>{story.profiles?.name || "User"}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{timeAgo(story.created_at)}</div>
                      </div>
                    </Link>
                  )}
                </div>

                <h3 style={{ fontSize:16, fontWeight:800, color:"white", margin:"0 0 8px", lineHeight:1.3, letterSpacing:-0.3 }}>{story.title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:"0 0 14px", lineHeight:1.6, fontFamily:"Lora,serif",
                  display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>
                  {story.content}
                </p>

                <Link href={`/story/${story.id}`} style={{ textDecoration:"none" }}>
                  <span style={{ fontSize:12, color:"#A78BFA", fontWeight:700 }}>Read full story →</span>
                </Link>

                {/* Actions */}
                <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <button onClick={() => toggleLike(story.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer" }}>
                    <Heart size={17} color={story.isLiked ? "#EC4899" : "rgba(255,255,255,0.35)"} fill={story.isLiked ? "#EC4899" : "none"} />
                    <span style={{ fontSize:12, color:story.isLiked ? "#EC4899" : "rgba(255,255,255,0.35)", fontWeight:600, fontFamily:"Inter,sans-serif" }}>
                      {(story.localLikes || 0).toLocaleString()}
                    </span>
                  </button>

                  <button style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer" }}>
                    <MessageCircle size={17} color="rgba(255,255,255,0.35)" />
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:600, fontFamily:"Inter,sans-serif" }}>
                      {getComments(story)}
                    </span>
                  </button>

                  <button style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer" }}>
                    <Share2 size={16} color="rgba(255,255,255,0.35)" />
                  </button>

                  <button onClick={() => toggleBookmark(story.id)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer" }}>
                    <Bookmark size={17} color={story.isBookmarked ? "#A78BFA" : "rgba(255,255,255,0.35)"} fill={story.isBookmarked ? "#A78BFA" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
