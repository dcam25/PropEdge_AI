"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { Prop } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PropTableProps {
  props: Prop[];
  onAddToSlip: (prop: Prop) => void;
  onViewDetail: (prop: Prop) => void;
}

export function PropTable({ props, onAddToSlip, onViewDetail }: PropTableProps) {
  if (props.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center text-zinc-500">
        No props match your filters. Try adjusting filters or select a different sport.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-b border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Player</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Team</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Opp</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Prop</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Line</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Hit Rate</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Streak</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Edge %</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, i) => (
            <motion.tr
              key={prop.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30"
            >
              <td className="px-4 py-3 font-medium">{prop.player}</td>
              <td className="px-4 py-3 text-zinc-400">{prop.team}</td>
              <td className="px-4 py-3 text-zinc-400">@ {prop.opponent}</td>
              <td className="px-4 py-3">{prop.propType}</td>
              <td className="px-4 py-3 font-mono">{prop.line}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  prop.hitRate >= 0.6 ? "text-emerald-400" : prop.hitRate >= 0.5 ? "text-amber-400" : "text-red-400"
                )}>
                  {(prop.hitRate * 100).toFixed(0)}%
                </span>
              </td>
              <td className="px-4 py-3">{prop.streak}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  {prop.modelEdge >= 65 && <Zap className="h-4 w-4 text-amber-400" />}
                  <span className={cn(
                    prop.modelEdge >= 65 ? "text-emerald-400 font-semibold" : "text-zinc-300"
                  )}>
                    {prop.modelEdge}%
                  </span>
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onViewDetail(prop)}>
                    Detail
                  </Button>
                  <Button size="sm" onClick={() => onAddToSlip(prop)}>
                    Add
                  </Button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
