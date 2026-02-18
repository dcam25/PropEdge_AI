"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type SignupForm = {
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

type Step = "email" | "otp" | "password";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState<string | null>(null);
  const [verifiedViaOtp, setVerifiedViaOtp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const emailForm = useForm<Pick<SignupForm, "firstName" | "lastName" | "birthday" | "email">>({
    defaultValues: { firstName: "", lastName: "", birthday: "", email: "" },
  });

  const otpForm = useForm<Pick<SignupForm, "otp">>({
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<Pick<SignupForm, "password" | "confirmPassword">>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const sendOtp = async (data: { firstName: string; lastName: string; birthday: string; email: string }) => {
    setError("");
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setBirthday(data.birthday?.trim() || null);
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setEmail(data.email);
    setStep("otp");
  };

  const verifyOtp = async (data: { otp: string }) => {
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.otp,
      type: "email",
    });
    if (error) {
      setError(error.message);
      return;
    }
    setVerifiedViaOtp(true);
    setStep("password");
  };

  const updateProfileWithName = async (userId: string) => {
    const updates: { first_name?: string; last_name?: string; birthday?: string } = {};
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (birthday) updates.birthday = birthday;
    if (Object.keys(updates).length > 0) {
      await supabase.from("profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", userId);
    }
  };

  const setPassword = async (data: { password: string }) => {
    setError("");
    if (verifiedViaOtp) {
      const { data: authData, error } = await supabase.auth.updateUser({ password: data.password });
      if (error) {
        setError(error.message);
        return;
      }
      if (authData.user) await updateProfileWithName(authData.user.id);
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (authData.session && authData.user) {
        await updateProfileWithName(authData.user.id);
        router.push("/dashboard");
        router.refresh();
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "propedge_pending_profile",
            JSON.stringify({ email, first_name: firstName, last_name: lastName, birthday })
          );
        }
        router.push("/login?message=confirm_email");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">PropEdge AI</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {step === "email" && "Create your account"}
            {step === "otp" && "Verify your email"}
            {step === "password" && "Set your password"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={emailForm.handleSubmit(sendOtp)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-400">First name</label>
                  <input
                    type="text"
                    {...emailForm.register("firstName", { required: "First name is required" })}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  />
                  {emailForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">
                      {emailForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400">Last name</label>
                  <input
                    type="text"
                    {...emailForm.register("lastName", { required: "Last name is required" })}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  />
                  {emailForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">
                      {emailForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400">
                  Birthday <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  type="date"
                  {...emailForm.register("birthday")}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={emailForm.formState.isSubmitting}
              >
                {emailForm.formState.isSubmitting ? "Sending..." : "Send verification code"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  const vals = emailForm.getValues();
                  if (vals.email && /^\S+@\S+$/i.test(vals.email)) {
                    setEmail(vals.email);
                    setFirstName(vals.firstName);
                    setLastName(vals.lastName);
                    setBirthday(vals.birthday?.trim() || null);
                    setVerifiedViaOtp(false);
                    setStep("password");
                  } else {
                    setError("Enter a valid email first");
                  }
                }}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Skip verification (use email link instead)
              </button>
            </motion.form>
          )}

          {step === "otp" && (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={otpForm.handleSubmit(verifyOtp)}
              className="space-y-4"
            >
              <p className="text-sm text-zinc-400">
                We sent a 6-digit code to <strong className="text-zinc-100">{email}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-400">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  {...otpForm.register("otp", {
                    required: "Code is required",
                    minLength: { value: 6, message: "Enter 6-digit code" },
                    pattern: { value: /^\d{6}$/, message: "Enter 6 digits" },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-lg tracking-[0.5em] text-zinc-100"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-400">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={otpForm.formState.isSubmitting}
              >
                {otpForm.formState.isSubmitting ? "Verifying..." : "Verify"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300"
              >
                Use a different email
              </button>
            </motion.form>
          )}

          {step === "password" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={passwordForm.handleSubmit(setPassword)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-zinc-400">Password</label>
                <input
                  type="password"
                  {...passwordForm.register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400">Confirm password</label>
                <input
                  type="password"
                  {...passwordForm.register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) =>
                      v === passwordForm.watch("password") || "Passwords do not match",
                  })}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? "Setting up..." : "Complete signup"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
