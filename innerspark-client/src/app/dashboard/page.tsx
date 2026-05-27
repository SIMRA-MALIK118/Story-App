"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, TrendingUp, Star, Bell } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/shared/BottomNav";
import api from "@/services/api";

const MOODS = [
  { e:"😊", l:"Happy",  k:"happy" },
  { e:"😔", l:"Sad",    k:"sad" },
  { e:"🌱", l:"Growth", k:"growth" },
  { e:"💪", l:"Driven", k:"driven" },
  { e:"❤️", l:"Love",   k:"love" },
  { e:"🔥", l:"Fire",   k:"fire" },
];

const DAYS = ["M","T","W","T","F","S","S"];

interface Stats {
  streak: number;
  longest_streak: number;
  xp: number;
  level: number;
  reads: number;
  stories: number;
}

interface ActivityDay {
  date: string;
  reads: number;
}

interface Achievement {
  icon: string;
  name: string;
  xp: number;
  done: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ streak:0, longest_streak:0, xp:0, level:1, reads:0, stories:0 });
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodSaved, setMoodSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes, moodRes, notifRes] = await Promise.allSettled([
          api.get("/dashboard/stats"),
          api.get("/dashboard/activity"),
          api.get("/dashboard/mood/history?days=1"),
          api.get("/messages/unread"),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (activityRes.status === "fulfilled") setActivity(activityRes.value.data.data.activity || []);
        if (moodRes.status === "fulfilled") {
          const todayMood = moodRes.value.data.data.moods?.[0];
          if (todayMood) { setSelectedMood(todayMood.mood); setMoodSaved(true); }
        }
        if (notifRes.status === "fulfilled") setNotifCount(notifRes.value.data.data.unread || 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const logMood = async (mood: string) => {
    setSelectedMood(mood);
    try {
      await api.post("/dashboard/mood", { mood });
      setMoodSaved(true);
    } catch {}
  };

  const getLevel = (xp: number) => {
    if (xp < 100) return "Beginner";
    if (xp < 300) return "Explorer";
    if (xp < 600) return "Storyteller";
    if (xp < 1000) return "Narrator";
    return "Legend";
  };

  const maxActivity = Math.max(...activity.map(a => a.reads), 1);

  const achievements: Achievement[] = [
    { icon:"📖", name:"First Read",    xp:10,  done: stats.reads >= 1 },
    { icon:"🔥", name:"3-Day Streak",  xp:30,  done: stats.streak >= 3 },
    { icon:"⚡", name:"Week Warrior",  xp:100, done: stats.streak >= 7 },
    { icon:"💜", name:"Story Lover",   xp:50,  done: stats.reads >= 10 },
    { icon:"✍️", name:"First Story",   xp:50,  done: stats.stories >= 1 },
    { icon:"🌟", name:"Storyteller",   xp:200, done: stats.stories >= 5 },
  ];

  const unlockedCount = achievements.filter(a => a.done).length;

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", position:"relative" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"52px 16px 100px" }} className="no-scrollbar">

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>
              {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"} ✨
            </p>
            <h1 style={{ fontSize:22, fontWeight:800, color:"white", margin:0, letterSpacing:-0.5 }}>Your Growth</h1>
          </div>
          <Link href="/chat">
            <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <Bell size={17} color="rgba(255,255,255,0.6)" />
              {notifCount > 0 && (
                <div style={{ position:"absolute", top:-4, right:-4, minWidth:16, height:16, borderRadius:8, background:"#EC4899", border:"2px solid #0D0D14", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"white" }}>{notifCount > 9 ? "9+" : notifCount}</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Stats cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { label:"Current Streak", value: loading ? "..." : `🔥 ${stats.streak}`, sub:`${stats.streak === 1 ? "day" : "days"} in a row`, color:"#FB923C", glow:"rgba(251,146,60,0.2)" },
            { label:"XP Points",      value: loading ? "..." : stats.xp.toLocaleString(), sub:`Level ${stats.level} · ${getLevel(stats.xp)}`, color:"#A78BFA", glow:"rgba(139,92,246,0.2)" },
            { label:"Total Reads",    value: loading ? "..." : String(stats.reads),   sub:"stories read",     color:"#34D399", glow:"rgba(52,211,153,0.2)" },
            { label:"Stories Posted", value: loading ? "..." : String(stats.stories), sub:"published stories", color:"#F472B6", glow:"rgba(244,114,182,0.2)" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:"14px 16px", boxShadow:`0 0 20px ${s.glow}` }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 6px", fontWeight:600, letterSpacing:0.5 }}>{s.label.toUpperCase()}</p>
              <p style={{ fontSize:22, fontWeight:800, color:s.color, margin:"0 0 4px" }}>{s.value}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly activity */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"18px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"white", margin:0 }}>Weekly Activity</h3>
            <span style={{ fontSize:11, color:"#A78BFA", fontWeight:600 }}>This week</span>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:60 }}>
            {(activity.length > 0 ? activity : DAYS.map((d,i) => ({ date:d, reads:0 }))).map((w, i) => {
              const pct = activity.length > 0 ? Math.max(8, (w.reads / maxActivity) * 100) : 8;
              const isToday = i === (activity.length > 0 ? activity.length - 1 : 6);
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <motion.div initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ delay:0.3+i*0.06, duration:0.4 }}
                    style={{ width:"100%", height:`${pct}%`, borderRadius:6, transformOrigin:"bottom",
                      background: isToday ? "linear-gradient(to top,#8B5CF6,#EC4899)" : w.reads > 0 ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)" }}
                  />
                  <span style={{ fontSize:9, color:isToday ? "#A78BFA" : "rgba(255,255,255,0.3)", fontWeight:isToday ? 700 : 400 }}>
                    {DAYS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log today's mood */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"18px 16px", marginBottom:16 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"white", margin:"0 0 4px" }}>
            {moodSaved ? "Today's mood logged ✓" : "How are you feeling today?"}
          </h3>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"0 0 14px" }}>
            {moodSaved ? "Come back tomorrow to log again" : "Log your mood to personalize your feed"}
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => !moodSaved && logMood(m.k)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 12px", borderRadius:14,
                  background: selectedMood === m.k ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                  border: selectedMood === m.k ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  cursor: moodSaved ? "default" : "pointer", minWidth:52, transition:"all 0.2s" }}>
                <span style={{ fontSize:20 }}>{m.e}</span>
                <span style={{ fontSize:10, color: selectedMood === m.k ? "#A78BFA" : "rgba(255,255,255,0.45)", fontWeight:600, fontFamily:"Inter,sans-serif" }}>{m.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"18px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"white", margin:0 }}>Achievements</h3>
            <span style={{ fontSize:11, color:"#A78BFA", fontWeight:600 }}>{unlockedCount}/{achievements.length} unlocked</span>
          </div>
          {achievements.map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom: i<achievements.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ width:40, height:40, borderRadius:12, background: a.done ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)", border: a.done ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, opacity: a.done ? 1 : 0.35 }}>
                {a.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color: a.done ? "white" : "rgba(255,255,255,0.3)" }}>{a.name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>+{a.xp} XP</div>
              </div>
              {a.done && <Star size={14} color="#A78BFA" fill="#A78BFA" />}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
