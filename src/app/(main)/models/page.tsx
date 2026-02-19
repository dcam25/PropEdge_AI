"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import type { UserModel, ModelFactor } from "@/types";
import { runBacktest } from "@/lib/model-scoring";
import { MOCK_PROPS } from "@/data/mock-props";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [modelsLoading, setModelsLoading] = useState(true);
  const [buildModelLoading, setBuildModelLoading] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFactors, setEditFactors] = useState<ModelFactor[]>(DEFAULT_FACTORS);
  const [showCreator, setShowCreator] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [factors, setFactors] = useState<ModelFactor[]>(DEFAULT_FACTORS);
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  const canCreateMore = profile?.is_premium
    ? models.length < 10
    : models.length < 1;
  const createDisabledReason = !canCreateMore
    ? profile?.is_premium
      ? "Model limit reached (10 max)."
      : "Free: 1 model max. Upgrade to Premium for up to 10."
    : null;

  const sortedModels = [...models].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  useEffect(() => {
    if (!user) {
      setModelsLoading(false);
      return;
    }
    setModelsLoading(true);
    supabase
      .from("user_models")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setModels((data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id,
          userId: r.user_id,
          name: r.name,
          description: r.description,
          factors: r.factors as ModelFactor[],
          performanceScore: r.performance_score,
          isActive: r.is_active,
          createdAt: r.created_at,
        })));
      })
      .finally(() => setModelsLoading(false));
  }, [user]);

  const handleBuildModel = async () => {
    if (!user || !newName.trim()) return;
    if (!canCreateMore) {
      alert("Model limit reached. Upgrade to Premium for up to 10 models.");
      return;
    }
    setBuildModelLoading(true);

    try {
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

    const { data: inserted, error: insertError } = await supabase
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

    if (insertError) {
      alert(`Failed to create model: ${insertError.message}`);
      return;
    }
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
    } finally {
      setBuildModelLoading(false);
    }
  };

  const handleEdit = (model: UserModel) => {
    setEditingId(model.id);
    setEditName(model.name);
    setEditDesc(model.description ?? "");
    setEditFactors(model.factors.length > 0 ? model.factors : DEFAULT_FACTORS);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingId) return;
    try {
      await supabase
        .from("user_models")
        .update({
          name: editName.trim(),
          description: editDesc.trim() || null,
          factors: editFactors,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .eq("user_id", user.id);
      setModels((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, name: editName.trim(), description: editDesc.trim() || null, factors: editFactors }
            : m
        )
      );
      setEditingId(null);
    } catch {
      alert("Failed to update model");
    }
  };

  const handleDelete = async (model: UserModel) => {
    if (!user || !confirm(`Delete model "${model.name}"?`)) return;
    setDeletingId(model.id);
    try {
      await supabase.from("user_models").delete().eq("id", model.id).eq("user_id", user.id);
      setModels((prev) => prev.filter((m) => m.id !== model.id));
    } catch {
      alert("Failed to delete model");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetActive = async (model: UserModel) => {
    if (!user) return;
    setActiveModelId(model.id);
    try {
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
    } finally {
      setActiveModelId(null);
    }
  };

  if (loading || modelsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Sign in to manage your models</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">My Models</h1>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={() => setShowCreator(!showCreator)}
            disabled={!canCreateMore}
            title={createDisabledReason ?? undefined}
          >
            {showCreator ? "Cancel" : "Create Model"}
          </Button>
          {createDisabledReason && (
            <span className="text-xs text-zinc-500">{createDisabledReason}</span>
          )}
        </div>
      </div>

      <AnimatePresence>
      {showCreator && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
        <Card>
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
            <Button onClick={handleBuildModel} disabled={buildModelLoading}>
              {buildModelLoading ? "Building..." : "Build Model"}
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      )}
      </AnimatePresence>

      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
        }}
      >
        <AnimatePresence mode="popLayout">
        {sortedModels.map((model) => {
          const bt = runBacktest(MOCK_PROPS, model);
          return (
            <motion.div
              key={model.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
            <Card
              className={
                model.isActive
                  ? "ring-2 ring-emerald-500/50 transition-shadow duration-300"
                  : ""
              }
            >
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(model)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={() => handleDelete(model)}
                    disabled={deletingId === model.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {!model.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetActive(model)}
                      disabled={activeModelId === model.id}
                    >
                      {activeModelId === model.id ? "Setting..." : "Set Active"}
                    </Button>
                  )}
                </div>
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
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                placeholder="e.g. Balanced"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Description</label>
              <input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Factor Weights (0–100%)</label>
              <div className="mt-2 space-y-2">
                {editFactors.map((f) => (
                  <div key={f.id} className="flex items-center gap-4">
                    <span className="w-36 text-sm">{f.name}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={f.weight}
                      onChange={(e) =>
                        setEditFactors((prev) =>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
