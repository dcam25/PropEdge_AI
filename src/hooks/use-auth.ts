"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  return useAuthStore();
}

export { FREE_MODEL_LIMIT, PREMIUM_MODEL_LIMIT } from "@/stores/auth-store";
