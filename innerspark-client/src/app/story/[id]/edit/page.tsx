"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ImagePlus, X, Sparkles, Check } from "lucide-react";
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

const MOODS = ["general","growth","courage","success","love","healing","wisdom"];
const CATS  = ["General","Success","Growth","Courage","Love","Healing","Wisdom","Goals"];

const MOOD_EMOJI: Record<string, string> = {
  general:"💜", growth:"🌱", courage:"💪", success:"✨",
  love:"❤️", healing:"🌊", wisdom:"💡",
};

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [mood, setMood]         = useState("general");
  const [category, setCategory] = useState("General");
  const [gradient, setGradient] = useState(0);
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);

  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/stories/${id}`)
      .then(r => {
        const s = r.data.data.story;
        if (s.user_id !== (user as any)?.id) {
          router.replace(`/story/${id}`);
          return;
        }
        setTitle(s.title || "");
        setContent(s.content || "");
        setMood(s.mood || "general");
        setCategory(s.category || "General");
        setGradient(s.background_gradient || 0);
        setCurrentCover(s.cover_image || null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user, router]);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewCoverFile(file);
    setNewCoverPreview(URL.createObjectURL(file));
  };

  const removeNewCover = () => {
    setNewCoverFile(null);
    setNewCoverPreview(null);
    if (imgRef.current) imgRef.current.value = "";
  };

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // If user picked a new cover, we need to upload via story update
      // For now, use FormData to support optional image
      const form = new FormData();
      form.append("title", title.trim());
      form.append("content", content.trim());
      form.append("mood", mood);
      form.append("category", category);
      form.append("background_gradient", String(gradient));
      if (newCoverFile) form.append("cover_image", newCoverFile);

      await api.put(`/stories/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.replace(`/story/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(139,92,246,0.3)", borderTop:"3px solid #8B5CF6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
        <div style={{ fontSize:48 }}>📭</div>
        <h3 style={{ fontSize:18, fontWeight:700, color:"white", margin:0 }}>Story not found</h3>
        <button onClick={() => router.back()} style={{ padding:"10px 24px", borderRadius:12, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#A78BFA", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>Go back</button>
      </div>
    );
  }

  const coverDisplay = newCoverPreview || currentCover;

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 14px", flexShrink:0, display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={() => router.back()}
          style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", display:"flex", padding:"4px 8px 4px 0" }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:1 }}>
            <Sparkles size={12} color="#A78BFA" />
            <span style={{ fontSize:11, fontWeight:700, color:"#A78BFA", letterSpacing:0.5 }}>EDITING</span>
          </div>
          <h1 style={{ fontSize:18, fontWeight:800, color:"white", margin:0 }}>Edit Story</h1>
        </div>
        <button onClick={save} disabled={saving || !title.trim() || !content.trim()}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:12, fontSize:13, fontWeight:700, fontFamily:"Inter,sans-serif", cursor: saving ? "default" : "pointer", border:"none", transition:"all 0.2s",
            background: (!title.trim() || !content.trim()) ? "rgba(255,255,255,0.06)" : "linear-gradient(to right,#8B5CF6,#EC4899)",
            color: (!title.trim() || !content.trim()) ? "rgba(255,255,255,0.3)" : "white",
            boxShadow: (!title.trim() || !content.trim()) ? "none" : "0 0 16px rgba(139,92,246,0.35)",
          }}>
          {saving
            ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
            : <><Check size={14} /> Save</>}
        </button>
      </div>

      {/* Form */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 100px" }} className="no-scrollbar">

        {error && (
          <div style={{ marginBottom:16, padding:"12px 16px", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:12, fontSize:13, color:"#F87171" }}>
            {error}
          </div>
        )}

        {/* Cover image */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>COVER IMAGE</label>
          {coverDisplay ? (
            <div style={{ position:"relative", height:160, borderRadius:16, overflow:"hidden" }}>
              <img src={coverDisplay} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="cover" />
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                <button onClick={() => imgRef.current?.click()}
                  style={{ padding:"8px 16px", borderRadius:10, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", color:"white", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                  Change
                </button>
                <button onClick={() => { setCurrentCover(null); removeNewCover(); }}
                  style={{ width:34, height:34, borderRadius:10, background:"rgba(248,113,113,0.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(248,113,113,0.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <X size={15} color="#F87171" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => imgRef.current?.click()}
              style={{ width:"100%", height:100, borderRadius:16, background:"rgba(255,255,255,0.03)", border:"2px dashed rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}>
              <ImagePlus size={22} color="rgba(255,255,255,0.25)" />
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)", fontFamily:"Inter,sans-serif" }}>Add cover image</span>
            </button>
          )}
          <input ref={imgRef} type="file" accept="image/*" onChange={pickImage} style={{ display:"none" }} />
        </div>

        {/* Title */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>TITLE</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Give your story a title..."
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, padding:"14px 16px", color:"white", fontSize:16, fontWeight:700, outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
          />
        </div>

        {/* Content */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>STORY</label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Write your story here..."
            rows={10}
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, padding:"14px 16px", color:"white", fontSize:15, lineHeight:1.7, outline:"none", fontFamily:"Lora,serif", boxSizing:"border-box", resize:"none" }}
          />
          <div style={{ textAlign:"right", fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:6 }}>
            {content.length} characters
          </div>
        </div>

        {/* Mood */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>MOOD</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {MOODS.map(m => (
              <button key={m} onClick={() => setMood(m)}
                style={{ padding:"8px 14px", borderRadius:50, fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                  background: mood===m ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)",
                  color: mood===m ? "white" : "rgba(255,255,255,0.5)",
                }}>
                {MOOD_EMOJI[m]} {m.charAt(0).toUpperCase()+m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>CATEGORY</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding:"8px 14px", borderRadius:50, fontSize:13, fontWeight:600, fontFamily:"Inter,sans-serif", cursor:"pointer", border:"none", transition:"all 0.2s",
                  background: category===c ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)",
                  color: category===c ? "#A78BFA" : "rgba(255,255,255,0.5)",
                  outline: category===c ? "1px solid rgba(139,92,246,0.4)" : "none",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Background gradient (only shown if no cover image) */}
        {!coverDisplay && (
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:0.5, display:"block", marginBottom:10 }}>BACKGROUND COLOR</label>
            <div style={{ display:"flex", gap:10 }}>
              {GRADIENTS.map((g, i) => (
                <button key={i} onClick={() => setGradient(i)}
                  style={{ width:40, height:40, borderRadius:12, background:g, border: gradient===i ? "3px solid white" : "3px solid transparent", cursor:"pointer", boxShadow: gradient===i ? "0 0 12px rgba(139,92,246,0.5)" : "none", transition:"all 0.2s" }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
