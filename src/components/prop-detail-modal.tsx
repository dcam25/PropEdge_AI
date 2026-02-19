"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Prop } from "@/types";
import { useAuth } from "@/hooks/use-auth";

interface PropDetailModalProps {
  prop: Prop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetAIInsight: (prop: Prop) => Promise<string>;
}

export function PropDetailModal({
  prop,
  open,
  onOpenChange,
  onGetAIInsight,
}: PropDetailModalProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [askMore, setAskMore] = useState("");
  const { canUseAIInsight, incrementAIInsight, user, profile, isUpdatingProfile } = useAuth();

  const handleGetInsight = async () => {
    if (!prop || !user) return;
    if (!canUseAIInsight()) {
      alert("You've reached your daily limit of 5 AI insights. Upgrade to Premium for unlimited.");
      return;
    }
    setLoading(true);
    try {
      const insight = await onGetAIInsight(prop);
      setAiInsight(insight);
      await incrementAIInsight();
    } catch (e) {
      setAiInsight("Failed to generate insight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!prop) return null;

  const last10 = prop.lastGames;
  const remaining = user ? (profile?.is_premium ? "∞" : `${Math.max(0, 5 - (profile?.ai_insights_used_today ?? 0))} left today`) : "Sign in to use";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prop.player} — {prop.propType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-zinc-500">Team</span> {prop.team}</div>
            <div><span className="text-zinc-500">Opponent</span> @ {prop.opponent}</div>
            <div><span className="text-zinc-500">Line</span> {prop.line}</div>
            <div><span className="text-zinc-500">Hit Rate (L10)</span> {(prop.hitRate * 100).toFixed(0)}%</div>
            <div><span className="text-zinc-500">Streak</span> {prop.streak}</div>
            <div><span className="text-zinc-500">Model Edge</span> {prop.modelEdge}%</div>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-zinc-300">Last 10 games</h4>
            <div className="flex flex-wrap gap-2">
              {last10.map((v, i) => (
                <span
                  key={i}
                  className="rounded bg-zinc-800 px-2 py-1 font-mono text-sm"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {prop.supportingStats && (
            <div>
              <h4 className="mb-2 font-medium text-zinc-300">Supporting stats</h4>
              <div className="flex gap-4 text-sm">
                <span>Avg: {prop.supportingStats.avg}</span>
                <span>Trend: {prop.supportingStats.trend > 0 ? "+" : ""}{prop.supportingStats.trend}</span>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 font-medium text-zinc-300">AI Insight</h4>
            {!aiInsight ? (
              <Button
                onClick={handleGetInsight}
                disabled={loading || !user || isUpdatingProfile}
              >
                {loading ? "Generating..." : isUpdatingProfile ? "Saving..." : user ? `Ask AI (${remaining})` : "Sign in to use AI"}
              </Button>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg bg-zinc-800/50 p-4 text-sm text-zinc-300"
              >
                {aiInsight}
              </motion.p>
            )}
            {aiInsight && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask AI more..."
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                  value={askMore}
                  onChange={(e) => setAskMore(e.target.value)}
                />
                <Button size="sm" variant="outline" disabled>
                  Coming in Phase 2
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
