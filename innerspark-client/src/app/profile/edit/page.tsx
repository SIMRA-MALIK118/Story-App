"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Check, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const existing = (user as any)?.profile || user || {};
  const [name, setName]         = useState(existing.name || "");
  const [username, setUsername] = useState(existing.username || "");
  const [bio, setBio]           = useState(existing.bio || "");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(existing.avatar_url || null);
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(existing.banner_url || null);
  const [bannerFile, setBannerFile]       = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required");
    if (username && !/^[a-z0-9_]{3,20}$/.test(username)) return setError("Username: 3-20 chars, letters/numbers/underscore only");
    setError("");
    setIsLoading(true);

    try {
      if (avatarFile) {
        const form = new FormData();
        form.append("avatar", avatarFile);
        await api.post("/users/me/avatar", form, { headers: { "Content-Type": "multipart/form-data" } });
      }

      if (bannerFile) {
        const form = new FormData();
        form.append("banner", bannerFile);
        await api.post("/users/me/banner", form, { headers: { "Content-Type": "multipart/form-data" } });
      }

      const { data } = await api.put("/users/me/profile", { name, username, bio });
      updateUser({ ...data.data.profile });
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/profile" style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.7)" />
          </Link>
          <h1 style={{ fontSize:18, fontWeight:800, color:"white", margin:0 }}>Edit Profile</h1>
        </div>
        <button onClick={handleSave} disabled={isLoading || success}
          style={{ padding:"8px 18px", borderRadius:12, background: success ? "rgba(52,211,153,0.15)" : "linear-gradient(to right,#8B5CF6,#EC4899)", border: success ? "1px solid rgba(52,211,153,0.3)" : "none", cursor:"pointer", color: success ? "#34D399" : "white", fontSize:13, fontWeight:700, fontFamily:"Inter,sans-serif", display:"flex", alignItems:"center", gap:6 }}>
          {isLoading
            ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid white", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            : success ? <><Check size={14} /> Saved!</>
            : "Save"}
        </button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 0 40px" }} className="no-scrollbar">

        {/* Banner section */}
        <div style={{ position:"relative", height:130, cursor:"pointer" }} onClick={() => bannerRef.current?.click()}>
          {bannerPreview ? (
            <img src={bannerPreview} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} alt="banner" />
          ) : (
            <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#3b0764,#6d28d9,#be185d)" }} />
          )}
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:12, padding:"8px 14px" }}>
              <ImageIcon size={16} color="white" />
              <span style={{ fontSize:13, fontWeight:600, color:"white", fontFamily:"Inter,sans-serif" }}>
                {bannerPreview ? "Change banner" : "Add banner photo"}
              </span>
            </div>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerChange} style={{ display:"none" }} />
        </div>

        {/* Avatar section */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginTop:-36, marginBottom:24, position:"relative" }}>
          <div style={{ position:"relative" }}>
            <div onClick={() => avatarRef.current?.click()}
              style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", boxShadow:"0 0 24px rgba(139,92,246,0.4)", border:"3px solid #0D0D14" }}>
              {avatarPreview
                ? <img src={avatarPreview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="avatar" />
                : <span style={{ fontSize:32 }}>👤</span>}
            </div>
            <button onClick={() => avatarRef.current?.click()}
              style={{ position:"absolute", bottom:2, right:2, width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"2px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Camera size={13} color="white" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:"none" }} />
          </div>
          <p style={{ fontSize:12, color:"#A78BFA", fontWeight:600, margin:"10px 0 0", cursor:"pointer" }} onClick={() => avatarRef.current?.click()}>
            Change photo
          </p>
        </div>

        <div style={{ padding:"0 16px" }}>
          {/* Error */}
          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
              <p style={{ fontSize:13, color:"#F87171", margin:0 }}>{error}</p>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Name */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, display:"block", marginBottom:8 }}>DISPLAY NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                style={{ width:"100%", background:"transparent", border:"none", color:"white", fontSize:16, fontWeight:600, outline:"none", fontFamily:"Inter,sans-serif", boxSizing:"border-box" }}
              />
            </div>

            {/* Username */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, display:"block", marginBottom:8 }}>USERNAME</label>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16, color:"rgba(255,255,255,0.3)" }}>@</span>
                <input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} placeholder="your_username" maxLength={20}
                  style={{ flex:1, background:"transparent", border:"none", color:"white", fontSize:16, fontWeight:600, outline:"none", fontFamily:"Inter,sans-serif" }}
                />
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", margin:"8px 0 0" }}>innerspark.app/@{username || "you"}</p>
            </div>

            {/* Bio */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"14px 16px" }}>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:0.5, display:"block", marginBottom:8 }}>BIO</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={150}
                placeholder="Tell your story in a few words..."
                rows={3}
                style={{ width:"100%", background:"transparent", border:"none", color:"rgba(255,255,255,0.8)", fontSize:14, fontFamily:"Lora,serif", outline:"none", resize:"none", lineHeight:1.7, boxSizing:"border-box" }}
              />
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", margin:"4px 0 0", textAlign:"right" }}>{bio.length}/150</p>
            </div>

            <div style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:16, padding:"12px 16px" }}>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.6 }}>
                Your profile is visible to all InnerSpark users. You can change your username once every 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
