"use client";

import * as React from "react";
import { Datepicker } from "flowbite-react";
import { cn } from "@/lib/utils";

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYMD(s: string): Date | null {
  if (!s?.trim()) return null;
  const parsed = new Date(s + "T12:00:00");
  return isNaN(parsed.getTime()) ? null : parsed;
}

interface BirthdayCalendarProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

const minBirthDate = new Date(1920, 0, 1);
const maxBirthDate = new Date();

const birthdayDatepickerTheme = {
  root: {
    base: "relative",
    input: {
      base: "flex",
      addon: "",
      field: {
        base: "relative w-full",
        icon: {
          base: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
          svg: "h-4 w-4 text-zinc-500",
        },
        rightIcon: { base: "", svg: "" },
        input: {
          base: "block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50",
          sizes: { sm: "", md: "", lg: "" },
          colors: { gray: "", info: "", failure: "", warning: "", success: "" },
          withRightIcon: { on: "", off: "" },
          withIcon: { on: "pl-10", off: "" },
          withAddon: { on: "", off: "" },
          withShadow: { on: "", off: "" },
        },
      },
    },
  },
  popup: {
    root: {
      base: "absolute top-10 z-[9999] block pt-2",
      inline: "relative top-0 z-auto",
      inner: "inline-block rounded-lg border border-zinc-700 bg-zinc-900 p-4 shadow-xl",
    },
    header: {
      base: "",
      title: "px-2 py-3 text-center font-semibold text-zinc-100",
      selectors: {
        base: "mb-2 flex justify-between",
        button: {
          base: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600",
          prev: "",
          next: "",
          view: "",
        },
      },
    },
    view: { base: "p-1" },
    footer: {
      base: "mt-2 flex space-x-2",
      button: {
        base: "w-full rounded-lg px-4 py-2 text-center text-sm font-medium focus:ring-2 focus:ring-zinc-600",
        today: "bg-emerald-600 text-white hover:bg-emerald-700",
        clear: "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
      },
    },
  },
  views: {
    days: {
      header: {
        base: "mb-1 grid grid-cols-7 border-b border-zinc-700 pb-1.5",
        title: "h-6 text-center text-xs font-bold leading-6 text-zinc-500",
      },
      items: {
        base: "grid w-64 grid-cols-7",
        item: {
          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-medium leading-9 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          selected: "bg-emerald-600 text-white hover:bg-emerald-700",
          disabled: "text-zinc-600 cursor-not-allowed",
          today: "ring-1 ring-emerald-500/50",
        },
      },
    },
    months: {
      items: {
        base: "grid w-64 grid-cols-4",
        item: {
          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-medium leading-9 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          selected: "bg-emerald-600 text-white hover:bg-emerald-700",
          disabled: "text-zinc-600 cursor-not-allowed",
        },
      },
    },
    years: {
      items: {
        base: "grid w-64 grid-cols-4",
        item: {
          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-medium leading-9 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          selected: "bg-emerald-600 text-white hover:bg-emerald-700",
          disabled: "text-zinc-600 cursor-not-allowed",
        },
      },
    },
    decades: {
      items: {
        base: "grid w-64 grid-cols-4",
        item: {
          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-medium leading-9 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
          selected: "bg-emerald-600 text-white hover:bg-emerald-700",
          disabled: "text-zinc-600 cursor-not-allowed",
        },
      },
    },
  },
};

export function BirthdayCalendar({ value, onChange, className }: BirthdayCalendarProps) {
  const dateValue = React.useMemo(() => parseYMD(value), [value]);

  const handleChange = React.useCallback(
    (d: Date | null) => {
      onChange(d ? toYMD(d) : "");
    },
    [onChange]
  );

  return (
    <div
      className={cn(
        "birthday-calendar-animate relative z-10 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-zinc-700 [&_input]:bg-zinc-900 [&_input]:pl-10 [&_input]:pr-3 [&_input]:py-2 [&_input]:text-zinc-100 [&_input]:placeholder-zinc-500 [&_input]:focus:border-zinc-600 [&_input]:focus:outline-none [&_input]:focus:ring-1 [&_input]:focus:ring-zinc-600",
        className
      )}
    >
      <Datepicker
        value={dateValue}
        onChange={handleChange}
        minDate={minBirthDate}
        maxDate={maxBirthDate}
        theme={birthdayDatepickerTheme}
        label="Select birthday"
      />
    </div>
  );
}
