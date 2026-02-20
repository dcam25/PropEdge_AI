"use client";

import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpinInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  /** Pagination-style: input with vertical up/down arrows on the right */
  variant?: "default" | "pagination";
  /** Optional suffix (e.g. "USD" for balance charge) */
  suffix?: string;
}

export function SpinInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  className,
  variant = "default",
  suffix,
}: SpinInputProps) {
  const num = parseFloat(value);

  const adjust = (delta: number) => {
    const v = value === "" ? (min ?? 0) : num;
    const next = v + delta;
    const clamped = min != null && next < min ? min : max != null && next > max ? max : next;
    onChange(String(clamped));
  };

  if (variant === "pagination") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="flex items-stretch rounded-lg border border-zinc-600 bg-zinc-800 overflow-hidden">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-24 border-0 bg-transparent px-2 py-2 text-center text-sm text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <div className="flex flex-col border-l border-zinc-600">
            <motion.button
              type="button"
              onClick={() => adjust(step)}
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 min-h-0 min-w-[2rem] items-center justify-center px-1.5 py-0.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            >
              <ChevronUp className="h-3 w-3" />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => adjust(-step)}
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 min-h-0 min-w-[2rem] items-center justify-center px-1.5 py-0.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            >
              <ChevronDown className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
        {suffix && <span className="text-sm text-zinc-500">{suffix}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden",
        className
      )}
    >
      <motion.button
        type="button"
        onClick={() => adjust(-step)}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Minus className="h-4 w-4" />
      </motion.button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="h-10 w-20 shrink-0 border-0 border-x border-zinc-700 bg-transparent px-2 text-center text-sm text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <motion.button
        type="button"
        onClick={() => adjust(step)}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
