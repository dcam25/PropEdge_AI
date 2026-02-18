"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-xl",
          className
        )}
      >
        {children}
      </motion.div>
    </DropdownMenuPrimitive.Content>
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors hover:bg-zinc-800 hover:text-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/** Select-style dropdown for single value pick (e.g. month picker) */
interface SelectDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
  className?: string;
}

export function SelectDropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  label,
  className,
}: SelectDropdownProps) {
  const selected = options.find((o) => o.value === value);
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm text-zinc-500">{label}</label>
      )}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            <span>{selected?.label ?? placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[var(--radix-popper-anchor-width)]">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => {
                onValueChange(opt.value);
                setOpen(false);
              }}
              className={cn(opt.value === value && "bg-zinc-800 text-emerald-400")}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuPortal };
