"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Heart, MessageCircle, UserPlus, ChevronLeft, BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/shared/BottomNav";
import api from "@/services/api";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Notif {
  id: string;
  type: "like" | "comment" | "follow" | "new_post" | "message";
  is_read: boolean;
  created_at: string;
  story_id: string | null;
  actor: { id: string; name: string; username: string; avatar_url: string | null } | null;
  story: { id: string; title: string } | null;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; text: string }> = {
  like:     { icon: Heart,          color: "#EC4899", bg: "rgba(236,72,153,0.15)", text: "liked your story" },
  comment:  { icon: MessageCircle,  color: "#A78BFA", bg: "rgba(139,92,246,0.15)", text: "commented on" },
  follow:   { icon: UserPlus,       color: "#34D399", bg: "rgba(52,211,153,0.15)", text: "started following you" },
  new_post: { icon: BookOpen,       color: "#FBBF24", bg: "rgba(251,191,36,0.15)", text: "posted a new story" },
  message:  { icon: MessageSquare,  color: "#60A5FA", bg: "rgba(96,165,250,0.15)", text: "sent you a message" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get("/notifications")
      .then(r => {
        const list: Notif[] = r.data.data.notifications || [];
        setNotifs(list);
        setUnread(list.filter(n => !n.is_read).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    api.put("/notifications/read").catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
  };

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 14px", flexShrink:0, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <button onClick={() => router.back()}
            style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", display:"flex", padding:"4px 8px 4px 0" }}>
            <ChevronLeft size={22} />
          </button>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <Bell size={13} color="#A78BFA" />
              <span style={{ fontSize:12, fontWeight:700, color:"#A78BFA", letterSpacing:0.5 }}>ACTIVITY</span>
            </div>
            <h1 style={{ fontSize:20, fontWeight:800, color:"white", margin:0 }}>Notifications</h1>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ fontSize:12, color:"#A78BFA", fontWeight:600, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90 }} className="no-scrollbar">

        {loading && (
          <div style={{ padding:"0 20px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.05)", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:12, width:"60%", borderRadius:6, background:"rgba(255,255,255,0.06)", marginBottom:8 }} />
                  <div style={{ height:10, width:"30%", borderRadius:6, background:"rgba(255,255,255,0.04)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifs.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🔔</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:"0 0 8px" }}>No notifications yet</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 24px", lineHeight:1.6 }}>
              When someone likes your story, comments or follows you — it shows up here
            </p>
            <Link href="/explore" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, background:"linear-gradient(to right,#8B5CF6,#EC4899)", color:"white", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              Explore Stories
            </Link>
          </div>
        )}

        {!loading && notifs.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.like;
          const Icon = cfg.icon;
          const href = n.type === "follow"
            ? `/profile/u/${n.actor?.id}`
            : n.type === "message"
            ? `/chat/${n.actor?.id}`
            : n.story_id ? `/story/${n.story_id}` : `#`;

          return (
            <motion.div key={n.id}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:i * 0.04 }}
            >
              <Link href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", background: !n.is_read ? "rgba(139,92,246,0.04)" : "transparent" }}>

                {/* Avatar + type badge */}
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(139,92,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, overflow:"hidden" }}>
                    {n.actor?.avatar_url
                      ? <img src={n.actor.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                      : "👤"}
                  </div>
                  <div style={{ position:"absolute", bottom:-2, right:-2, width:22, height:22, borderRadius:"50%", background:cfg.bg, border:"2.5px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={11} color={cfg.color} fill={n.type === "like" ? cfg.color : "none"} />
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, color:"white", margin:"0 0 4px", lineHeight:1.45 }}>
                    <span style={{ fontWeight:700 }}>{n.actor?.name || n.actor?.username || "Someone"}</span>
                    {" "}
                    <span style={{ color:"rgba(255,255,255,0.55)", fontWeight: n.is_read ? 400 : 500 }}>
                      {cfg.text}
                    </span>
                    {n.story && n.type !== "follow" && n.type !== "message" && (
                      <span style={{ fontWeight:600, color:"#A78BFA" }}>
                        {" "}"{n.story.title}"
                      </span>
                    )}
                  </p>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{timeAgo(n.created_at)}</span>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div style={{ width:9, height:9, borderRadius:"50%", background:"#8B5CF6", flexShrink:0 }} />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
