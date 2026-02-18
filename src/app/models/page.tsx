"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import type { UserModel, ModelFactor } from "@/types";
import { runBacktest } from "@/lib/model-scoring";
import { MOCK_PROPS } from "@/data/mock-props";

const DEFAULT_FACTORS: ModelFactor[] = [
  { id: "recent_form", name: "Recent Form", weight: 25 },
  { id: "matchup_difficulty", name: "Matchup Difficulty", weight: 20 },
  { id: "pace", name: "Pace", weight: 15 },
  { id: "usage_minutes", name: "Usage/Minutes", weight: 15 },
  { id: "home_away", name: "Home/Away", weight: 10 },
  { id: "rest_days", name: "Rest Days", weight: 10 },
  { id: "sample_size", name: "Sample Size", weight: 5 },
];

export default function ModelsPage() {
  const [models, setModels] = useState<UserModel[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [factors, setFactors] = useState<ModelFactor[]>(DEFAULT_FACTORS);
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  const canCreateMore = profile?.is_premium
    ? models.length < 10
    : models.length < 1;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_models")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setModels((data ?? []) as UserModel[]);
      });
  }, [user]);

  const handleBuildModel = async () => {
    if (!user || !newName.trim()) return;
    if (!canCreateMore) {
      alert("Model limit reached. Upgrade to Premium for up to 10 models.");
      return;
    }

    const { data: existing } = await supabase
      .from("user_models")
      .select("is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    const newModel: Omit<UserModel, "id" | "createdAt"> = {
      userId: user.id,
      name: newName.trim(),
      description: newDesc.trim(),
      factors,
      isActive: !existing,
    };

    const { data: inserted } = await supabase
      .from("user_models")
      .insert({
        user_id: newModel.userId,
        name: newModel.name,
        description: newModel.description,
        factors: newModel.factors,
        is_active: newModel.isActive,
      })
      .select()
      .single();

    if (inserted) {
      const m = {
        id: inserted.id,
        userId: inserted.user_id,
        name: inserted.name,
        description: inserted.description,
        factors: inserted.factors,
        isActive: inserted.is_active,
        createdAt: inserted.created_at,
      };
      setModels((prev) => [m, ...prev]);
      setShowCreator(false);
      setNewName("");
      setNewDesc("");
      setFactors(DEFAULT_FACTORS);
    }
  };

  const handleSetActive = async (model: UserModel) => {
    if (!user) return;
    await supabase
      .from("user_models")
      .update({ is_active: false })
      .eq("user_id", user.id);
    await supabase
      .from("user_models")
      .update({ is_active: true })
      .eq("id", model.id);
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        isActive: m.id === model.id,
      }))
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
        <p className="text-zinc-500">Sign in to manage your models</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
              Dashboard
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">My Models</h1>
          <Button
            onClick={() => setShowCreator(!showCreator)}
            disabled={!canCreateMore}
          >
            {showCreator ? "Cancel" : "Create Model"}
          </Button>
        </div>

        {showCreator && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Build Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                  placeholder="e.g. Balanced"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Description</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Factor Weights (0–100%)</label>
                <div className="mt-2 space-y-2">
                  {factors.map((f) => (
                    <div key={f.id} className="flex items-center gap-4">
                      <span className="w-36 text-sm">{f.name}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={f.weight}
                        onChange={(e) =>
                          setFactors((prev) =>
                            prev.map((p) =>
                              p.id === f.id ? { ...p, weight: parseInt(e.target.value) } : p
                            )
                          )
                        }
                        className="flex-1"
                      />
                      <span className="w-10 text-sm">{f.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleBuildModel}>Build Model</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {models.map((model) => {
            const bt = runBacktest(MOCK_PROPS, model);
            return (
              <Card key={model.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {model.name}
                      {model.isActive && (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                          Active
                        </span>
                      )}
                    </CardTitle>
                    {model.description && (
                      <p className="mt-1 text-sm text-zinc-500">{model.description}</p>
                    )}
                  </div>
                  {!model.isActive && (
                    <Button size="sm" variant="outline" onClick={() => handleSetActive(model)}>
                      Set Active
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-zinc-500">Backtest Hit Rate:</span>{" "}
                      {bt.hitRate}%
                    </div>
                    <div>
                      <span className="text-zinc-500">Total Bets:</span> {bt.totalBets}
                    </div>
                  </div>
                  {bt.byDate.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bt.byDate.slice(0, 7).map((d) => (
                        <span
                          key={d.date}
                          className={`rounded px-2 py-0.5 text-xs ${
                            d.hit ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          }`}
                          title={`${d.date}: ${d.count} bets`}
                        >
                          {d.date.slice(5)}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
