"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Heart, Flame, X, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/shared/BottomNav";
import api from "@/services/api";

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#78350f,#b45309)",
  "linear-gradient(135deg,#4a044e,#a21caf)",
];

const CATS = [
  { e:"🔥", l:"Trending",  c:"#FB923C" },
  { e:"🌱", l:"Growth",    c:"#34D399" },
  { e:"💪", l:"Courage",   c:"#F87171" },
  { e:"❤️", l:"Love",      c:"#F472B6" },
  { e:"✨", l:"Success",   c:"#A78BFA" },
  { e:"🌊", l:"Healing",   c:"#60A5FA" },
  { e:"💡", l:"Wisdom",    c:"#FBBF24" },
  { e:"🎯", l:"Goals",     c:"#34D399" },
];

interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  category: string;
  background_gradient: number;
  cover_image: string | null;
  views_count: number;
  is_anonymous: boolean;
  profiles?: { id: string; name: string; username: string; avatar_url: string | null };
  reactions?: { count: number }[];
  isLiked?: boolean;
  localLikes?: number;
  isFollowing?: boolean;
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activecat, setActivecat] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const getLikedSet = async (): Promise<Set<string>> => {
    try {
      const { data } = await api.get("/users/me/liked-ids");
      return new Set<string>(data.data.likedIds || []);
    } catch {
      return new Set<string>();
    }
  };

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const [storiesRes, likedSet] = await Promise.all([
        api.get("/stories/trending"),
        getLikedSet(),
      ]);
      const raw: Story[] = storiesRes.data.data.stories || [];
      setStories(raw.map(s => ({
        ...s,
        isLiked: likedSet.has(s.id),
        localLikes: s.reactions?.[0]?.count ?? 0,
        isFollowing: false,
      })));
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (cat: string) => {
    if (activecat === cat) {
      setActivecat("");
      return fetchTrending();
    }
    setActivecat(cat);
    setLoading(true);
    try {
      const [storiesRes, likedSet] = await Promise.all([
        api.get(`/stories/feed?category=${cat}`),
        getLikedSet(),
      ]);
      const raw: Story[] = storiesRes.data.data.stories || [];
      setStories(raw.map(s => ({
        ...s,
        isLiked: likedSet.has(s.id),
        localLikes: s.reactions?.[0]?.count ?? 0,
        isFollowing: false,
      })));
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return fetchTrending();
    setSearching(true);
    setLoading(true);
    try {
      const [storiesRes, likedSet] = await Promise.all([
        api.get("/stories/feed"),
        getLikedSet(),
      ]);
      const all: Story[] = (storiesRes.data.data.stories || []).map((s: Story) => ({
        ...s, isLiked: likedSet.has(s.id), localLikes: s.reactions?.[0]?.count ?? 0, isFollowing: false,
      }));
      const q = query.toLowerCase();
      setStories(all.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)));
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearching(false);
    setActivecat("");
    fetchTrending();
  };

  const toggleLike = (id: string) => {
    setStories(s => s.map(st => st.id === id
      ? { ...st, isLiked: !st.isLiked, localLikes: st.isLiked ? (st.localLikes || 0) - 1 : (st.localLikes || 0) + 1 }
      : st
    ));
    api.post(`/stories/${id}/like`).catch(() => {});
  };

  const toggleFollow = (userId: string) => {
    setStories(s => s.map(st =>
      st.profiles?.id === userId ? { ...st, isFollowing: !st.isFollowing } : st
    ));
    api.post(`/users/${userId}/follow`).catch(() => {});
  };

  const getGradient = (s: Story) =>
    GRADIENTS[s.background_gradient % GRADIENTS.length] || GRADIENTS[0];

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 16px 14px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <TrendingUp size={16} color="#A78BFA" />
          <span style={{ fontSize:13, fontWeight:700, color:"#A78BFA", letterSpacing:0.5 }}>EXPLORE</span>
        </div>
        <h1 style={{ fontSize:22, fontWeight:800, color:"white", margin:"0 0 16px", letterSpacing:-0.5 }}>
          {searching ? `"${query}"` : "Discover Stories"}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch}>
          <div style={{ position:"relative" }}>
            <Search size={16} color="rgba(255,255,255,0.3)" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search stories, authors..."
              style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"13px 42px 13px 40px", color:"white", fontSize:14, outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
            />
            {query && (
              <button type="button" onClick={clearSearch}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:0 }}>
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px" }} className="no-scrollbar">

        {/* Category pills */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:14 }} className="no-scrollbar">
          {CATS.map(cat => (
            <button key={cat.l} onClick={() => fetchByCategory(cat.l)}
              style={{ flexShrink:0, display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:50, fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                background: activecat === cat.l ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)",
                color: activecat === cat.l ? "white" : "rgba(255,255,255,0.5)",
              }}>
              <span>{cat.e}</span> {cat.l}
            </button>
          ))}
        </div>

        {/* Section title */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <Flame size={15} color="#FB923C" />
          <span style={{ fontSize:14, fontWeight:700, color:"white" }}>
            {activecat ? activecat : searching ? "Search Results" : "Trending Now"}
          </span>
          {!loading && (
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginLeft:"auto" }}>
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height:160, borderRadius:18, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{ height:80, background:"rgba(255,255,255,0.06)" }} />
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ height:12, width:"70%", borderRadius:6, background:"rgba(255,255,255,0.06)", marginBottom:8 }} />
                  <div style={{ height:10, width:"90%", borderRadius:6, background:"rgba(255,255,255,0.04)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && stories.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:"0 0 8px" }}>No stories found</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>
              {searching ? "Try a different search term" : "Be the first to share your story!"}
            </p>
          </div>
        )}

        {/* Story cards */}
        {!loading && stories.map((story, i) => (
          <motion.div key={story.id}
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:i * 0.06 }}
            style={{ marginBottom:14 }}
          >
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>
              {/* Hero image or gradient */}
              <Link href={`/story/${story.id}`} style={{ textDecoration:"none", display:"block" }}>
                <div style={{ height: story.cover_image ? 140 : 72, position:"relative", display:"flex", alignItems:"flex-end", padding:"10px 14px", overflow:"hidden" }}>
                  {story.cover_image
                    ? <img src={story.cover_image} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} alt={story.title} />
                    : <div style={{ position:"absolute", inset:0, background:getGradient(story) }} />
                  }
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.55))" }} />
                  <span style={{ position:"relative", fontSize:11, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:50, padding:"3px 10px", color:"white", fontWeight:600 }}>
                    {story.mood || story.category}
                  </span>
                </div>
              </Link>

              <div style={{ padding:"12px 14px" }}>
                <Link href={`/story/${story.id}`} style={{ textDecoration:"none" }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"white", margin:"0 0 6px", lineHeight:1.3, letterSpacing:-0.2 }}>{story.title}</h3>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:"0 0 10px", lineHeight:1.5, fontFamily:"Lora,serif",
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>
                    {story.content}
                  </p>
                </Link>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {story.is_anonymous ? (
                      <>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🎭</div>
                        <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>Anonymous</span>
                      </>
                    ) : (
                      <Link href={`/profile/u/${story.profiles?.id || (story as any).user_id}`} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, overflow:"hidden", flexShrink:0 }}>
                          {story.profiles?.avatar_url
                            ? <img src={story.profiles.avatar_url} style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} alt="" />
                            : "👤"}
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>
                          {story.profiles?.name || "User"}
                        </span>
                      </Link>
                    )}
                    {!story.is_anonymous && story.profiles?.id && (
                      <button
                        onClick={() => toggleFollow(story.profiles!.id!)}
                        style={{ display:"flex", alignItems:"center", gap:3, padding:"3px 9px", borderRadius:50, fontSize:11, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                          background: story.isFollowing ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.25)",
                          color: story.isFollowing ? "rgba(255,255,255,0.5)" : "#A78BFA",
                        }}>
                        {story.isFollowing ? <Check size={10} /> : <UserPlus size={10} />}
                        {story.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  <button onClick={() => toggleLike(story.id)}
                    style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:8 }}>
                    <Heart size={14} color={story.isLiked ? "#EC4899" : "rgba(255,255,255,0.35)"} fill={story.isLiked ? "#EC4899" : "none"} />
                    <span style={{ fontSize:12, color: story.isLiked ? "#EC4899" : "rgba(255,255,255,0.4)", fontWeight:600, fontFamily:"Inter,sans-serif" }}>
                      {(story.localLikes || 0).toLocaleString()}
                    </span>
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
