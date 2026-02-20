"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export interface CarouselImage {
  src: string;
  alt: string;
  label?: string;
}

const slideVariants = {
  enter: (direction: number) => ({ x: (direction || 1) > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: (direction || 1) > 0 ? -40 : 40, opacity: 0 }),
};

export function ImageCarousel({ images }: { images: CarouselImage[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(0);

  const current = images[index];
  const currentLoaded = loaded[index];
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
  };
  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  const openLightbox = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxPrev = () => {
    setLightboxDirection(-1);
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  };
  const lightboxNext = () => {
    setLightboxDirection(1);
    setLightboxIndex((i) => (i + 1) % images.length);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") lightboxPrev();
        if (e.key === "ArrowRight") lightboxNext();
      }
    };
    if (lightboxOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox]);

  if (images.length === 0) return null;

  const isSingle = images.length === 1;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex aspect-video cursor-zoom-in items-center justify-center overflow-hidden bg-zinc-900"
            onClick={() => openLightbox(index)}
          >
            {!currentLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="h-10 w-10" />
              </div>
            )}
            <img
              src={current.src}
              alt={current.alt}
              className={`h-full w-full object-contain transition-opacity duration-200 ${currentLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setLoaded((prev) => ({ ...prev, [index]: true }))}
            />
          </motion.div>
        </AnimatePresence>

        {!isSingle && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/90 p-2.5 text-white shadow-lg ring-1 ring-zinc-700 hover:bg-zinc-800"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-900/90 p-2.5 text-white shadow-lg ring-1 ring-zinc-700 hover:bg-zinc-800"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
        <p className="text-sm text-zinc-500">{current.label ?? current.alt}</p>
        {!isSingle && (
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-emerald-500" : "w-2 bg-zinc-600 hover:bg-zinc-500"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 rounded-full bg-zinc-800/80 p-2 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSingle && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-800/90 p-3 text-white hover:bg-zinc-700"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-zinc-800/90 p-3 text-white hover:bg-zinc-700"
                  aria-label="Next"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait" custom={lightboxDirection}>
              <motion.img
                key={lightboxIndex}
                custom={lightboxDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </AnimatePresence>

            {!isSingle && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800/80 px-4 py-2 text-sm text-zinc-400">
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
