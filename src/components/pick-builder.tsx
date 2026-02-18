"use client";

import { useState } from "react";
import { Trash2, Copy } from "lucide-react";
import type { Prop } from "@/types";
import { Button } from "@/components/ui/button";
import { SPORT_LABELS } from "@/data/mock-props";

interface PickBuilderProps {
  picks: Prop[];
  onRemove: (prop: Prop) => void;
}

export function PickBuilder({ picks, onRemove }: PickBuilderProps) {
  const avgEdge = picks.length > 0
    ? (picks.reduce((s, p) => s + p.modelEdge, 0) / picks.length).toFixed(1)
    : "—";

  const copyExport = () => {
    const lines = picks.map((p) =>
      `${p.player} (${p.team}) ${p.propType} ${p.line} — Edge: ${p.modelEdge}%`
    );
    const text = lines.join("\n");
    navigator.clipboard.writeText(text);
    // Could add toast here
    alert("Copied to clipboard! Paste into PrizePicks/Underdog.");
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 font-semibold text-zinc-100">Pick Slip</h3>
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
        <span>{picks.length} props</span>
        <span>Avg Edge: {avgEdge}%</span>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {picks.map((prop) => (
          <li
            key={prop.id}
            className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-2 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{prop.player}</div>
              <div className="text-xs text-zinc-500">
                {prop.propType} {prop.line} · {prop.modelEdge}%
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => onRemove(prop)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        className="mt-4 w-full"
        onClick={copyExport}
        disabled={picks.length === 0}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy for PrizePicks / Underdog
      </Button>
    </div>
  );
}
