"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Camera, User } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const AVATAR_EMOJIS = ["🦋", "🌙", "⚡", "🔥", "🌊", "🌸", "🦁", "🐺", "🦅", "🌟", "💎", "🎯"];

const INTERESTS = [
  { e:"🏆", l:"Success",       d:"Inspiring journeys" },
  { e:"🧠", l:"Mental Health", d:"Healing & hope" },
  { e:"⚡", l:"Discipline",    d:"Building habits" },
  { e:"🌱", l:"Self Growth",   d:"Transformation" },
  { e:"💞", l:"Relationships", d:"Love & connection" },
  { e:"🔥", l:"Courage",       d:"Facing fears" },
  { e:"💪", l:"Comeback",      d:"Rising after fall" },
  { e:"❤️", l:"Love Stories",  d:"Stories of heart" },
];

const MOODS = [
  { e:"😊", l:"Happy",    c:"#FBBF24" },
  { e:"😔", l:"Sad",      c:"#60A5FA" },
  { e:"🌱", l:"Growing",  c:"#34D399" },
  { e:"💪", l:"Motivated",c:"#FB923C" },
  { e:"😴", l:"Tired",    c:"#94A3B8" },
  { e:"😰", l:"Anxious",  c:"#F87171" },
  { e:"🔥", l:"On Fire",  c:"#EC4899" },
  { e:"💭", l:"Lost",     c:"#A78BFA" },
];

const STEPS = [
  { id:0, title:"Set up your profile", sub:"Add a photo and username" },
  { id:1, title:"What moves you?",     sub:"Pick topics you want stories about" },
  { id:2, title:"How are you feeling?",sub:"We'll personalize your first feed" },
  { id:3, title:"You're all set! 🎉",  sub:"InnerSpark is ready for you" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Step 0 profile fields
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🦋");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState("");

  const toggleInterest = (l: string) =>
    setInterests(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const canNext =
    step === 0 ? username.trim().length >= 3 :
    step === 1 ? interests.length >= 2 :
    step === 2 ? !!mood : true;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleNext = async () => {
    if (step === 0) {
      // Validate username
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        setUsernameError("3-20 chars, only letters/numbers/underscore");
        return;
      }
      setUsernameError("");
      setIsSaving(true);
      try {
        // Upload avatar if file selected
        if (avatarFile) {
          const form = new FormData();
          form.append("avatar", avatarFile);
          await api.post("/users/me/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
        }
        // Save profile
        await api.put("/users/me/profile", { username, bio: bio || null });
      } catch (err: any) {
        setUsernameError(err.response?.data?.message || "Failed to save profile");
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    if (step < 3) setStep(s => s + 1);
    else router.push("/feed");
  };

  return (
    <div style={{ width:"100%", height:"100%", background:"linear-gradient(180deg,#0D0D14 0%,#1a0a2e 100%)", display:"flex", flexDirection:"column" }}>

      {/* Progress */}
      <div style={{ padding:"52px 20px 0", flexShrink:0 }}>
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {STEPS.map((_, i) => (
            <motion.div key={i}
              animate={{ width: i <= step ? "100%" : "28px", background: i < step ? "linear-gradient(to right,#8B5CF6,#EC4899)" : i===step ? "#8B5CF6" : "rgba(255,255,255,0.1)" }}
              transition={{ duration:0.4 }}
              style={{ height:4, borderRadius:50, flex: i <= step ? 1 : "none" }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <p style={{ fontSize:12, color:"#A78BFA", fontWeight:700, letterSpacing:1, margin:"0 0 6px" }}>STEP {step+1} OF 4</p>
            <h1 style={{ fontSize:26, fontWeight:800, color:"white", margin:"0 0 6px", letterSpacing:-0.5 }}>{STEPS[step].title}</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0 }}>{STEPS[step].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px 0" }} className="no-scrollbar">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Profile Setup ── */}
          {step === 0 && (
            <motion.div key="profile" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Avatar picker */}
              <div style={{ textAlign:"center" }}>
                <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
                  <div onClick={() => fileRef.current?.click()}
                    style={{ width:96, height:96, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize: avatarPreview ? 0 : 44, overflow:"hidden", boxShadow:"0 0 24px rgba(139,92,246,0.4)", border:"3px solid rgba(139,92,246,0.5)" }}>
                    {avatarPreview
                      ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="avatar" />
                      : selectedEmoji}
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    style={{ position:"absolute", bottom:2, right:2, width:28, height:28, borderRadius:"50%", background:"#8B5CF6", border:"2px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <Camera size={13} color="white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display:"none" }} />
                </div>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>Tap to upload photo</p>
              </div>

              {/* Emoji avatars */}
              {!avatarPreview && (
                <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px" }}>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, margin:"0 0 12px" }}>OR PICK AN AVATAR</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
                    {AVATAR_EMOJIS.map(em => (
                      <button key={em} onClick={() => setSelectedEmoji(em)}
                        style={{ width:"100%", aspectRatio:"1", borderRadius:14, border:"none", cursor:"pointer", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
                          background: selectedEmoji===em ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)",
                          boxShadow: selectedEmoji===em ? "0 0 0 1.5px #8B5CF6" : "none",
                        }}>{em}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Username */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, margin:"0 0 10px" }}>USERNAME *</p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16, color:"rgba(255,255,255,0.3)", fontFamily:"Inter,sans-serif" }}>@</span>
                  <input value={username} onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")); setUsernameError(""); }}
                    placeholder="your_username" maxLength={20}
                    style={{ flex:1, background:"transparent", border:"none", color:"white", fontSize:16, fontWeight:600, outline:"none", fontFamily:"Inter,sans-serif" }}
                  />
                </div>
                {usernameError && <p style={{ fontSize:11, color:"#F87171", margin:"8px 0 0" }}>{usernameError}</p>}
                {!usernameError && username.length >= 3 && (
                  <p style={{ fontSize:11, color:"#34D399", margin:"8px 0 0" }}>✓ Looks good!</p>
                )}
              </div>

              {/* Bio */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, margin:"0 0 10px" }}>BIO <span style={{ color:"rgba(255,255,255,0.2)", fontWeight:400 }}>(optional)</span></p>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={120}
                  placeholder="Share a little about yourself..."
                  rows={2}
                  style={{ width:"100%", background:"transparent", border:"none", color:"rgba(255,255,255,0.8)", fontSize:13, fontFamily:"Lora,serif", outline:"none", resize:"none", lineHeight:1.6, boxSizing:"border-box" }}
                />
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", margin:"4px 0 0", textAlign:"right" }}>{bio.length}/120</p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Interests ── */}
          {step === 1 && (
            <motion.div key="interests" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {INTERESTS.map((item, i) => {
                const selected = interests.includes(item.l);
                return (
                  <motion.button key={i} onClick={() => toggleInterest(item.l)}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                    whileTap={{ scale:0.95 }}
                    style={{ padding:"14px 12px", borderRadius:18, border:"none", cursor:"pointer", textAlign:"left", transition:"all 0.2s", position:"relative",
                      background: selected ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                      boxShadow: selected ? "0 0 0 1.5px #8B5CF6" : "0 0 0 1px rgba(255,255,255,0.07)",
                    }}>
                    <div style={{ fontSize:26, marginBottom:8 }}>{item.e}</div>
                    <div style={{ fontSize:14, fontWeight:700, color: selected ? "#E9D5FF" : "white", marginBottom:2, fontFamily:"Inter,sans-serif" }}>{item.l}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{item.d}</div>
                    {selected && (
                      <div style={{ position:"absolute", top:10, right:10, width:18, height:18, borderRadius:"50%", background:"#8B5CF6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={11} color="white" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* ── STEP 2: Mood ── */}
          {step === 2 && (
            <motion.div key="mood" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {MOODS.map((m, i) => {
                const selected = mood === m.l;
                const rgb = m.c === "#FBBF24" ? "251,191,36" : m.c === "#60A5FA" ? "96,165,250" : m.c === "#34D399" ? "52,211,153" : m.c === "#FB923C" ? "251,146,60" : m.c === "#94A3B8" ? "148,163,184" : m.c === "#F87171" ? "248,113,113" : m.c === "#EC4899" ? "236,72,153" : "167,139,250";
                return (
                  <motion.button key={i} onClick={() => setMood(m.l)}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                    whileTap={{ scale:0.95 }}
                    style={{ padding:"18px 14px", borderRadius:18, border:"none", cursor:"pointer", textAlign:"center", transition:"all 0.2s",
                      background: selected ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.04)",
                      boxShadow: selected ? `0 0 0 1.5px ${m.c}` : "0 0 0 1px rgba(255,255,255,0.07)",
                    }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>{m.e}</div>
                    <div style={{ fontSize:14, fontWeight:700, color: selected ? m.c : "rgba(255,255,255,0.8)", fontFamily:"Inter,sans-serif" }}>{m.l}</div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 3 && (
            <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ textAlign:"center", paddingTop:20 }}>
              <motion.div animate={{ scale:[1,1.1,1], rotate:[0,5,-5,0] }} transition={{ duration:0.6, delay:0.2 }}
                style={{ fontSize:80, marginBottom:24 }}>🎉</motion.div>

              {/* Profile preview */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:8, border:"2px solid rgba(139,92,246,0.5)" }}>
                  {avatarPreview ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} alt="" /> : selectedEmoji}
                </div>
                <p style={{ fontSize:16, fontWeight:700, color:"white", margin:"0 0 2px" }}>@{username}</p>
                {bio && <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:0 }}>{bio}</p>}
              </div>

              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"20px", marginBottom:16, textAlign:"left" }}>
                <p style={{ fontSize:12, color:"#A78BFA", fontWeight:700, letterSpacing:0.5, margin:"0 0 12px" }}>YOUR FEED INCLUDES</p>
                {interests.slice(0,4).map((int, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0" }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Check size={12} color="#A78BFA" />
                    </div>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>{int} stories</span>
                  </div>
                ))}
                {interests.length > 4 && <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"6px 0 0 32px" }}>+ {interests.length - 4} more categories</p>}
              </div>

              <div style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:20, padding:"16px" }}>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", margin:0, fontFamily:"Lora,serif", fontStyle:"italic", lineHeight:1.6 }}>
                  &ldquo;Every story you read is a seed planted in the garden of who you&apos;re becoming.&rdquo;
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding:"20px 16px 40px", flexShrink:0 }}>
        {step === 1 && interests.length > 0 && (
          <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.35)", margin:"0 0 12px" }}>
            {interests.length} selected · {interests.length < 2 ? "Pick at least 2" : "Good to go!"}
          </p>
        )}
        <motion.button onClick={handleNext} disabled={!canNext || isSaving} whileTap={{ scale:0.97 }}
          style={{ width:"100%", padding:"16px", borderRadius:16, border:"none", cursor: canNext && !isSaving ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.3s",
            background: canNext && !isSaving ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)",
            boxShadow: canNext && !isSaving ? "0 0 24px rgba(139,92,246,0.35)" : "none",
          }}>
          {isSaving
            ? <div style={{ width:20, height:20, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            : <>
                <span style={{ fontSize:15, fontWeight:700, color: canNext ? "white" : "rgba(255,255,255,0.3)", fontFamily:"Inter,sans-serif" }}>
                  {step === 3 ? "Explore Stories 🚀" : "Continue"}
                </span>
                {step < 3 && <ArrowRight size={18} color={canNext ? "white" : "rgba(255,255,255,0.3)"} />}
              </>
          }
        </motion.button>
      </div>
    </div>
  );
}
