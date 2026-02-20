"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NavItem {
  id: string;
  label: string | null;
  subtitle?: string;
}

interface NavGroup {
  label: string;
  id?: string;
  defaultOpen?: boolean;
  children: NavItem[];
}

const ABOUT_NAV_GROUPS: (NavGroup | NavItem)[] = [
  { id: "features", label: "Features", subtitle: "What This App Does" },
  {
    label: "Supabase",
    id: "supabase-project-overview",
    defaultOpen: true,
    children: [
      { id: "supabase-project-overview", label: null, subtitle: "Project overview" },
      { id: "supabase-auth-setup", label: null, subtitle: "Authentication setup" },
      { id: "supabase-database-tables", label: null, subtitle: "Database tables" },
      { id: "supabase-rls", label: null, subtitle: "RLS policies" },
      { id: "supabase-clients", label: null, subtitle: "Clients" },
    ],
  },
  {
    label: "Stripe",
    id: "stripe-webhook",
    defaultOpen: true,
    children: [
      { id: "stripe-webhook", label: null, subtitle: "Webhook & Transaction" },
      { id: "stripe-webhook-source", label: null, subtitle: "Webhook source" },
      { id: "stripe-transaction-source", label: null, subtitle: "Transaction source" },
      { id: "stripe-backend", label: null, subtitle: "Backend code" },
    ],
  },
  { id: "packages", label: "Packages" },
  { id: "deploy", label: "Deploy", subtitle: "Vercel" },
];

const README_NAV_GROUPS: (NavGroup | NavItem)[] = [
  { id: "tech-stack", label: "Tech Stack" },
  { id: "quick-start", label: "Quick Start", subtitle: "Get running" },
  { id: "packages", label: "Packages", subtitle: "Dependencies" },
  { id: "schema", label: "Schema", subtitle: "Database schema" },
  {
    label: "Supabase",
    id: "supabase-overview",
    defaultOpen: true,
    children: [
      { id: "supabase-overview", label: null, subtitle: "Project overview → Project settings" },
      { id: "supabase-showcase", label: null, subtitle: "Showcase" },
    ],
  },
  {
    label: "Stripe",
    id: "stripe-webhook",
    defaultOpen: true,
    children: [
      { id: "stripe-webhook", label: null, subtitle: "Webhook & Transaction" },
      { id: "stripe-webhook-source", label: null, subtitle: "Webhook source" },
      { id: "stripe-transaction-source", label: null, subtitle: "Transaction source" },
      { id: "stripe-backend", label: null, subtitle: "Backend code" },
    ],
  },
  { id: "deploy", label: "Deploy", subtitle: "Vercel" },
  { id: "features", label: "Features", subtitle: "App capabilities" },
];

function isNavGroup(item: NavGroup | NavItem): item is NavGroup {
  return "children" in item && Array.isArray((item as NavGroup).children);
}

function getAllIds(items: (NavGroup | NavItem)[]): string[] {
  const ids: string[] = [];
  items.forEach((item) => {
    if (isNavGroup(item)) {
      item.children.forEach((c) => ids.push(c.id));
    } else {
      ids.push((item as NavItem).id);
    }
  });
  return ids;
}

export function ScrollNav({ variant = "about" }: { variant?: "about" | "readme" }) {
  const items = variant === "about" ? ABOUT_NAV_GROUPS : README_NAV_GROUPS;
  const allIds = getAllIds(items);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (isNavGroup(item)) {
        initial[item.label] = item.defaultOpen ?? false;
      }
    });
    return initial;
  });

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    const headerOffset = 120;
    const updateActive = () => {
      for (let i = allIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(allIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset + 50) {
            setActiveId(allIds[i]);
            return;
          }
        }
      }
      setActiveId(allIds[0] ?? null);
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [allIds.join(",")]);

  const isActive = (id: string) => activeId === id;

  return (
    <nav className="sticky top-24 flex flex-col gap-2 text-base lg:text-lg">
      {items.map((item) => {
        if (isNavGroup(item)) {
          const isOpen = openGroups[item.label] ?? item.defaultOpen ?? false;
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={`group flex w-full items-center gap-1 text-left transition-colors hover:text-zinc-100 ${
                  item.children.some((c) => isActive(c.id)) ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-1 pl-5">
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={`#${child.id}`}
                      onClick={(e) => handleClick(e, child.id)}
                      className={`block text-sm transition-colors hover:text-zinc-400 ${
                        isActive(child.id) ? "text-emerald-400 font-medium" : "text-zinc-500"
                      }`}
                    >
                      {child.subtitle}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        }
        const navItem = item as NavItem;
        return (
          <a
            key={navItem.id}
            href={`#${navItem.id}`}
            onClick={(e) => handleClick(e, navItem.id)}
            className="group block transition-colors"
          >
            <span className={`block group-hover:text-zinc-100 ${isActive(navItem.id) ? "text-emerald-400 font-medium" : "text-zinc-400"}`}>
              {navItem.label}
            </span>
            {navItem.subtitle && (
              <span className={`mt-0.5 block text-sm group-hover:text-zinc-400 lg:text-base ${isActive(navItem.id) ? "text-emerald-400/90" : "text-zinc-500"}`}>
                {navItem.subtitle}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
