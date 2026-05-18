"use client";
import { motion } from "framer-motion";
import { Settings, Grid3x3, Heart, Bookmark, Edit2 } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/shared/BottomNav";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

const TABS = [
  { icon: Grid3x3,  label: "Stories" },
  { icon: Heart,    label: "Liked" },
  { icon: Bookmark, label: "Saved" },
];

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#78350f,#b45309)",
  "linear-gradient(135deg,#4a044e,#a21caf)",
];

interface StoryItem {
  id: string;
  title: string;
  background_gradient: number;
  cover_image: string | null;
  mood: string;
  reactions?: { count: number }[];
}

interface Stats {
  stories: number;
  followers: number;
  following: number;
  reads: number;
  likes: number;
  streak: number;
  xp: number;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [myStories, setMyStories] = useState<StoryItem[]>([]);
  const [savedStories, setSavedStories] = useState<StoryItem[]>([]);
  const [stats, setStats] = useState<Stats>({ stories:0, followers:0, following:0, reads:0, likes:0, streak:0, xp:0 });
  const [loading, setLoading] = useState(true);

  const displayName = (user as any)?.name || (user as any)?.email?.split("@")[0] || "User";
  const username    = (user as any)?.username || (user as any)?.email?.split("@")[0] || "user";
  const bio         = (user as any)?.bio || "Sharing my journey one story at a time. 🌱";
  const avatarUrl   = (user as any)?.avatar_url || null;
  const bannerUrl   = (user as any)?.banner_url || null;
  const userId      = (user as any)?.id;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [dashRes, storiesRes, profileRes] = await Promise.allSettled([
          api.get("/dashboard/stats"),
          api.get(`/stories/user/${userId}`),
          username ? api.get(`/users/${username}`) : Promise.resolve(null),
        ]);

        if (dashRes.status === "fulfilled") {
          const d = dashRes.value.data.data;
          setStats(prev => ({ ...prev, streak: d.streak||0, xp: d.xp||0, reads: d.reads||0, stories: d.stories||0, likes: d.likes||0 }));
        }
        if (storiesRes.status === "fulfilled") {
          setMyStories(storiesRes.value.data.data.stories || []);
        }
        if (profileRes.status === "fulfilled" && profileRes.value) {
          const s = profileRes.value.data.data.stats;
          setStats(prev => ({ ...prev, followers: s.followers||0, following: s.following||0, stories: s.stories||prev.stories }));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, username]);

  useEffect(() => {
    if (activeTab === 2) {
      api.get("/users/me/saved").then(r => setSavedStories(r.data.data.stories || [])).catch(() => {});
    }
  }, [activeTab]);

  const formatNum = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

  const currentStories = activeTab === 0 ? myStories : activeTab === 2 ? savedStories : [];

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", position:"relative" }}>
      <div style={{ flex:1, overflowY:"auto" }} className="no-scrollbar">

        {/* Cover banner */}
        <div style={{ height:140, position:"relative", overflow:"hidden" }}>
          {bannerUrl
            ? <img src={bannerUrl} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} alt="banner" />
            : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#3b0764,#6d28d9,#be185d)" }} />
          }
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.2)" }} />
          <Link href="/settings" style={{ position:"absolute", top:52, right:16, width:36, height:36, borderRadius:11, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
            <Settings size={17} color="white" />
          </Link>
          <Link href="/profile/edit" style={{ position:"absolute", top:52, right:60, width:36, height:36, borderRadius:11, background:"rgba(0,0,0,0.3)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
            <Edit2 size={15} color="white" />
          </Link>
        </div>

        {/* Avatar + info */}
        <div style={{ padding:"0 20px", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:-28, marginBottom:14 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"3px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:"0 0 20px rgba(139,92,246,0.4)", overflow:"hidden" }}>
              {avatarUrl
                ? <img src={avatarUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={displayName} />
                : <span>👤</span>
              }
            </div>
            <Link href="/profile/edit" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", cursor:"pointer", color:"#A78BFA", fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", textDecoration:"none" }}>
              <Edit2 size={13} /> Edit Profile
            </Link>
          </div>

          <h2 style={{ fontSize:20, fontWeight:800, color:"white", margin:"0 0 2px", letterSpacing:-0.3 }}>{displayName}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 10px" }}>@{username}</p>
          {bio && (
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", margin:"0 0 14px", lineHeight:1.6 }}>{bio}</p>
          )}

          {/* Stats row — Followers / Following / Reads / Likes */}
          <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden", marginBottom:16 }}>
            {[
              { v: loading ? "—" : formatNum(stats.followers), l:"Followers" },
              { v: loading ? "—" : formatNum(stats.following), l:"Following" },
              { v: loading ? "—" : String(stats.reads),        l:"Reads" },
              { v: loading ? "—" : formatNum(stats.likes),     l:"❤️ Likes" },
            ].map((s, i) => (
              <div key={i} style={{ flex:1, textAlign:"center", padding:"12px 4px", borderRight: i<3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize:15, fontWeight:800, color: i===3 ? "#EC4899" : "white" }}>{s.v}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:0.2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"nowrap", overflowX:"auto" }} className="no-scrollbar">
            {[
              stats.streak > 0 && `🔥 ${stats.streak}-day streak`,
              stats.streak >= 7 && "⚡ Week Warrior",
              stats.stories > 0 && "🌟 Storyteller",
            ].filter(Boolean).map((b, i) => (
              <div key={i} style={{ fontSize:11, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:50, padding:"4px 10px", color:"#A78BFA", fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}>
                {b as string}
              </div>
            ))}
            {stats.streak === 0 && !loading && (
              <div style={{ fontSize:11, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:50, padding:"4px 10px", color:"rgba(255,255,255,0.3)", fontWeight:600 }}>
                Start your streak today!
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", margin:"0 20px" }}>
          {TABS.map(({ icon: Icon, label }, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 0", background:"none", border:"none", cursor:"pointer", borderBottom: activeTab===i ? "2px solid #8B5CF6" : "2px solid transparent" }}>
              <Icon size={18} color={activeTab===i ? "#A78BFA" : "rgba(255,255,255,0.3)"} />
              <span style={{ fontSize:11, color:activeTab===i ? "#A78BFA" : "rgba(255,255,255,0.3)", fontWeight:600, fontFamily:"Inter,sans-serif" }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Story grid */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, padding:"2px 0 100px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ aspectRatio:"1", background:"rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : currentStories.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, padding:"2px 0 100px" }}>
            {currentStories.map(s => (
              <Link key={s.id} href={`/story/${s.id}`} style={{ textDecoration:"none" }}>
                <motion.div whileTap={{ scale:0.97 }}
                  style={{ aspectRatio:"1", position:"relative", cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:10, overflow:"hidden", background:GRADIENTS[s.background_gradient % GRADIENTS.length] || GRADIENTS[0] }}>
                  {s.cover_image && (
                    <img src={s.cover_image} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} alt={s.title} />
                  )}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.75))" }} />
                  <div style={{ position:"relative" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"white", lineHeight:1.2, marginBottom:4,
                      display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>
                      {s.title}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                      <Heart size={10} color="#EC4899" fill="#EC4899" />
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>
                        {Number(s.reactions?.[0]?.count) || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"60px 20px 100px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>
              {activeTab === 0 ? "📝" : activeTab === 1 ? "❤️" : "🔖"}
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:0 }}>
              {activeTab === 0 ? "No stories yet. Share your first!" : activeTab === 1 ? "No liked stories" : "No saved stories"}
            </p>
            {activeTab === 0 && (
              <Link href="/create" style={{ display:"inline-flex", marginTop:14, padding:"10px 20px", borderRadius:12, background:"linear-gradient(to right,#8B5CF6,#EC4899)", color:"white", fontSize:13, fontWeight:600, textDecoration:"none" }}>
                Write a story
              </Link>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
