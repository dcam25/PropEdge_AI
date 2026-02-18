"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  first_name?: string | null;
  last_name?: string | null;
  birthday?: string | null;
  is_premium: boolean;
  ai_insights_used_today: number;
  ai_insights_date: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isUpdatingProfile: boolean;
  canUseAIInsight: () => boolean;
  incrementAIInsight: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_AI_LIMIT = 5;
const FREE_MODEL_LIMIT = 1;
const PREMIUM_MODEL_LIMIT = 10;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, birthday, is_premium, ai_insights_used_today, ai_insights_date")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data ?? null);

      // Apply pending profile data from signup (magic link flow)
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("propedge_pending_profile");
        if (raw) {
          try {
            const pending = JSON.parse(raw) as { email: string; first_name?: string; last_name?: string; birthday?: string };
            const { data: session } = await supabase.auth.getSession();
            if (session.session?.user?.email === pending.email) {
              const updates: Record<string, string> = {};
              if (pending.first_name) updates.first_name = pending.first_name;
              if (pending.last_name) updates.last_name = pending.last_name;
              if (pending.birthday) updates.birthday = pending.birthday;
              if (Object.keys(updates).length > 0) {
                await supabase.from("profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", userId);
                setProfile((p) => (p ? { ...p, ...updates } : p));
              }
              localStorage.removeItem("propedge_pending_profile");
            }
          } catch {
            localStorage.removeItem("propedge_pending_profile");
          }
        }
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  function canUseAIInsight(): boolean {
    if (!user) return false;
    if (profile?.is_premium) return true;
    const today = new Date().toISOString().split("T")[0];
    if (profile?.ai_insights_date !== today) return true;
    return (profile?.ai_insights_used_today ?? 0) < FREE_AI_LIMIT;
  }

  async function incrementAIInsight() {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = profile?.ai_insights_date !== today;
      const newCount = isNewDay ? 1 : (profile?.ai_insights_used_today ?? 0) + 1;

      await supabase
        .from("profiles")
        .update({
          ai_insights_used_today: newCount,
          ai_insights_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      setProfile((p) => ({
        ...p!,
        ai_insights_used_today: newCount,
        ai_insights_date: today,
      }));
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isUpdatingProfile,
        canUseAIInsight,
        incrementAIInsight,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { FREE_MODEL_LIMIT, PREMIUM_MODEL_LIMIT, FREE_AI_LIMIT };
