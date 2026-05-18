"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const SLIDES = [
  {
    gradient: "linear-gradient(160deg, #1a0533 0%, #4c1d95 40%, #be185d 100%)",
    accent: "#A78BFA",
    tag: "MOTIVATION",
    headline: "Stories that\nMove You\nForward.",
    sub: "Real stories from real people — curated to how you feel right now.",
    emoji: "✨",
    art: (
      <div className="relative w-full h-full">
        {/* Abstract glowing orbs */}
        <div style={{ position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)", filter:"blur(20px)" }} />
        <div style={{ position:"absolute", top:"28%", left:"50%", transform:"translateX(-50%)", width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)", filter:"blur(14px)" }} />
        {/* Spark icons floating */}
        {["✨","💜","🌟","💫","⚡"].map((s,i) => (
          <motion.span key={i}
            style={{ position:"absolute", fontSize:i%2===0?22:16, top:`${20+i*12}%`, left:`${15+i*14}%`, opacity:0.7 }}
            animate={{ y:[0,-12,0], opacity:[0.5,1,0.5] }}
            transition={{ duration:2.5+i*0.4, repeat:Infinity, delay:i*0.3 }}
          >{s}</motion.span>
        ))}
        {/* Quote card */}
        <motion.div
          initial={{ opacity:0, scale:0.9 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.6 }}
          style={{ position:"absolute", bottom:"36%", left:"50%", transform:"translateX(-50%)", width:"78%",
            background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)",
            border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"18px 20px" }}
        >
          <p style={{ fontFamily:"Lora,serif", fontSize:13, color:"rgba(255,255,255,0.85)", lineHeight:1.6, fontStyle:"italic" }}>
            "The seed you planted in the dark is about to bloom in the light..."
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🤖</div>
            <div>
              <div style={{ fontSize:11, color:"#A78BFA", fontWeight:600 }}>AI Generated</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Based on: "feeling lost"</div>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    gradient: "linear-gradient(160deg, #0c1a3a 0%, #1e3a5f 40%, #7c3aed 100%)",
    accent: "#60A5FA",
    tag: "TRACK GROWTH",
    headline: "Know Your\nMood.\nGrow Daily.",
    sub: "Log emotions, build streaks, and watch your journey unfold over time.",
    emoji: "📊",
    art: (
      <div className="relative w-full h-full">
        <div style={{ position:"absolute", top:"12%", left:"50%", transform:"translateX(-50%)", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)", filter:"blur(18px)" }} />
        {/* Streak card */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.4 }}
          style={{ position:"absolute", top:"22%", left:"50%", transform:"translateX(-50%)", width:"80%",
            background:"rgba(255,255,255,0.07)", backdropFilter:"blur(20px)",
            border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"20px" }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>CURRENT STREAK</div>
              <div style={{ fontSize:32, fontWeight:800, color:"white" }}>🔥 12</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>days in a row</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:2 }}>XP POINTS</div>
              <div style={{ fontSize:24, fontWeight:700, color:"#A78BFA" }}>1,480</div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div style={{ display:"flex", gap:5, alignItems:"flex-end", height:40 }}>
            {[60,85,40,100,70,90,55].map((h,i)=>(
              <motion.div key={i}
                initial={{ scaleY:0 }}
                animate={{ scaleY:1 }}
                transition={{ delay:0.6+i*0.08, duration:0.4 }}
                style={{ flex:1, height:`${h}%`, borderRadius:4, transformOrigin:"bottom",
                  background: i===5 ? "linear-gradient(to top,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.15)" }}
              />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{ flex:1, textAlign:"center", fontSize:9, color:"rgba(255,255,255,0.35)" }}>{d}</div>
            ))}
          </div>
        </motion.div>
        {/* Mood pills */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.8 }}
          style={{ position:"absolute", bottom:"34%", left:"50%", transform:"translateX(-50%)", display:"flex", gap:8 }}
        >
          {[{e:"😊",l:"Happy"},{e:"🌱",l:"Growth"},{e:"🔥",l:"Courage"}].map((m,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:50, padding:"6px 12px", fontSize:11, color:"rgba(255,255,255,0.8)", display:"flex", alignItems:"center", gap:5 }}>
              <span>{m.e}</span><span>{m.l}</span>
            </div>
          ))}
        </motion.div>
      </div>
    ),
  },
  {
    gradient: "linear-gradient(160deg, #1a0a2e 0%, #6d1b7b 40%, #c2185b 100%)",
    accent: "#F472B6",
    tag: "AI POWERED",
    headline: "Your Story,\nWritten by\nAI.",
    sub: "Type how you feel — InnerSpark AI writes a powerful story just for you in seconds.",
    emoji: "🤖",
    art: (
      <div className="relative w-full h-full">
        <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)", filter:"blur(18px)" }} />
        {/* Chat UI mockup */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.3 }}
          style={{ position:"absolute", top:"18%", left:"50%", transform:"translateX(-50%)", width:"82%", display:"flex", flexDirection:"column", gap:10 }}
        >
          {/* User bubble */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5 }}
            style={{ alignSelf:"flex-end", background:"rgba(139,92,246,0.3)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"18px 18px 4px 18px", padding:"10px 14px", maxWidth:"80%" }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.85)", margin:0 }}>"I feel completely burnt out and lost..."</p>
          </motion.div>
          {/* AI bubble */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.9 }}
            style={{ alignSelf:"flex-start", background:"rgba(255,255,255,0.07)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"18px 18px 18px 4px", padding:"12px 14px", maxWidth:"90%" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✨</div>
              <span style={{ fontSize:10, color:"#A78BFA", fontWeight:600 }}>InnerSpark AI</span>
            </div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.8)", margin:0, fontFamily:"Lora,serif", fontStyle:"italic", lineHeight:1.6 }}>
              "Even the wildest storms leave the sky cleaner than before. You are not broken — you are being rebuilt..."
            </p>
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              <span style={{ fontSize:10, background:"rgba(139,92,246,0.2)", color:"#A78BFA", padding:"3px 8px", borderRadius:50 }}>🌱 Growth</span>
              <span style={{ fontSize:10, background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)", padding:"3px 8px", borderRadius:50 }}>2 min read</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    ),
  },
];

export default function SplashPage() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1);
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden", background: slide.gradient, transition:"background 0.5s ease" }}>

      {/* Background gradient transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:0.5 }}
          style={{ position:"absolute", inset:0, background:slide.gradient }}
        />
      </AnimatePresence>

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:20, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 24px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:"white", letterSpacing:-0.3 }}>InnerSpark</span>
        </div>
        {!isLast && (
          <button onClick={() => setCurrent(SLIDES.length - 1)} style={{ fontSize:13, color:"rgba(255,255,255,0.6)", background:"none", border:"none", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
            Skip
          </button>
        )}
      </div>

      {/* Art area */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"62%", zIndex:5 }}>
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity:0, scale:1.04 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.45 }} style={{ width:"100%", height:"100%" }}>
            {slide.art}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tag pill */}
      <AnimatePresence mode="wait">
        <motion.div key={`tag-${current}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay:0.2 }}
          style={{ position:"absolute", bottom:"42%", left:24, zIndex:20 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:slide.accent, background:"rgba(255,255,255,0.08)", border:`1px solid ${slide.accent}33`, borderRadius:50, padding:"4px 12px" }}>
            {slide.tag}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Bottom content card */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:20, background:"rgba(13,13,20,0.6)", backdropFilter:"blur(30px)", borderTop:"1px solid rgba(255,255,255,0.08)", padding:"28px 24px 40px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={`text-${current}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.4 }}>
            <h1 style={{ fontSize:30, fontWeight:800, color:"white", lineHeight:1.2, margin:"0 0 12px", letterSpacing:-0.5, whiteSpace:"pre-line" }}>
              {slide.headline}
            </h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.6, margin:"0 0 24px" }}>
              {slide.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
          {SLIDES.map((_, i) => (
            <motion.button key={i} onClick={() => setCurrent(i)} animate={{ width: i === current ? 24 : 7, opacity: i === current ? 1 : 0.35 }}
              transition={{ duration:0.3 }}
              style={{ height:7, borderRadius:50, background: i===current ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.4)", border:"none", cursor:"pointer", padding:0 }}
            />
          ))}
        </div>

        {/* CTA Button */}
        {isLast ? (
          <Link href="/signup" style={{ display:"block", textDecoration:"none" }}>
            <motion.button whileTap={{ scale:0.96 }}
              style={{ width:"100%", padding:"17px", borderRadius:16, background:"linear-gradient(to right,#8B5CF6,#EC4899)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 0 30px rgba(139,92,246,0.4)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"white" }}>Get Started</span>
              <ArrowRight size={20} color="white" />
            </motion.button>
          </Link>
        ) : (
          <motion.button whileTap={{ scale:0.96 }} onClick={next}
            style={{ width:"100%", padding:"17px", borderRadius:16, background:"linear-gradient(to right,#8B5CF6,#EC4899)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 0 30px rgba(139,92,246,0.4)" }}>
            <span style={{ fontSize:16, fontWeight:700, color:"white", fontFamily:"Inter,sans-serif" }}>Next</span>
            <ArrowRight size={20} color="white" />
          </motion.button>
        )}

        {/* Already have account */}
        <p style={{ textAlign:"center", marginTop:16, fontSize:12, color:"rgba(255,255,255,0.35)", fontFamily:"Inter,sans-serif" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color:"#A78BFA", textDecoration:"none", fontWeight:600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
