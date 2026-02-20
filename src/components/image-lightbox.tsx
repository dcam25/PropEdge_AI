"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

export function ImageLightbox({ src, alt, className = "", children }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={`cursor-zoom-in outline-none ${className}`}
        aria-label={`View ${alt} full screen`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {children ?? <img src={src} alt={alt} className="w-full object-contain" />}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={handleClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleClose()}
            aria-label="Close"
          >
            <motion.button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full bg-zinc-800/80 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
            <motion.img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
