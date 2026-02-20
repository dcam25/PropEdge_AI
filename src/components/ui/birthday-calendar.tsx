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
const MIN_YEAR = 1900;
const CURRENT_DECADE = Math.floor(CURRENT_YEAR / 10) * 10;

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

const contentVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir !== 0 ? dir * 30 : 0,
    scale: dir === 0 ? 0.95 : 1,
  }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir !== 0 ? dir * -30 : 0,
    scale: dir === 0 ? 0.95 : 1,
  }),
};

export function BirthdayCalendar({ value, onChange, className }: BirthdayCalendarProps) {
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [open, setOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("days");
  const [decadeStart, setDecadeStart] = React.useState(() =>
    Math.floor((parsed?.getFullYear() ?? CURRENT_YEAR) / 10) * 10
  );
  const [viewDate, setViewDate] = React.useState(() => parsed ?? new Date());
  const [navDirection, setNavDirection] = React.useState(0);
  const [decadesPageStart, setDecadesPageStart] = React.useState(() =>
    Math.floor(CURRENT_YEAR / 10) * 10
  );

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
    setNavDirection(0);
    setViewDate((v) => new Date(v.getFullYear(), m, 1));
    setViewMode("days");
  };

  const handleSelectYear = (y: number) => {
    setNavDirection(0);
    setViewDate((v) => new Date(y, v.getMonth(), 1));
    setViewMode("months");
  };

  const handleSelectDecade = (start: number) => {
    setNavDirection(0);
    setDecadeStart(start);
    setViewMode("years");
  };

  const decadeYears = Array.from({ length: 12 }, (_, i) => decadeStart + i)
    .filter((y) => y >= MIN_YEAR);
  const decades = Array.from({ length: 9 }, (_, i) => decadesPageStart - 80 + i * 10);

  const canGoPrev =
    viewMode === "days"
      ? !(year === MIN_YEAR && month === 0)
      : viewMode === "months"
        ? year > MIN_YEAR
        : viewMode === "years"
          ? decadeStart > MIN_YEAR
          : decadesPageStart - 90 >= MIN_YEAR;

  const canGoNext =
    viewMode === "days"
      ? !(year === CURRENT_YEAR && month === 11)
      : viewMode === "months"
        ? year < CURRENT_YEAR
        : viewMode === "years"
          ? decadeStart + 12 <= CURRENT_YEAR
          : decadesPageStart + 10 <= CURRENT_DECADE;

  const goPrev = () => {
    if (!canGoPrev) return;
    setNavDirection(-1);
    if (viewMode === "days") setViewDate((v) => new Date(v.getFullYear(), v.getMonth() - 1));
    else if (viewMode === "months") setViewDate((v) => new Date(v.getFullYear() - 1, v.getMonth(), 1));
    else if (viewMode === "years") setDecadeStart((d) => d - 12);
    else if (viewMode === "decades") setDecadesPageStart((d) => d - 90);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setNavDirection(1);
    if (viewMode === "days") setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + 1));
    else if (viewMode === "months") setViewDate((v) => new Date(v.getFullYear() + 1, v.getMonth(), 1));
    else if (viewMode === "years") setDecadeStart((d) => d + 12);
    else if (viewMode === "decades") setDecadesPageStart((d) => d + 90);
  };

  const cycleHeaderView = () => {
    setNavDirection(0);
    if (viewMode === "days") setViewMode("months");
    else if (viewMode === "months") {
      setDecadeStart(Math.floor(year / 12) * 12);
      setViewMode("years");
    } else if (viewMode === "years") {
      setDecadesPageStart(Math.floor(decadeStart / 10) * 10);
      setViewMode("decades");
    } else setViewMode("days");
  };

  const headerLabel =
    viewMode === "days"
      ? `${MONTHS[month]} ${year}`
      : viewMode === "months"
        ? `${year}`
        : viewMode === "years"
          ? `${decadeStart}\u2013${Math.min(decadeStart + 11, CURRENT_YEAR)}`
          : decades.length > 0
            ? `${decades[0]}\u2013${decades[decades.length - 1] + 9}`
            : "";

  const contentKey =
    viewMode === "days"
      ? `days-${year}-${month}`
      : viewMode === "months"
        ? `months-${year}`
        : viewMode === "years"
          ? `years-${decadeStart}`
          : `decades-${decadesPageStart}`;

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
                  disabled={!canGoPrev}
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
                  disabled={!canGoNext}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="h-[252px] overflow-hidden">
                <AnimatePresence mode="wait" custom={navDirection}>
                  {viewMode === "days" && (
                    <motion.div
                      key={contentKey}
                      custom={navDirection}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
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
                      key={contentKey}
                      custom={navDirection}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
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
                      key={contentKey}
                      custom={navDirection}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-3 grid-rows-[repeat(4,minmax(0,1fr))] gap-0.5"
                    >
                      {decadeYears.map((y) => {
                        const isFuture = y > CURRENT_YEAR;
                        return (
                          <button
                            key={y}
                            type="button"
                            disabled={isFuture}
                            onClick={() => handleSelectYear(y)}
                            className={cn(
                              "flex min-h-0 items-center justify-center rounded py-1 text-sm transition-colors",
                              isFuture
                                ? "text-zinc-700 cursor-not-allowed"
                                : year === y
                                  ? "bg-emerald-500 text-white"
                                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            )}
                          >
                            {y}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {viewMode === "decades" && (
                    <motion.div
                      key={contentKey}
                      custom={navDirection}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="grid h-full grid-cols-3 grid-rows-[repeat(3,minmax(0,1fr))] gap-0.5"
                    >
                      {decades.map((start) => {
                        const isOutOfRange = start < MIN_YEAR;
                        return (
                          <button
                            key={start}
                            type="button"
                            disabled={isOutOfRange}
                            onClick={() => handleSelectDecade(start)}
                            className={cn(
                              "flex min-h-0 items-center justify-center rounded py-1 text-sm transition-colors",
                              isOutOfRange
                                ? "text-zinc-700 cursor-not-allowed"
                                : decadeStart === start
                                  ? "bg-emerald-500 text-white"
                                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                            )}
                          >
                            {start}&ndash;{start + 9}
                          </button>
                        );
                      })}
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
