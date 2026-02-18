import { NextRequest, NextResponse } from "next/server";
import type { Prop } from "@/types";

// Use OpenAI-compatible API (works with Grok, Claude, etc.)
const AI_API_URL = process.env.AI_API_URL ?? "https://api.openai.com/v1/chat/completions";
const AI_API_KEY = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  if (!AI_API_KEY) {
    return NextResponse.json(
      { error: "AI API not configured. Set AI_API_KEY or OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const prop: Prop = body.prop;

  const lastGames = prop.lastGames?.join(", ") ?? "N/A";
  const supportingStats = prop.supportingStats
    ? `Avg: ${prop.supportingStats.avg}, Trend: ${prop.supportingStats.trend}`
    : "N/A";

  const prompt = `You are a sports analytics expert. In 4-6 concise sentences, analyze this player prop and give a brief insight on whether the bet has value.

Player: ${prop.player}
Team: ${prop.team} vs ${prop.opponent}
Prop: ${prop.propType} — Line: ${prop.line}
Hit rate (last 10): ${(prop.hitRate * 100).toFixed(0)}%
Streak: ${prop.streak}
Last 10 game values: ${lastGames}
Supporting stats: ${supportingStats}
Model Edge: ${prop.modelEdge}%

Be direct and analytical. No fluff.`;

  try {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "Unable to generate insight.";
    return NextResponse.json({ insight: content });
  } catch (e) {
    console.error("AI insight error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
