"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAccessToken(data.data.session.access_token);
      setUser(data.data.profile || data.data.user);
      router.replace("/feed");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #0D0D14 0%, #1a0a2e 100%)", overflow: "hidden" }}>

      {/* Top glow */}
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "56px 24px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: "0 0 6px", letterSpacing: -0.5 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: 0 }}>Your stories are waiting for you.</p>
        </motion.div>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{ flex: 1, margin: "0 16px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "28px 20px", display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Google btn */}
        <button onClick={handleGoogle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "Inter,sans-serif" }}>
          <GoogleIcon /> Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>EMAIL</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" required
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 14px 13px 40px", color: "white", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 0.5 }}>PASSWORD</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "#A78BFA", textDecoration: "none" }}>Forgot?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 42px 13px 40px", color: "white", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            style={{ width: "100%", padding: "15px", borderRadius: 14, background: isLoading ? "rgba(139,92,246,0.5)" : "linear-gradient(to right,#8B5CF6,#EC4899)", border: "none", cursor: isLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 0 24px rgba(139,92,246,0.35)", marginTop: 4 }}>
            {isLoading
              ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <><span style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "Inter,sans-serif" }}>Log in</span><ArrowRight size={18} color="white" /></>
            }
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <div style={{ padding: "20px 24px 36px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, fontFamily: "Inter,sans-serif" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
