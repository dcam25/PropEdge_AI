"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type ForgotForm = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const form = useForm<ForgotForm>({
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotForm) {
    setError("");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Check your email</h1>
          <p className="text-sm text-zinc-400">
            We sent a password reset link to <strong className="text-zinc-100">{form.watch("email")}</strong>.
            Click the link to set a new password.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Forgot password</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">Email</label>
            <input
              type="email"
              {...form.register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          <Link href="/login" className="text-emerald-400 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
