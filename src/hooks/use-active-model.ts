"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserModel, ModelFactor } from "@/types";

export function useActiveModel(userId: string | undefined) {
  const [activeModel, setActiveModel] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setActiveModel(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const { data } = await supabase
          .from("user_models")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .maybeSingle();
        if (data) {
          setActiveModel({
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description ?? "",
            factors: (data.factors ?? []) as ModelFactor[],
            performanceScore: data.performance_score ?? undefined,
            isActive: data.is_active ?? false,
            createdAt: data.created_at ?? "",
          });
        } else {
          setActiveModel(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return { activeModel, loading };
}
