"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type LoginForm = {
  email: string;
  password: string;
  otp: string;
};

type LoginMode = "password" | "otp";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState<LoginMode>("password");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback") {
      const msg = "Email confirmation failed. The link may have expired. Try signing up again.";
      setError(msg);
      toast.error(msg);
    }
    if (searchParams.get("error") === "reset_expired") {
      const msg = "Password reset link expired. Please request a new one.";
      setError(msg);
      toast.error(msg);
    }
    if (searchParams.get("message") === "confirm_email") {
      const msg = "Check your email to confirm your account, then sign in.";
      setSuccess(msg);
      setError("");
      toast.success(msg);
    }
    if (searchParams.get("message") === "password_reset") {
      const msg = "Password updated. You can now sign in.";
      setSuccess(msg);
      setError("");
      toast.success(msg);
    }
  }, [searchParams]);

  const passwordForm = useForm<Pick<LoginForm, "email" | "password">>({
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<Pick<LoginForm, "email">>({
    defaultValues: { email: "" },
  });

  const otpVerifyForm = useForm<Pick<LoginForm, "otp">>({
    defaultValues: { otp: "" },
  });

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  async function onPasswordSubmit(data: { email: string; password: string }) {
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Signed in successfully");
    router.push(redirectTo);
    router.refresh();
  }

  async function sendOtp(data: { email: string }) {
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    setEmail(data.email);
    setStep("otp");
    const msg = "Check your email for the 6-digit code.";
    setSuccess(msg);
    toast.success(msg);
  }

  async function verifyOtp(data: { otp: string }) {
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.otp,
      type: "email",
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Signed in successfully");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">PropEdge AI</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === "password" && step === "credentials" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <label className="block text-sm font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  {...passwordForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {passwordForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </motion.div>
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-400">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  {...passwordForm.register("password", { required: "Password is required" })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </motion.div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
              <button
                type="button"
                onClick={() => {
                  setMode("otp");
                  setStep("credentials");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Sign in with email code instead
              </button>
            </motion.form>
          )}

          {mode === "otp" && step === "credentials" && (
            <motion.form
              key="otp-email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={otpForm.handleSubmit(sendOtp)}
              className="space-y-4"
            >
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <label className="block text-sm font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  {...otpForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {otpForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {otpForm.formState.errors.email.message}
                  </p>
                )}
              </motion.div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {success && <p className="text-sm text-emerald-400">{success}</p>}
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpForm.formState.isSubmitting}
                >
                  {otpForm.formState.isSubmitting ? "Sending..." : "Email me a code"}
                </Button>
              </motion.div>
              <button
                type="button"
                onClick={() => {
                  setMode("password");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Sign in with password instead
              </button>
            </motion.form>
          )}

          {mode === "otp" && step === "otp" && (
            <motion.form
              key="otp-verify"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={otpVerifyForm.handleSubmit(verifyOtp)}
              className="space-y-4"
            >
              <motion.p layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }} className="text-sm text-zinc-400">
                We sent a 6-digit code to <strong className="text-zinc-100">{email}</strong>
              </motion.p>
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <label className="block text-sm font-medium text-zinc-400">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  {...otpVerifyForm.register("otp", {
                    required: "Code is required",
                    minLength: { value: 6, message: "Enter 6-digit code" },
                    pattern: { value: /^\d{6}$/, message: "Enter 6 digits" },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-lg tracking-[0.5em] text-zinc-100"
                />
                {otpVerifyForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-400">
                    {otpVerifyForm.formState.errors.otp.message}
                  </p>
                )}
              </motion.div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otpVerifyForm.formState.isSubmitting}
                >
                  {otpVerifyForm.formState.isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </motion.div>
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Use a different email
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
