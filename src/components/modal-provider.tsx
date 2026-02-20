"use client";

import { ModalProvider as ReactModalHookProvider } from "react-modal-hook";

export function ModalProvider({ children }: { children: React.ReactNode }) {
  return <ReactModalHookProvider>{children}</ReactModalHookProvider>;
}
