"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { getTimeSeries } from "@/data/mock-timeseries";
import type { Prop } from "@/types";

interface DashboardChartProps {
  props: Prop[];
}

const PERIODS = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
] as const;

export function DashboardChart({ props }: DashboardChartProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const seriesData = useMemo(() => getTimeSeries(period), [period]);

  // Current props summary for header
  const summary = useMemo(() => {
    if (props.length === 0) return null;
    const avgEdge = props.reduce((s, p) => s + p.modelEdge, 0) / props.length;
    const avgHit = props.reduce((s, p) => s + p.hitRate, 0) / props.length;
    return {
      avgEdge: Math.round(avgEdge * 10) / 10,
      avgHit: Math.round(avgHit * 100),
      count: props.length,
    };
  }, [props]);

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${Number(m)}/${Number(day)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80"
    >
      {/* Header: IBKR-style toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-baseline gap-4">
          <h3 className="font-semibold text-zinc-100">Model Edge Performance</h3>
          {summary && (
            <div className="flex gap-4 text-sm">
              <span className="text-zinc-500">
                Today: <span className="text-emerald-400 font-medium">{summary.avgEdge}%</span> avg edge
              </span>
              <span className="text-zinc-500">
                <span className="text-zinc-400 font-medium">{summary.count}</span> props
              </span>
            </div>
          )}
        </div>
        <div className="flex rounded-lg border border-zinc-700 bg-zinc-900/50 p-0.5">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === value
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={seriesData}
              margin={{ top: 12, right: 12, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="edgeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="hitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
              />
              <YAxis
                yAxisId="edge"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[50, 80]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="hit"
                orientation="right"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0.4, 0.9]}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
                labelStyle={{ color: "#fafafa", marginBottom: 4 }}
                labelFormatter={(label) => String(label ?? "")}
                formatter={(value, name) => {
                  const v = Number(value ?? 0);
                  if (name === "edge") return [`${v}%`, "Model Edge"];
                  if (name === "hitRate") return [`${Math.round(v * 100)}%`, "Hit Rate"];
                  return [v, String(name)];
                }}
              />
              <ReferenceLine
                yAxisId="edge"
                y={60}
                stroke="#3f3f46"
                strokeDasharray="2 2"
              />
              <Area
                yAxisId="edge"
                type="monotone"
                dataKey="edge"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#edgeGradient)"
              />
              <Line
                yAxisId="hit"
                type="monotone"
                dataKey="hitRate"
                stroke="#a78bfa"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-emerald-500/60" />
            Model Edge %
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-violet-400" />
            Hit Rate
          </span>
        </div>
      </div>
    </motion.div>
  );
}
