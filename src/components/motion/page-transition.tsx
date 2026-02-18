"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
