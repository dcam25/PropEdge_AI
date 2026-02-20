"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  first_name?: string | null;
  last_name?: string | null;
  birthday?: string | null;
  is_premium: boolean;
  subscription_amount_cents?: number | null;
  ai_insights_used_today: number;
  ai_insights_date: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isUpdatingProfile: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setIsUpdatingProfile: (v: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "first_name" | "last_name" | "birthday">>) => Promise<void>;
  incrementAIInsight: () => Promise<void>;
  canUseAIInsight: () => boolean;
}

export const FREE_AI_LIMIT = 5;
export const FREE_MODEL_LIMIT = 1;
export const PREMIUM_MODEL_LIMIT = 10;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isUpdatingProfile: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setIsUpdatingProfile: (isUpdatingProfile) => set({ isUpdatingProfile }),

  fetchProfile: async (userId: string) => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, birthday, is_premium, subscription_amount_cents, ai_insights_used_today, ai_insights_date")
        .eq("id", userId)
        .maybeSingle();
      set({ profile: data ?? null });

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
                set((s) => ({ profile: s.profile ? { ...s.profile, ...updates } : s.profile }));
              }
              localStorage.removeItem("propedge_pending_profile");
            }
          } catch {
            localStorage.removeItem("propedge_pending_profile");
          }
        }
      }
    } catch {
      set({ profile: null });
    } finally {
      set({ loading: false });
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (user) await get().fetchProfile(user.id);
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    set({ isUpdatingProfile: true });
    const supabase = createClient();
    try {
      const dbUpdates: Record<string, string | null> = { updated_at: new Date().toISOString() };
      if ("first_name" in updates) dbUpdates.first_name = updates.first_name ?? null;
      if ("last_name" in updates) dbUpdates.last_name = updates.last_name ?? null;
      if ("birthday" in updates) dbUpdates.birthday = updates.birthday ?? null;
      const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
      if (error) throw error;
      set((s) => ({ profile: s.profile ? { ...s.profile, ...updates } : s.profile }));
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  canUseAIInsight: () => {
    const { user, profile } = get();
    if (!user) return false;
    if (profile?.is_premium) return true;
    const today = new Date().toISOString().split("T")[0];
    if (profile?.ai_insights_date !== today) return true;
    return (profile?.ai_insights_used_today ?? 0) < FREE_AI_LIMIT;
  },

  incrementAIInsight: async () => {
    const { user, profile } = get();
    if (!user) return;
    set({ isUpdatingProfile: true });
    const supabase = createClient();
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
      set((s) => ({ profile: s.profile ? { ...s.profile, ai_insights_used_today: newCount, ai_insights_date: today } : s.profile }));
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
