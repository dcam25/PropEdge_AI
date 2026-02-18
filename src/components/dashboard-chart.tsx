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
import { getDailySeries, getAvailableMonths } from "@/data/mock-timeseries";
import { SelectDropdown } from "@/components/ui/dropdown";
import type { Prop } from "@/types";

interface DashboardChartProps {
  props: Prop[];
}

export function DashboardChart({ props }: DashboardChartProps) {
  const availableMonths = useMemo(() => getAvailableMonths(), []);
  const defaultStart = availableMonths[0] ?? "2024-03";
  const defaultEnd = availableMonths[availableMonths.length - 1] ?? "2025-02";

  const [startMonth, setStartMonth] = useState(defaultStart);
  const [endMonth, setEndMonth] = useState(defaultEnd);

  const seriesData = useMemo(() => {
    const start = startMonth <= endMonth ? startMonth : endMonth;
    const end = startMonth <= endMonth ? endMonth : startMonth;
    return getDailySeries(start, end);
  }, [startMonth, endMonth]);

  const summary = useMemo(() => {
    if (props.length === 0) return null;
    const avgEdge = props.reduce((s: number, p: Prop) => s + p.modelEdge, 0) / props.length;
    return {
      avgEdge: Math.round(avgEdge * 10) / 10,
      count: props.length,
    };
  }, [props]);

  const monthOptions = availableMonths.map((m) => {
    const [y, mo] = m.split("-");
    const label = `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(mo)-1]} ${y}`;
    return { value: m, label };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80"
    >
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
        <div className="flex flex-wrap items-center gap-3">
          <SelectDropdown
            label="From"
            value={startMonth}
            onValueChange={setStartMonth}
            options={monthOptions}
          />
          <SelectDropdown
            label="To"
            value={endMonth}
            onValueChange={setEndMonth}
            options={monthOptions}
          />
        </div>
      </div>

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
                tickFormatter={(d) => {
                  const parts = d?.split("-");
                  if (!parts || parts.length < 3) return d ?? "";
                  return `${Number(parts[1])}/${Number(parts[2])}`;
                }}
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
                type="linear"
                dataKey="edge"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#edgeGradient)"
              />
              <Line
                yAxisId="hit"
                type="linear"
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
