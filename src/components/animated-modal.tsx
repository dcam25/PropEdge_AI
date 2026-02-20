"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface AnimatedModalProps {
  hideModal: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Prevent close on outside click / escape (e.g. for OTP modal) */
  preventClose?: boolean;
}

export function AnimatedModal({
  hideModal,
  title,
  description,
  children,
  className,
  preventClose = false,
}: AnimatedModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && !preventClose && hideModal()}>
      <DialogContent
        className={cn(className)}
        onPointerDownOutside={(e) => preventClose && e.preventDefault()}
        onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description != null && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
