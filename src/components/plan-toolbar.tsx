"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { FREE_AI_LIMIT } from "@/stores/auth-store";
import { ChevronDown, Check, Zap } from "lucide-react";

const FREE_FEATURES = [
  { label: `${FREE_AI_LIMIT} AI insights per day`, available: true },
  { label: "1 custom model", available: true },
  { label: "Basic backtesting", available: true },
  { label: "Unlimited AI insights", available: false },
  { label: "Up to 10 models", available: false },
];

const PREMIUM_FEATURES = [
  { label: "Unlimited AI insights", available: true },
  { label: "Up to 10 custom models", available: true },
  { label: "Full backtesting", available: true },
  { label: "Priority support", available: true },
];

interface PlanToolbarProps {
  isPremium: boolean;
  aiRemaining: number;
}

export function PlanToolbar({ isPremium, aiRemaining }: PlanToolbarProps) {
  const features = isPremium ? PREMIUM_FEATURES : FREE_FEATURES;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md bg-zinc-800/80 px-2.5 py-1.5 text-xs transition-colors hover:bg-zinc-700/80"
          title="Your plan & features"
        >
          {isPremium ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              Premium
            </span>
          ) : (
            <span className="text-zinc-300">
              Free plan · {aiRemaining} AI left
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <div className="space-y-3">
          <div>
            <p className="font-medium text-zinc-100">
              {isPremium ? "Premium" : "Free plan"}
            </p>
            <p className="text-xs text-zinc-500">
              {isPremium ? "Full access" : `${aiRemaining} AI insights left today`}
            </p>
          </div>
          <div className="border-t border-zinc-800 pt-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">Your plan includes</p>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li
                  key={f.label}
                  className={`flex items-center gap-2 text-xs ${
                    f.available ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {f.available ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 border-t border-zinc-800 pt-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Dashboard
              </Button>
            </Link>
            <Link href="/plan" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Pricing
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="text-xs">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
