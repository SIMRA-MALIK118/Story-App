"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase puts the token in the URL hash — it handles it automatically
    // Just need to wait for the session to be set
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => router.replace("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please request a new link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg,#0D0D14 0%,#1a0a2e 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ padding: "56px 24px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: "0 0 6px", letterSpacing: -0.5 }}>New Password</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Choose a strong password.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{ margin: "0 16px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "28px 20px" }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle size={48} color="#34D399" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 10px" }}>Password updated!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Redirecting to login...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "NEW PASSWORD", val: password, set: setPassword, show: showPw, toggle: () => setShowPw(!showPw) },
                { label: "CONFIRM PASSWORD", val: confirm, set: setConfirm, show: showPw, toggle: () => {} },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type={f.show ? "text" : "password"} value={f.val}
                      onChange={e => f.set(e.target.value)}
                      placeholder="••••••••" required minLength={8}
                      style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 42px 13px 40px", color: "white", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
                    />
                    {i === 0 && (
                      <button type="button" onClick={f.toggle}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="submit" disabled={isLoading}
                style={{ width: "100%", padding: "15px", borderRadius: 14, background: isLoading ? "rgba(139,92,246,0.5)" : "linear-gradient(to right,#8B5CF6,#EC4899)", border: "none", cursor: isLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 0 24px rgba(139,92,246,0.35)", marginTop: 4 }}>
                {isLoading
                  ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : <><span style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "Inter,sans-serif" }}>Update Password</span><ArrowRight size={18} color="white" /></>
                }
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
