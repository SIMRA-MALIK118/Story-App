"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg,#0D0D14 0%,#1a0a2e 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "56px 24px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: "0 0 6px", letterSpacing: -0.5 }}>Reset Password</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>We'll send you a link to reset it.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{ margin: "0 16px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "28px 20px" }}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle size={48} color="#34D399" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 10px" }}>Email sent!</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 24px", lineHeight: 1.6 }}>
              Check your inbox at <strong style={{ color: "white" }}>{email}</strong> and click the reset link.
            </p>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 24px", borderRadius: 14, background: "linear-gradient(to right,#8B5CF6,#EC4899)", color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 0.5, display: "block", marginBottom: 8 }}>EMAIL ADDRESS</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "13px 14px 13px 40px", color: "white", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                style={{ width: "100%", padding: "15px", borderRadius: 14, background: isLoading ? "rgba(139,92,246,0.5)" : "linear-gradient(to right,#8B5CF6,#EC4899)", border: "none", cursor: isLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 0 24px rgba(139,92,246,0.35)" }}>
                {isLoading
                  ? <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : <><span style={{ fontSize: 15, fontWeight: 700, color: "white", fontFamily: "Inter,sans-serif" }}>Send Reset Link</span><ArrowRight size={18} color="white" /></>
                }
              </button>
            </form>
          </>
        )}
      </motion.div>

      <div style={{ padding: "20px 24px 36px", textAlign: "center" }}>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "Inter,sans-serif" }}>
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
