"use client";
import { useState } from "react";
import { ChevronLeft, Moon, Bell, Shield, HelpCircle, LogOut, ChevronRight, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/shared/BottomNav";
import { useAuthStore } from "@/store/authStore";

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} style={{ width:44, height:26, borderRadius:13, background: on ? "linear-gradient(to right,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.12)", border:"none", cursor:"pointer", position:"relative", transition:"all 0.3s", flexShrink:0 }}>
    <div style={{ width:20, height:20, borderRadius:"50%", background:"white", position:"absolute", top:3, left: on ? 21 : 3, transition:"left 0.3s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
  </button>
);

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [toggles, setToggles] = useState({ darkMode:true, notifications:true, dailyReminder:true, anonymous:false, aiStories:true });
  const toggle = (key: keyof typeof toggles) => setToggles(t => ({ ...t, [key]: !t[key] }));

  const displayName = (user as any)?.name || (user as any)?.email?.split("@")[0] || "User";
  const username = (user as any)?.username || (user as any)?.email?.split("@")[0] || "user";
  const avatarUrl = (user as any)?.avatar_url || null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const SECTIONS = [
    {
      title:"Account",
      items:[
        { icon:User, label:"Edit Profile", sub:"Update your name & bio", hasToggle:false, href:"/profile" },
        { icon:Sparkles, label:"Upgrade to Pro", sub:"Unlimited AI · Custom badge", hasToggle:false, href:"#", accent:true },
      ]
    },
    {
      title:"Preferences",
      items:[
        { icon:Moon,   label:"Dark Mode",        sub:"Always on for best experience", hasToggle:true, key:"darkMode" },
        { icon:Bell,   label:"Notifications",    sub:"Likes, comments, follows",       hasToggle:true, key:"notifications" },
        { icon:Bell,   label:"Daily Reminder",   sub:"Read 1 story every day",         hasToggle:true, key:"dailyReminder" },
        { icon:Shield, label:"Anonymous Mode",   sub:"Hide your name on new stories",  hasToggle:true, key:"anonymous" },
        { icon:Sparkles,label:"AI Story Feed",   sub:"Show AI-generated stories",      hasToggle:true, key:"aiStories" },
      ]
    },
    {
      title:"Support",
      items:[
        { icon:HelpCircle, label:"Help & FAQ",     sub:"Get answers fast", hasToggle:false },
        { icon:Shield,     label:"Privacy Policy", sub:"How we use your data", hasToggle:false },
      ]
    }
  ];

  return (
    <div style={{ width:"100%", height:"100%", background:"#0D0D14", display:"flex", flexDirection:"column", position:"relative" }}>

      {/* Header */}
      <div style={{ padding:"52px 20px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <Link href="/profile" style={{ width:36, height:36, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.7)" />
          </Link>
          <h1 style={{ fontSize:20, fontWeight:800, color:"white", margin:0 }}>Settings</h1>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px" }} className="no-scrollbar">

        {/* Profile card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"16px", display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"2px solid rgba(139,92,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, overflow:"hidden" }}>
            {avatarUrl
              ? <img src={avatarUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={displayName} />
              : "👤"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"white" }}>{displayName}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>@{username} · Free plan</div>
          </div>
          <div style={{ fontSize:11, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:50, padding:"4px 10px", color:"#A78BFA", fontWeight:600 }}>Free</div>
        </div>

        {SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom:20 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:1, margin:"0 4px 10px" }}>{section.title.toUpperCase()}</p>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>
              {section.items.map((item, ii) => {
                const Icon = item.icon;
                const isLast = ii === section.items.length - 1;
                return (
                  <div key={ii} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
                    <div style={{ width:36, height:36, borderRadius:11, background: (item as any).accent ? "linear-gradient(135deg,#8B5CF6,#EC4899)" : "rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon size={17} color={(item as any).accent ? "white" : "rgba(255,255,255,0.6)"} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:(item as any).accent ? "#A78BFA" : "white" }}>{item.label}</div>
                      {"sub" in item && <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{item.sub}</div>}
                    </div>
                    {item.hasToggle && "key" in item
                      ? <Toggle on={toggles[item.key as keyof typeof toggles]} onToggle={() => toggle(item.key as keyof typeof toggles)} />
                      : <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                    }
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button onClick={handleLogout} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:16, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", cursor:"pointer", color:"#EF4444", fontSize:14, fontWeight:600, fontFamily:"Inter,sans-serif", marginBottom:8 }}>
          <LogOut size={17} /> Log out
        </button>

        <p style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.2)" }}>InnerSpark v1.0.0 · Made with 💜</p>
      </div>
      <BottomNav />
    </div>
  );
}
