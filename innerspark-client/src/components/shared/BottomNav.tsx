"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, MessageSquare, User } from "lucide-react";

const NAV = [
  { icon: Home,          label: "Home",    href: "/feed" },
  { icon: Compass,       label: "Explore", href: "/explore" },
  { icon: PlusCircle,    label: "Create",  href: "/create", isCreate: true },
  { icon: MessageSquare, label: "Chat",    href: "/chat" },
  { icon: User,          label: "Profile", href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(13,13,20,0.92)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "10px 8px 20px",
    }}>
      {NAV.map(({ icon: Icon, label, href, isCreate }) => {
        const active = pathname === href;
        if (isCreate) return (
          <Link key={href} href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 46, height: 46, borderRadius: 15,
              background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 18px rgba(139,92,246,0.45)",
              transform: "translateY(-8px)",
            }}>
              <Icon size={22} color="white" strokeWidth={2.2} />
            </div>
          </Link>
        );
        return (
          <Link key={href} href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
            <Icon size={22} color={active ? "#A78BFA" : "rgba(255,255,255,0.35)"} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "#A78BFA" : "rgba(255,255,255,0.3)", fontFamily: "Inter,sans-serif" }}>
              {label}
            </span>
            {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#8B5CF6", position: "absolute", bottom: 14 }} />}
          </Link>
        );
      })}
    </div>
  );
}
