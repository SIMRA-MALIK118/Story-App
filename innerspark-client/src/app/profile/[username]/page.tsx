"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, UserPlus, Check, MessageSquare, Heart, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#78350f,#b45309)",
  "linear-gradient(135deg,#4a044e,#a21caf)",
];

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
}

interface StoryItem {
  id: string;
  title: string;
  background_gradient: number;
  cover_image: string | null;
  reactions?: { count: number }[];
}

function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const username = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [stats, setStats] = useState({ stories: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = (user as any)?.username === username;

  useEffect(() => {
    if (!username) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${username}`);
        const p = data.data.profile;
        const s = data.data.stats;
        setProfile(p);
        setStats(s);
        setIsFollowing(data.data.isFollowing || false);

        // Load their stories
        const storiesRes = await api.get(`/stories/user/${p.id}`);
        setStories(storiesRes.data.data.stories || []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    const newState = !isFollowing;
    setIsFollowing(newState);
    setStats(prev => ({ ...prev, followers: prev.followers + (newState ? 1 : -1) }));
    try {
      await api.post(`/users/${profile.id}/follow`);
    } catch {
      setIsFollowing(!newState);
      setStats(prev => ({ ...prev, followers: prev.followers + (newState ? -1 : 1) }));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(139,92,246,0.3)", borderTop:"3px solid #8B5CF6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, padding:24 }}>
        <div style={{ fontSize:48 }}>👤</div>
        <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:0 }}>User not found</h3>
        <button onClick={() => router.back()} style={{ padding:"10px 24px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#A78BFA", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", position:"relative" }}>
      <div style={{ flex:1, overflowY:"auto" }} className="no-scrollbar">

        {/* Banner */}
        <div style={{ height:140, position:"relative", overflow:"hidden" }}>
          {profile.banner_url
            ? <img src={profile.banner_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="banner" />
            : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#3b0764,#6d28d9,#be185d)" }} />
          }
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.2)" }} />

          {/* Back button */}
          <button onClick={() => router.back()}
            style={{ position:"absolute", top:52, left:16, width:36, height:36, borderRadius:11, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <ChevronLeft size={18} color="white" />
          </button>
        </div>

        {/* Avatar + actions */}
        <div style={{ padding:"0 20px", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:-28, marginBottom:14 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"3px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, overflow:"hidden", boxShadow:"0 0 20px rgba(139,92,246,0.4)" }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={profile.name} />
                : <span>👤</span>}
            </div>

            {isOwnProfile ? (
              <Link href="/profile/edit" style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#A78BFA", fontSize:13, fontWeight:600, textDecoration:"none" }}>
                Edit Profile
              </Link>
            ) : (
              <div style={{ display:"flex", gap:8 }}>
                <Link href={`/chat/${profile.id}`}
                  style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                  <MessageSquare size={17} color="rgba(255,255,255,0.6)" />
                </Link>
                <button onClick={handleFollow} disabled={followLoading}
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:12, fontSize:13, fontWeight:700, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                    background: isFollowing ? "rgba(139,92,246,0.12)" : "linear-gradient(to right,#8B5CF6,#EC4899)",
                    color: isFollowing ? "rgba(255,255,255,0.5)" : "white",
                    boxShadow: isFollowing ? "none" : "0 0 16px rgba(139,92,246,0.35)",
                  }}>
                  {isFollowing ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              </div>
            )}
          </div>

          <h2 style={{ fontSize:20, fontWeight:800, color:"white", margin:"0 0 2px", letterSpacing:-0.3 }}>{profile.name}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 10px" }}>@{profile.username}</p>
          {profile.bio && (
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", margin:"0 0 16px", lineHeight:1.6 }}>{profile.bio}</p>
          )}

          {/* Stats */}
          <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden", marginBottom:18 }}>
            {[
              { v: formatNum(stats.followers), l:"Followers" },
              { v: formatNum(stats.following), l:"Following" },
              { v: String(stats.stories),      l:"Stories" },
            ].map((s, i) => (
              <div key={i} style={{ flex:1, textAlign:"center", padding:"12px 8px", borderRight: i<2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"white" }}>{s.v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:600, letterSpacing:0.3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stories tab header */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", margin:"0 20px 2px" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 0", borderBottom:"2px solid #8B5CF6", flex:1 }}>
            <Grid3x3 size={18} color="#A78BFA" />
            <span style={{ fontSize:11, color:"#A78BFA", fontWeight:600, fontFamily:"Inter,sans-serif" }}>Stories</span>
          </div>
        </div>

        {/* Story grid */}
        {stories.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px 100px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:0 }}>No stories yet</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, padding:"2px 0 100px" }}>
            {stories.map(s => (
              <Link key={s.id} href={`/story/${s.id}`} style={{ textDecoration:"none" }}>
                <motion.div whileTap={{ scale:0.97 }}
                  style={{ aspectRatio:"1", position:"relative", overflow:"hidden", background:GRADIENTS[s.background_gradient % GRADIENTS.length] || GRADIENTS[0], display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:8 }}>
                  {s.cover_image && (
                    <img src={s.cover_image} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} alt={s.title} />
                  )}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.75))" }} />
                  <div style={{ position:"relative" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"white", lineHeight:1.2, marginBottom:3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" } as any}>
                      {s.title}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                      <Heart size={9} color="#EC4899" fill="#EC4899" />
                      <span style={{ fontSize:9, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>
                        {Number(s.reactions?.[0]?.count) || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
