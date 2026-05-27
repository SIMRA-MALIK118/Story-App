"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const handle = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) { router.replace("/login"); return; }

        setAccessToken(session.access_token);

        // Sync profile with backend
        const { data } = await api.post("/auth/google-callback", {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        setUser(data.data.profile || data.data.user);
        router.replace("/feed");
      } catch {
        router.replace("/login");
      }
    };
    handle();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0D0D14", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8B5CF6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "Inter,sans-serif" }}>Signing you in...</p>
    </div>
  );
}
