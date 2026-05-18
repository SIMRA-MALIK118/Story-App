"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Search, Edit2 } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/shared/BottomNav";
import api from "@/services/api";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Conversation {
  partner: { id: string; name: string; username: string; avatar_url: string | null };
  latestMessage: { content: string; created_at: string; from_user: string };
  unread: number;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/messages")
      .then(r => setConversations(r.data.data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter(c =>
    c.partner.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.partner.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 14px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <MessageSquare size={14} color="#A78BFA" />
              <span style={{ fontSize:13, fontWeight:700, color:"#A78BFA", letterSpacing:0.5 }}>MESSAGES</span>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"white", margin:0, letterSpacing:-0.5 }}>Chats</h1>
          </div>
          <div style={{ width:38, height:38, borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Edit2 size={16} color="#A78BFA" />
          </div>
        </div>

        {/* Search */}
        <div style={{ position:"relative" }}>
          <Search size={15} color="rgba(255,255,255,0.3)" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 16px 12px 40px", color:"white", fontSize:14, outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90 }} className="no-scrollbar">

        {loading && (
          <div style={{ padding:"0 20px" }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(255,255,255,0.06)", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:13, width:"40%", borderRadius:6, background:"rgba(255,255,255,0.06)", marginBottom:8 }} />
                  <div style={{ height:11, width:"70%", borderRadius:6, background:"rgba(255,255,255,0.04)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>💬</div>
            <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:"0 0 8px" }}>No conversations yet</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 20px" }}>
              Visit someone's story and send them a message!
            </p>
            <Link href="/explore" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:12, background:"linear-gradient(to right,#8B5CF6,#EC4899)", color:"white", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              Explore Stories
            </Link>
          </div>
        )}

        {!loading && filtered.map((conv, i) => (
          <motion.div key={conv.partner.id}
            initial={{ opacity:0, x:-10 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay:i * 0.05 }}
          >
            <Link href={`/chat/${conv.partner.id}`} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", position:"relative" }}>
              {/* Avatar */}
              <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, overflow:"hidden", position:"relative" }}>
                {conv.partner.avatar_url
                  ? <img src={conv.partner.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={conv.partner.name} />
                  : "👤"}
                {conv.unread > 0 && (
                  <div style={{ position:"absolute", top:0, right:0, width:16, height:16, borderRadius:"50%", background:"#EC4899", border:"2px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"white" }}>{conv.unread > 9 ? "9+" : conv.unread}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:15, fontWeight: conv.unread > 0 ? 700 : 600, color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {conv.partner.name || conv.partner.username}
                  </span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", flexShrink:0, marginLeft:8 }}>
                    {timeAgo(conv.latestMessage.created_at)}
                  </span>
                </div>
                <p style={{ fontSize:13, color: conv.unread > 0 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight: conv.unread > 0 ? 500 : 400 }}>
                  {conv.latestMessage.content}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
