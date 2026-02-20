"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();

function getDaysInMonth(year: number, month: number): Date[] {
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getPadStart(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

interface BirthdayCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

type ViewMode = "days" | "months" | "years" | "decades";

export function BirthdayCalendar({ value, onChange, className }: BirthdayCalendarProps) {
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [open, setOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("days");
  const [decadeStart, setDecadeStart] = React.useState(() =>
    Math.floor((parsed?.getFullYear() ?? CURRENT_YEAR) / 10) * 10
  );
  const [viewDate, setViewDate] = React.useState(() => parsed ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);
  const padStart = getPadStart(year, month);

  const formatDisplay = (d: Date | null) => {
    if (!d) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSelectDay = (d: Date) => {
    onChange(toYMD(d));
    setOpen(false);
  };

  const handleSelectMonth = (m: number) => {
    setViewDate((v) => new Date(v.getFullYear(), m, 1));
    setViewMode("days");
  };

  const handleSelectYear = (y: number) => {
    setViewDate((v) => new Date(y, v.getMonth(), 1));
    setViewMode("days");
  };

  const handleSelectDecade = (start: number) => {
    setDecadeStart(start);
    setViewMode("years");
  };

  const goPrev = () => {
    if (viewMode === "days") setViewDate((v) => new Date(v.getFullYear(), v.getMonth() - 1));
  };

  const goNext = () => {
    if (viewMode === "days") setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + 1));
  };

  const cycleHeaderView = () => {
    if (viewMode === "days") setViewMode("months");
    else if (viewMode === "months") {
      setDecadeStart(Math.floor(year / 10) * 10);
      setViewMode("years");
    } else if (viewMode === "years") setViewMode("decades");
    else setViewMode("days");
  };

  const headerLabel =
    viewMode === "days"
      ? `${MONTHS[month]} ${year}`
      : viewMode === "months"
        ? `${MONTHS[month]} ${year}`
        : viewMode === "years"
          ? `${decadeStart}-${decadeStart + 9}`
          : `${decadeStart}-${decadeStart + 9}`;

  const decadeYears = Array.from({ length: 10 }, (_, i) => decadeStart + i);
  const decades = Array.from({ length: 13 }, (_, i) => Math.floor(CURRENT_YEAR / 10) * 10 - i * 10);

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) setViewMode("days");
          }}
          className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-zinc-100 transition-colors hover:border-zinc-600"
        >
          <Calendar className="h-4 w-4 shrink-0 text-zinc-500" />
          <span className={cn("flex-1", !value && "text-zinc-500")}>
            {value ? formatDisplay(parsed) : "Select birthday"}
          </span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute left-0 top-full z-50 mt-2 w-[17rem] rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={viewMode !== "days"}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cycleHeaderView}
                  className="flex-1 rounded-lg py-2 text-center text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
                >
                  {headerLabel}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={viewMode !== "days"}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="h-[252px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {viewMode === "days" && (
                    <motion.div
                      key="days"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-7 grid-rows-[repeat(7,minmax(0,1fr))] gap-0.5 text-center text-xs"
                    >
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="flex min-h-0 items-center justify-center text-zinc-500">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: padStart }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {days.map((d) => {
                    const ymd = toYMD(d);
                    const isSelected = value === ymd;
                    const isToday = toYMD(new Date()) === ymd;
                    return (
                      <button
                        key={ymd}
                        type="button"
                        onClick={() => handleSelectDay(d)}
                        className={cn(
                          "flex min-h-0 items-center justify-center rounded py-0.5 transition-colors",
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
                          isToday && !isSelected && "ring-1 ring-emerald-500/50"
                        )}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                    </motion.div>
                  )}

                  {viewMode === "months" && (
                    <motion.div
                      key="months"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-3 grid-rows-[repeat(4,minmax(0,1fr))] gap-0.5"
                    >
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMonth(i)}
                      className={cn(
                        "flex min-h-0 items-center justify-center rounded py-1 text-sm transition-colors",
                        month === i
                          ? "bg-emerald-500 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                    </motion.div>
                  )}

                  {viewMode === "years" && (
                    <motion.div
                      key="years"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-5 grid-rows-[repeat(2,minmax(0,1fr))] gap-0.5"
                    >
                  {decadeYears.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYear(y)}
                      className={cn(
                        "flex min-h-0 items-center justify-center rounded py-1 text-sm transition-colors",
                        year === y
                          ? "bg-emerald-500 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                    </motion.div>
                  )}

                  {viewMode === "decades" && (
                    <motion.div
                      key="decades"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-3 grid-rows-[repeat(5,minmax(0,1fr))] gap-0.5"
                    >
                  {decades.map((start) => (
                    <button
                      key={start}
                      type="button"
                      onClick={() => handleSelectDecade(start)}
                      className={cn(
                        "flex min-h-0 items-center justify-center rounded py-1 text-sm transition-colors",
                        decadeStart === start
                          ? "bg-emerald-500 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                      )}
                    >
                      {start}-{start + 9}
                    </button>
                  ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
