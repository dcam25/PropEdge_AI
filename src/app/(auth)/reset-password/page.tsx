"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { passwordSchema } from "@/lib/validations/signup";

type ResetForm = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(true);
      if (!session) {
        router.replace("/login?error=reset_expired");
      }
    });
  }, [supabase.auth, router]);

  const form = useForm<ResetForm>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetForm) {
    setError("");
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const result = passwordSchema.safeParse(data.password);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/login?message=password_reset");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Set new password</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400">New password</label>
            <input
              type="password"
              {...form.register("password", { required: "Password is required" })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400">Confirm password</label>
            <input
              type="password"
              {...form.register("confirmPassword", { required: "Please confirm your password" })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              placeholder="••••••••"
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Update password"}
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
