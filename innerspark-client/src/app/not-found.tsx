"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div style={{ fontSize:72, marginBottom:16 }}>✨</div>
        <h1 style={{ fontSize:28, fontWeight:800, color:"white", margin:"0 0 8px", letterSpacing:-0.5 }}>404</h1>
        <h2 style={{ fontSize:18, fontWeight:600, color:"rgba(255,255,255,0.6)", margin:"0 0 12px" }}>Page not found</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:"0 0 32px", lineHeight:1.6, maxWidth:280 }}>
          This page doesn't exist or was moved. Let's get you back on track.
        </p>
        <Link href="/feed" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:16, background:"linear-gradient(to right,#8B5CF6,#EC4899)", color:"white", fontSize:15, fontWeight:700, textDecoration:"none", boxShadow:"0 0 24px rgba(139,92,246,0.35)" }}>
          Go to Feed
        </Link>
      </motion.div>
    </div>
  );
}
