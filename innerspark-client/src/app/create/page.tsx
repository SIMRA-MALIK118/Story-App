"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, Send, Loader, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";

const MOODS = [
  { e:"🌱", l:"Growth",  v:"growth" },
  { e:"🔥", l:"Courage", v:"courage" },
  { e:"❤️", l:"Love",    v:"love" },
  { e:"😔", l:"Sad",     v:"sad" },
  { e:"😊", l:"Happy",   v:"happy" },
  { e:"💪", l:"Driven",  v:"driven" },
];

const GRADIENTS = [
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#be185d,#9f1239)",
  "linear-gradient(135deg,#0c4a6e,#0369a1)",
  "linear-gradient(135deg,#14532d,#15803d)",
  "linear-gradient(135deg,#1a0a2e,#6d28d9)",
  "linear-gradient(135deg,#78350f,#b45309)",
];

export default function CreateStoryPage() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write"|"ai">("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedGrad, setSelectedGrad] = useState(0);
  const [isAnon, setIsAnon] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [error, setError] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError("");
    try {
      const { data } = await api.post("/ai/generate", { prompt: aiPrompt, mood: selectedMood || undefined });
      setTitle(data.data.title);
      setContent(data.data.content);
      setSelectedMood(data.data.mood || "growth");
      setAiGenerated(true);
      setTab("write");
    } catch (err: any) {
      setError(err.response?.data?.message || "AI generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
    if (imageRef.current) imageRef.current.value = "";
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please add a title and your story before posting.");
      return;
    }
    setIsPosting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      form.append("mood", selectedMood || "general");
      form.append("category", MOODS.find(m => m.v === selectedMood)?.l || "General");
      form.append("background_gradient", String(selectedGrad));
      form.append("is_anonymous", String(isAnon));
      form.append("is_ai_generated", String(aiGenerated));
      if (coverImage) form.append("cover_image", coverImage);

      await api.post("/stories", form, { headers: { "Content-Type": "multipart/form-data" } });
      router.replace("/feed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post story. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/feed" style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.7)" />
          </Link>
          <h1 style={{ fontSize:18, fontWeight:800, color:"white", margin:0 }}>Create Story</h1>
        </div>
        <button onClick={handlePost} disabled={isPosting}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, background: isPosting ? "rgba(139,92,246,0.4)" : "linear-gradient(to right,#8B5CF6,#EC4899)", border:"none", cursor: isPosting ? "default" : "pointer", color:"white", fontSize:13, fontWeight:700, fontFamily:"Inter,sans-serif", boxShadow:"0 0 16px rgba(139,92,246,0.3)" }}>
          {isPosting ? <Loader size={14} style={{ animation:"spin 1s linear infinite" }} /> : <Send size={14} />}
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ margin:"0 20px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"10px 14px", flexShrink:0 }}>
          <p style={{ fontSize:13, color:"#F87171", margin:0 }}>{error}</p>
        </div>
      )}

      {/* Mode tabs */}
      <div style={{ display:"flex", margin:"0 20px 16px", background:"rgba(255,255,255,0.05)", borderRadius:14, padding:4, flexShrink:0 }}>
        {[["write","✍️ Write"], ["ai","✨ AI Generate"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v as "write"|"ai")}
            style={{ flex:1, padding:"9px", borderRadius:11, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"Inter,sans-serif", transition:"all 0.2s",
              background: tab===v ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "transparent",
              color: tab===v ? "white" : "rgba(255,255,255,0.4)",
              boxShadow: tab===v ? "0 0 14px rgba(139,92,246,0.3)" : "none",
            }}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 32px" }} className="no-scrollbar">
        <AnimatePresence mode="wait">
          {tab === "ai" ? (
            <motion.div key="ai" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:20, padding:"16px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <Sparkles size={16} color="#A78BFA" />
                  <span style={{ fontSize:14, fontWeight:700, color:"#A78BFA" }}>AI Story Generator</span>
                </div>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.5 }}>
                  Describe how you feel or what happened — AI will craft a powerful motivational story for you.
                </p>
              </div>

              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"16px", marginBottom:16 }}>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", fontWeight:600 }}>HOW DO YOU FEEL RIGHT NOW?</p>
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder={"\"I feel burnt out and ready to give up...\"\n\"I just lost my job and I don't know what to do\"\n\"I want to share how I overcame my fear\""}
                  rows={5}
                  style={{ width:"100%", background:"transparent", border:"none", color:"white", fontSize:14, fontFamily:"Lora,serif", outline:"none", resize:"none", lineHeight:1.7, boxSizing:"border-box" }}
                />
              </div>

              <button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()}
                style={{ width:"100%", padding:"15px", borderRadius:16, background: aiPrompt.trim() ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)", border:"none", cursor: aiPrompt.trim() ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow: aiPrompt.trim() ? "0 0 20px rgba(139,92,246,0.3)" : "none" }}>
                {isGenerating
                  ? <><Loader size={18} color="white" style={{ animation:"spin 1s linear infinite" }} /><span style={{ fontSize:14, fontWeight:700, color:"white", fontFamily:"Inter,sans-serif" }}>Generating your story...</span></>
                  : <><Sparkles size={18} color={aiPrompt.trim() ? "white" : "rgba(255,255,255,0.3)"} /><span style={{ fontSize:14, fontWeight:700, color: aiPrompt.trim() ? "white" : "rgba(255,255,255,0.3)", fontFamily:"Inter,sans-serif" }}>Generate with AI</span></>
                }
              </button>
            </motion.div>
          ) : (
            <motion.div key="write" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {aiGenerated && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:12, padding:"10px 14px" }}>
                  <Sparkles size={14} color="#34D399" />
                  <span style={{ fontSize:12, color:"#34D399", fontWeight:600 }}>AI story generated — edit freely below!</span>
                </div>
              )}

              {/* Cover Image Upload */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>
                {coverPreview ? (
                  <div style={{ position:"relative" }}>
                    <img src={coverPreview} alt="Cover" style={{ width:"100%", height:160, objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))" }} />
                    <button onClick={removeCoverImage}
                      style={{ position:"absolute", top:10, right:10, width:30, height:30, borderRadius:"50%", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <X size={14} color="white" />
                    </button>
                    <button onClick={() => imageRef.current?.click()}
                      style={{ position:"absolute", bottom:10, right:10, display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", color:"white", fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif" }}>
                      <ImageIcon size={13} /> Change
                    </button>
                  </div>
                ) : (
                  <button onClick={() => imageRef.current?.click()}
                    style={{ width:"100%", padding:"20px 16px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:14, background:"rgba(139,92,246,0.1)", border:"1px dashed rgba(139,92,246,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <ImageIcon size={20} color="#A78BFA" />
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"white" }}>Add Cover Photo</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Optional · JPG, PNG, WebP</div>
                    </div>
                  </button>
                )}
                <input ref={imageRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display:"none" }} />
              </div>

              {/* Background picker (shown only when no image) */}
              {!coverPreview && (
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 12px", fontWeight:600, letterSpacing:0.5 }}>BACKGROUND COLOR</p>
                <div style={{ display:"flex", gap:8 }}>
                  {GRADIENTS.map((g, i) => (
                    <button key={i} onClick={() => setSelectedGrad(i)}
                      style={{ width:40, height:40, borderRadius:12, background:g, border: selectedGrad===i ? "2.5px solid white" : "2px solid transparent", cursor:"pointer", flexShrink:0, boxShadow: selectedGrad===i ? "0 0 10px rgba(255,255,255,0.2)" : "none" }}
                    />
                  ))}
                </div>
              </div>
              )}

              {/* Title */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", fontWeight:600, letterSpacing:0.5 }}>STORY TITLE</p>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a title..."
                  style={{ width:"100%", background:"transparent", border:"none", color:"white", fontSize:17, fontWeight:700, outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box", letterSpacing:-0.3 }}
                />
              </div>

              {/* Content */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", fontWeight:600, letterSpacing:0.5 }}>YOUR STORY</p>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing your story..." rows={8}
                  style={{ width:"100%", background:"transparent", border:"none", color:"rgba(255,255,255,0.85)", fontSize:14, fontFamily:"Lora,serif", outline:"none", resize:"none", lineHeight:1.8, boxSizing:"border-box" }}
                />
              </div>

              {/* Mood */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 12px", fontWeight:600, letterSpacing:0.5 }}>MOOD TAG</p>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {MOODS.map(m => (
                    <button key={m.v} onClick={() => setSelectedMood(m.v)}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:50, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"Inter,sans-serif", transition:"all 0.2s",
                        background: selectedMood===m.v ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)",
                        color: selectedMood===m.v ? "white" : "rgba(255,255,255,0.5)",
                      }}>
                      <span>{m.e}</span><span>{m.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Anonymous toggle */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"white" }}>Post Anonymously</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>Your name will be hidden</div>
                </div>
                <button onClick={() => setIsAnon(!isAnon)}
                  style={{ width:44, height:26, borderRadius:13, background: isAnon ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.12)", border:"none", cursor:"pointer", position:"relative", transition:"all 0.3s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"white", position:"absolute", top:3, left: isAnon ? 21 : 3, transition:"left 0.3s" }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
