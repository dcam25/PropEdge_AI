"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const DEFAULT_TIMESTAMPS = [6, 24, 28, 34, 37, 62, 100, 105, 120, 129, 136, 151]; // 0:06, 0:24, ... 2:31

const DEFAULT_DESCRIPTIONS = [
  "Project overview",
  "Authentication setup",
  "Database tables",
  "Table editor",
  "RLS policies",
  "API & Edge functions",
  "Stored procedures",
  "Auth users",
  "SQL editor",
  "Database schema",
  "Realtime",
  "Project settings",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const slideVariants = {
  enter: (direction: number) => ({ x: (direction || 1) > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: (direction || 1) > 0 ? -40 : 40, opacity: 0 }),
};

export function VideoFrameGallery({
  src,
  timestamps = DEFAULT_TIMESTAMPS,
  descriptions = DEFAULT_DESCRIPTIONS,
}: {
  src: string;
  timestamps?: number[];
  descriptions?: string[];
}) {
  const [frames, setFrames] = useState<{ data: string; time: number }[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(0);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;

    const captured: { data: string; time: number }[] = [];
    let i = 0;

    const captureNext = () => {
      if (i >= timestamps.length) {
        setFrames([...captured]);
        return;
      }
      const t = Math.min(timestamps[i], video.duration - 0.01);
      video.currentTime = t;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          captured.push({
            data: canvas.toDataURL("image/jpeg", 0.85),
            time: timestamps[i],
          });
        }
        i++;
        captureNext();
      } catch {
        i++;
        captureNext();
      }
    };

    video.oncanplay = () => {
      if (video.duration > 0) captureNext();
    };

    video.load();
  }, [src, timestamps.join(",")]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (lightboxOpen && frames.length > 0) {
        if (e.key === "ArrowLeft") {
          setLightboxDirection(-1);
          setLightboxIndex((i) => (i - 1 + frames.length) % frames.length);
        }
        if (e.key === "ArrowRight") {
          setLightboxDirection(1);
          setLightboxIndex((i) => (i + 1) % frames.length);
        }
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
  }, [lightboxOpen, closeLightbox, frames.length]);

  const isSingle = frames.length === 1;

  if (frames.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex aspect-video items-center justify-center">
            <Spinner className="h-10 w-10" />
          </div>
        </div>
      </div>
    );
  }
  const current = frames[index];
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + frames.length) % frames.length);
  };
  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % frames.length);
  };
  const goTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };
  const lightboxPrev = () => {
    setLightboxDirection(-1);
    setLightboxIndex((i) => (i - 1 + frames.length) % frames.length);
  };
  const lightboxNext = () => {
    setLightboxDirection(1);
    setLightboxIndex((i) => (i + 1) % frames.length);
  };

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
            className="flex aspect-video cursor-zoom-in items-center justify-center overflow-hidden"
            onClick={() => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
          >
            <img
              src={current.data}
              alt={`Frame at ${formatTime(current.time)}`}
              className="h-full w-full object-fill"
            />
          </motion.div>
        </AnimatePresence>

        {!isSingle && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-zinc-300 hover:bg-black/90 hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-zinc-300 hover:bg-black/90 hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
        <p className="text-sm text-zinc-500 shrink-0">
          {isSingle ? formatTime(current.time) : `${index + 1} / ${frames.length} · ${formatTime(current.time)}`}
        </p>
        <p className="text-sm text-zinc-400 flex-1 text-center">
          {descriptions[index]}
        </p>
        {!isSingle && (
          <div className="flex gap-1.5 shrink-0">
            {frames.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-emerald-500" : "w-2 bg-zinc-600 hover:bg-zinc-500"
                }`}
                aria-label={`Go to frame ${i + 1}`}
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
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/80 p-3 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            <AnimatePresence mode="wait" custom={lightboxDirection}>
              <motion.img
                key={lightboxIndex}
                custom={lightboxDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={frames[lightboxIndex].data}
                alt={`Frame at ${formatTime(frames[lightboxIndex].time)}`}
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </AnimatePresence>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800/80 p-3 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              aria-label="Next"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex max-w-md -translate-x-1/2 flex-col items-center gap-1 rounded-lg bg-zinc-800/80 px-4 py-3 text-center">
              <span className="text-sm text-zinc-400">
                {isSingle ? formatTime(frames[lightboxIndex].time) : `${lightboxIndex + 1} / ${frames.length} · ${formatTime(frames[lightboxIndex].time)}`}
              </span>
              {descriptions[lightboxIndex] && (
                <span className="text-sm text-zinc-300">{descriptions[lightboxIndex]}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
