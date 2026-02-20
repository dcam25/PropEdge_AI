"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/plan");
  }, [router]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-zinc-500">Redirecting to Plan...</p>
    </div>
  );
}
