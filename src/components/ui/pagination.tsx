"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { SelectDropdown } from "./dropdown";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZES = [20, 50, 100];

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(String(page));
  const inputRef = useRef<HTMLInputElement>(null);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  useEffect(() => {
    if (showInput) {
      setInputValue(String(page));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [showInput, page]);

  const handleGoToPage = () => {
    const num = parseInt(inputValue, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
    }
    setShowInput(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 px-4 py-3">
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <span>
          Showing {start}–{end} of {totalItems}
        </span>
        {onPageSizeChange && (
          <SelectDropdown
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSizeChange(Number(v));
              onPageChange(1);
            }}
            options={PAGE_SIZES.map((s) => ({ value: String(s), label: `${s} per page` }))}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {showInput ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1"
          >
            <div className="flex items-stretch rounded-lg border border-zinc-600 bg-zinc-800 overflow-hidden">
              <input
                ref={inputRef}
                type="number"
                min={1}
                max={totalPages}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoToPage();
                  if (e.key === "Escape") setShowInput(false);
                }}
                onBlur={handleGoToPage}
                className="w-12 border-0 bg-transparent px-2 py-1.5 text-center text-sm text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div className="flex h-full min-h-[2.5rem] flex-col border-l border-zinc-600">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const n = parseInt(inputValue, 10) || page;
                    const next = Math.min(n + 1, totalPages);
                    setInputValue(String(next));
                    onPageChange(next);
                  }}
                  className="flex flex-1 min-h-0 items-center justify-center px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const n = parseInt(inputValue, 10) || page;
                    const next = Math.max(n - 1, 1);
                    setInputValue(String(next));
                    onPageChange(next);
                  }}
                  className="flex flex-1 min-h-0 items-center justify-center px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
            <span className="text-sm text-zinc-500">/ {totalPages}</span>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="min-w-[6rem] rounded px-2 py-1 text-center text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            title="Click to enter page number"
          >
            Page {page} of {totalPages}
          </button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
