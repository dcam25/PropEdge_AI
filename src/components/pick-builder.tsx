"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { Trash2, Copy, GripVertical } from "lucide-react";
import type { Prop } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PickBuilderProps {
  picks: Prop[];
  onRemove: (prop: Prop) => void;
  onReorder?: (picks: Prop[]) => void;
}

function AnimatedCheckbox({
  checked,
  indeterminate,
  onChange,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const showCheck = checked;
  const showDash = indeterminate && !checked;

  return (
    <label
      className="flex shrink-0 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <motion.div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked || indeterminate ? "border-emerald-500 bg-emerald-500" : "border-zinc-600 bg-zinc-800"
        )}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M1 4L4 7L9 1"
            initial={false}
            animate={{
              pathLength: showCheck ? 1 : 0,
              opacity: showCheck ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.path
            d="M2 4 L8 4"
            initial={false}
            animate={{
              pathLength: showDash ? 1 : 0,
              opacity: showDash ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      </motion.div>
    </label>
  );
}

function PickItem({
  prop,
  isSelected,
  onToggle,
  onRemove,
  draggable,
}: {
  prop: Prop;
  isSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  draggable: boolean;
}) {
  const dragControls = useDragControls();

  const checkboxEl = (
    <AnimatedCheckbox checked={isSelected} onChange={onToggle} />
  );

  const textEl = (
    <div
      className="min-w-0 flex-1 select-none text-center"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <div className="truncate font-medium">{prop.player}</div>
      <div className="text-xs text-zinc-500">
        {prop.propType} {prop.line} · {prop.modelEdge}%
      </div>
    </div>
  );

  const removeBtn = (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  const itemClass =
    "flex cursor-pointer select-none items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-3 text-sm transition-shadow duration-200";

  if (draggable) {
    return (
      <Reorder.Item
        value={prop}
        dragListener={false}
        dragControls={dragControls}
        className={itemClass}
      >
        <div
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-4 w-4 text-zinc-500" />
        </div>
        {checkboxEl}
        {textEl}
        {removeBtn}
      </Reorder.Item>
    );
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.95, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={itemClass}
      onClick={() => onToggle()}
    >
      {checkboxEl}
      {textEl}
      {removeBtn}
    </motion.li>
  );
}

export function PickBuilder({ picks, onRemove, onReorder }: PickBuilderProps) {
  const [copying, setCopying] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedIds((prev) =>
      new Set([...prev].filter((id) => picks.some((p) => p.id === id)))
    );
  }, [picks]);

  const allSelected = picks.length > 0 && selectedIds.size === picks.length;
  const someSelected = selectedIds.size > 0;
  const selectAllIndeterminate = someSelected && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(picks.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeSelected = () => {
    picks.filter((p) => selectedIds.has(p.id)).forEach((p) => onRemove(p));
    setSelectedIds(new Set());
  };

  const avgEdge = picks.length > 0
    ? (picks.reduce((s, p) => s + p.modelEdge, 0) / picks.length).toFixed(1)
    : "—";

  const copyExport = async () => {
    setCopying(true);
    try {
      const lines = picks.map((p) =>
        `${p.player} (${p.team}) ${p.propType} ${p.line} — Edge: ${p.modelEdge}%`
      );
      const text = lines.join("\n");
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard! Paste into PrizePicks/Underdog.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-3 font-semibold text-zinc-100"
      >
        Pick Slip
      </motion.h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 flex items-center justify-between text-sm text-zinc-400"
      >
        <span>{picks.length} props</span>
        <span>Avg Edge: {avgEdge}%</span>
      </motion.div>
      {picks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-2 flex h-10 min-h-10 items-center gap-2"
        >
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
            <AnimatedCheckbox
              checked={allSelected}
              indeterminate={selectAllIndeterminate}
              onChange={toggleSelectAll}
            />
            <span>Select all</span>
          </label>
          <AnimatePresence>
            {someSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-900/50 text-red-400 hover:bg-red-950/50"
                  onClick={removeSelected}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove selected ({selectedIds.size})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      {onReorder ? (
        <Reorder.Group
          axis="y"
          values={picks}
          onReorder={onReorder}
          className="flex flex-1 flex-col gap-2 p-1"
        >
          {picks.map((prop) => (
            <PickItem
              key={prop.id}
              prop={prop}
              isSelected={selectedIds.has(prop.id)}
              onToggle={() => toggleSelect(prop.id)}
              onRemove={() => onRemove(prop)}
              draggable
            />
          ))}
        </Reorder.Group>
      ) : (
        <ul className="flex-1 space-y-2 p-1">
          <AnimatePresence mode="popLayout">
          {picks.map((prop) => (
            <PickItem
              key={prop.id}
              prop={prop}
              isSelected={selectedIds.has(prop.id)}
              onToggle={() => toggleSelect(prop.id)}
              onRemove={() => onRemove(prop)}
              draggable={false}
            />
          ))}
          </AnimatePresence>
        </ul>
      )}
      <motion.div whileHover={{ scale: picks.length > 0 ? 1.01 : 1 }} whileTap={{ scale: 0.99 }}>
      <Button
        className="mt-4 w-full"
        onClick={copyExport}
        disabled={picks.length === 0 || copying}
      >
        {copying ? (
          <Spinner className="mr-2 h-4 w-4" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {copying ? "Copying..." : "Copy for PrizePicks / Underdog"}
      </Button>
      </motion.div>
    </motion.div>
  );
}
