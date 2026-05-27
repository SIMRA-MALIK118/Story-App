"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Phone, Video } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true });
}

function formatDateLabel(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  from_user: string;
  to_user: string;
  sender?: { id: string; name: string; username: string; avatar_url: string | null };
}

interface Partner {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
}

export default function ChatConversationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const userId = params?.userId as string;
  const me = (user as any)?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = useCallback(async (initial = false) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      const msgs: Message[] = data.data.messages || [];
      setMessages(msgs);
      if (initial && msgs.length > 0) {
        const first = msgs[0];
        const senderData = first.from_user === userId ? first.sender : null;
        if (senderData) setPartner(senderData as Partner);
      }
    } catch {
      // ignore
    } finally {
      if (initial) setLoading(false);
    }
  }, [userId]);

  const connectWS = useCallback(() => {
    if (!me) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const wsBase = apiUrl.replace("/api", "").replace("https://", "wss://").replace("http://", "ws://");
    const ws = new WebSocket(`${wsBase}?userId=${me}`);
    wsRef.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "new_message") {
          const msg: Message = payload.message;
          const isThisConv =
            (msg.from_user === userId && msg.to_user === me) ||
            (msg.from_user === me && msg.to_user === userId);
          if (isThisConv) {
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          }
        } else if (payload.type === "online_users") {
          setOnline((payload.userIds as string[]).includes(userId));
        } else if (payload.type === "user_online" && payload.userId === userId) {
          setOnline(true);
        } else if (payload.type === "user_offline" && payload.userId === userId) {
          setOnline(false);
        }
      } catch {}
    };

    ws.onclose = () => {
      setOnline(false);
      reconnectRef.current = setTimeout(() => connectWS(), 3000);
    };

    ws.onerror = () => ws.close();
  }, [me, userId]);

  useEffect(() => {
    api.get(`/users/id/${userId}`).then(r => {
      const p = r.data.data.profile;
      if (p) setPartner({ id: p.id, name: p.name, username: p.username, avatar_url: p.avatar_url });
    }).catch(() => {});

    loadMessages(true);
    connectWS();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [userId, loadMessages, connectWS]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      const { data } = await api.post(`/messages/${userId}`, { content: trimmed });
      const newMsg: Message = data.data.message;
      setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const grouped: { label: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (!last || last.label !== label) grouped.push({ label, msgs: [msg] });
    else last.msgs.push(msg);
  }

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 16px 12px", background:"rgba(13,13,20,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => router.back()}
          style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px 4px 0", color:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center" }}>
          <ChevronLeft size={24} />
        </button>

        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, overflow:"hidden", flexShrink:0, position:"relative" }}>
          {partner?.avatar_url
            ? <img src={partner.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
            : "👤"}
          {online && (
            <div style={{ position:"absolute", bottom:1, right:1, width:10, height:10, borderRadius:"50%", background:"#34D399", border:"2px solid #0D0D14" }} />
          )}
        </div>

        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"white" }}>{partner?.name || partner?.username || "..."}</div>
          <div style={{ fontSize:11, color: online ? "#34D399" : "rgba(139,92,246,0.8)" }}>
            {online ? "Online" : `@${partner?.username || "..."}`}
          </div>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <div style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Phone size={16} color="rgba(255,255,255,0.4)" />
          </div>
          <div style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Video size={16} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }} className="no-scrollbar">
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display:"flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                <div style={{ height:36, width:`${40 + i * 20}%`, borderRadius:16, background:"rgba(255,255,255,0.05)" }} />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👋</div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:0 }}>
              Say hi to {partner?.name || "them"}!
            </p>
          </div>
        )}

        {!loading && grouped.map(group => (
          <div key={group.label}>
            <div style={{ textAlign:"center", margin:"12px 0 8px" }}>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)", background:"rgba(255,255,255,0.05)", borderRadius:50, padding:"3px 12px", fontWeight:600 }}>
                {group.label}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {group.msgs.map((msg) => {
                const isMine = msg.from_user === me;
                return (
                  <motion.div key={msg.id}
                    initial={{ opacity:0, y:8, scale:0.96 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom:6 }}
                  >
                    {!isMine && (
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginRight:8, alignSelf:"flex-end", flexShrink:0, overflow:"hidden" }}>
                        {partner?.avatar_url
                          ? <img src={partner.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                          : "👤"}
                      </div>
                    )}
                    <div style={{ maxWidth:"72%" }}>
                      <div style={{
                        padding:"10px 14px",
                        borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMine ? "linear-gradient(135deg,#7C3AED,#EC4899)" : "rgba(255,255,255,0.07)",
                        border: isMine ? "none" : "1px solid rgba(255,255,255,0.08)",
                        fontSize:14, color:"white", lineHeight:1.5, wordBreak:"break-word",
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:3, textAlign: isMine ? "right" : "left", paddingLeft: isMine ? 0 : 4 }}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px 24px", background:"rgba(13,13,20,0.95)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:22, padding:"12px 18px", color:"white", fontSize:14, outline:"none", fontFamily:"Inter,sans-serif" }}
        />
        <button onClick={sendMsg} disabled={!text.trim() || sending}
          style={{ width:44, height:44, borderRadius:"50%", background: text.trim() ? "linear-gradient(135deg,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)", border:"none", cursor: text.trim() ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow: text.trim() ? "0 0 16px rgba(139,92,246,0.4)" : "none" }}>
          <Send size={18} color={text.trim() ? "white" : "rgba(255,255,255,0.3)"} />
        </button>
      </div>
    </div>
  );
}
