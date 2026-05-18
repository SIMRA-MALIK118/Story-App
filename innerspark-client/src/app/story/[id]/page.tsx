"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, MessageCircle, Bookmark, Share2, Send, Edit2, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#1a0a2e,#6d28d9)",
  "linear-gradient(135deg,#78350f,#b45309)",
];

const MOOD_EMOJIS: Record<string, string> = {
  growth: "🌱", courage: "💪", success: "✨", love: "❤️",
  healing: "🌊", wisdom: "💡", general: "💜", fire: "🔥",
  happy: "😊", sad: "😔", driven: "💪",
};

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: { name: string; username: string; avatar_url: string | null };
}

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
  views_count: number;
  profiles?: { id?: string; name: string; username: string; avatar_url: string | null; bio: string | null };
  reactions?: Array<{ id: string; type: string; user_id: string }>;
  comments?: Comment[];
}

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const id = params?.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/stories/${id}`);
        const s: Story = data.data.story;
        setStory(s);
        const likes = (s.reactions || []).filter((r: any) => r.type === "like");
        setLikeCount(likes.length);
        setComments(s.comments || []);
      } catch {
        // story not found
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
    try { await api.post(`/stories/${id}/like`); } catch {}
  };

  const handleFollow = async () => {
    if (!story) return;
    const authorId = story.user_id;
    setIsFollowing(f => !f);
    try { await api.post(`/users/${authorId}/follow`); } catch {}
  };

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    try { await api.post(`/stories/${id}/save`); } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim() || postingComment) return;
    setPostingComment(true);
    setCommentError("");
    try {
      const { data } = await api.post(`/stories/${id}/comments`, { content: commentText });
      const newComment: Comment = data.data?.comment || {
        id: Date.now().toString(),
        content: commentText,
        created_at: new Date().toISOString(),
        profiles: { name: (user as any)?.name || "You", username: (user as any)?.username || "user", avatar_url: (user as any)?.avatar_url || null },
      };
      setComments(c => [...c, newComment]);
      setCommentText("");
    } catch (err: any) {
      setCommentError(err.response?.data?.message || "Failed to post. Please try again.");
    }
    setPostingComment(false);
  };

  if (loading) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:44, height:44, border:"3px solid rgba(139,92,246,0.3)", borderTop:"3px solid #8B5CF6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Loading story...</span>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24 }}>
        <div style={{ fontSize:48 }}>📭</div>
        <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:0 }}>Story not found</h3>
        <button onClick={() => router.back()} style={{ padding:"10px 24px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#A78BFA", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>Go back</button>
      </div>
    );
  }

  const gradient = GRADIENTS[story.background_gradient % GRADIENTS.length] || GRADIENTS[0];
  const moodEmoji = MOOD_EMOJIS[(story.mood || "general").toLowerCase()] || "💜";

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", position:"relative" }}>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto" }} className="no-scrollbar">

        {/* Hero — cover image or gradient */}
        <div style={{ position:"relative", height: story.cover_image ? 240 : 200 }}>
          {story.cover_image ? (
            <img src={story.cover_image} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={story.title} />
          ) : (
            <div style={{ width:"100%", height:"100%", background:gradient }} />
          )}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(13,13,20,0.95) 100%)" }} />

          {/* Back + actions */}
          <div style={{ position:"absolute", top:52, left:16, right:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button onClick={() => router.back()}
              style={{ width:38, height:38, borderRadius:12, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <ChevronLeft size={20} color="white" />
            </button>
            {story.user_id === (user as any)?.id && (
              <Link href={`/story/${id}/edit`}
                style={{ width:38, height:38, borderRadius:12, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                <Edit2 size={17} color="white" />
              </Link>
            )}
          </div>

          {/* Mood badge */}
          <div style={{ position:"absolute", bottom:16, left:16 }}>
            <span style={{ fontSize:12, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:50, padding:"5px 12px", color:"white", fontWeight:700 }}>
              {moodEmoji} {story.mood || story.category}
            </span>
          </div>
        </div>

        {/* Story body */}
        <div style={{ padding:"20px 20px 0" }}>

          {/* Author row */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            {story.is_anonymous ? (
              <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"2px solid rgba(139,92,246,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🎭</div>
            ) : (
              <Link href={`/profile/u/${story.user_id}`} style={{ textDecoration:"none", flexShrink:0 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"2px solid rgba(139,92,246,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, overflow:"hidden" }}>
                  {story.profiles?.avatar_url
                    ? <img src={story.profiles.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                    : "👤"}
                </div>
              </Link>
            )}
            <div style={{ flex:1 }}>
              {story.is_anonymous ? (
                <div style={{ fontSize:15, fontWeight:700, color:"white" }}>Anonymous</div>
              ) : (
                <Link href={`/profile/u/${story.user_id}`} style={{ textDecoration:"none" }}>
                  <div style={{ fontSize:15, fontWeight:700, color:"white" }}>{story.profiles?.name || "User"}</div>
                </Link>
              )}
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>
                {!story.is_anonymous && story.profiles?.username && `@${story.profiles.username} · `}
                {timeAgo(story.created_at)}
              </div>
            </div>
            {!story.is_anonymous && story.user_id !== (user as any)?.id && (
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={handleFollow}
                  style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:10, fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                    background: isFollowing ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.25)",
                    color: isFollowing ? "rgba(255,255,255,0.5)" : "#A78BFA",
                  }}>
                  {isFollowing ? <Check size={12} /> : <UserPlus size={12} />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <Link href={`/chat/${story.user_id}`}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", textDecoration:"none" }}>
                  <MessageCircle size={15} color="rgba(255,255,255,0.5)" />
                </Link>
              </div>
            )}
            {(!story.is_anonymous || story.user_id === (user as any)?.id) && (
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"4px 10px" }}>
                {story.views_count?.toLocaleString() || 0} reads
              </div>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontSize:24, fontWeight:800, color:"white", margin:"0 0 20px", lineHeight:1.25, letterSpacing:-0.5 }}>
            {story.title}
          </h1>

          {/* Content */}
          <div style={{ fontSize:16, color:"rgba(255,255,255,0.75)", lineHeight:1.85, fontFamily:"Lora,serif", marginBottom:32, whiteSpace:"pre-wrap" }}>
            {story.content}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:"rgba(255,255,255,0.07)", marginBottom:20 }} />

          {/* Action bar */}
          <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:24 }}>
            <button onClick={handleLike}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", borderRadius:14, background: liked ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.05)", border: liked ? "1px solid rgba(236,72,153,0.25)" : "1px solid rgba(255,255,255,0.08)", cursor:"pointer", transition:"all 0.2s" }}>
              <Heart size={18} color={liked ? "#EC4899" : "rgba(255,255,255,0.5)"} fill={liked ? "#EC4899" : "none"} />
              <span style={{ fontSize:13, color: liked ? "#EC4899" : "rgba(255,255,255,0.5)", fontWeight:700, fontFamily:"Inter,sans-serif" }}>
                {likeCount.toLocaleString()}
              </span>
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", borderRadius:14, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)" }}>
              <MessageCircle size={18} color="#A78BFA" />
              <span style={{ fontSize:13, color:"#A78BFA", fontWeight:700, fontFamily:"Inter,sans-serif" }}>
                {comments.length}
              </span>
            </div>

            <div style={{ flex:1 }} />

            <button onClick={handleBookmark}
              style={{ width:44, height:44, borderRadius:14, background: bookmarked ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.05)", border: bookmarked ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Bookmark size={18} color={bookmarked ? "#A78BFA" : "rgba(255,255,255,0.5)"} fill={bookmarked ? "#A78BFA" : "none"} />
            </button>

            <button style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Share2 size={18} color="rgba(255,255,255,0.5)" />
            </button>
          </div>

          {/* Comments section — always visible */}
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:"white", margin:"0 0 16px" }}>
              Comments {comments.length > 0 && <span style={{ color:"rgba(255,255,255,0.35)", fontWeight:400 }}>({comments.length})</span>}
            </h3>

            {/* Comment input */}
            <div style={{ display:"flex", gap:10, alignItems:"flex-end", marginBottom: commentError ? 8 : 20 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, overflow:"hidden" }}>
                {(user as any)?.avatar_url
                  ? <img src={(user as any).avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                  : "👤"}
              </div>
              <div style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                  placeholder="Write a comment... (Enter to send)"
                  style={{ flex:1, background:"transparent", border:"none", color:"white", fontSize:14, outline:"none", fontFamily:"Inter,sans-serif" }}
                />
                <button onClick={handleComment} disabled={!commentText.trim() || postingComment}
                  style={{ background:"none", border:"none", cursor: commentText.trim() ? "pointer" : "default", color: commentText.trim() ? "#A78BFA" : "rgba(255,255,255,0.2)", display:"flex", alignItems:"center" }}>
                  {postingComment
                    ? <div style={{ width:16, height:16, border:"2px solid rgba(139,92,246,0.3)", borderTop:"2px solid #A78BFA", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                    : <Send size={16} />}
                </button>
              </div>
            </div>

            {commentError && (
              <p style={{ fontSize:12, color:"#F87171", margin:"0 0 14px 46px" }}>{commentError}</p>
            )}

            {/* Comment list */}
              {comments.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px 0 40px", color:"rgba(255,255,255,0.3)", fontSize:13 }}>
                  Be the first to comment 💬
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:14, paddingBottom:100 }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0, overflow:"hidden" }}>
                        {c.profiles?.avatar_url
                          ? <img src={c.profiles.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                          : "👤"}
                      </div>
                      <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"10px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:"white" }}>{c.profiles?.name || "User"}</span>
                          <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{timeAgo(c.created_at)}</span>
                        </div>
                        <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", margin:0, lineHeight:1.5, fontFamily:"Lora,serif" }}>{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div style={{ height:60 }} />
        </div>
      </div>
    </div>
  );
}
