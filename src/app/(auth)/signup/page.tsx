"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "react-modal-hook";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AnimatedModal } from "@/components/animated-modal";
import {
  signupFormSchema,
  signupOtpSchema,
  OTP_LENGTH,
  type SignupForm,
} from "@/lib/validations/signup";
import { BirthdayCalendar } from "@/components/ui/birthday-calendar";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

function OtpModal({
  hideModal,
  form,
  email,
  error,
  verifyOtpAndComplete,
}: {
  hideModal: () => void;
  form: UseFormReturn<SignupForm>;
  email: string;
  error: string;
  verifyOtpAndComplete: (data: Pick<SignupForm, "otp">, hideOtpModal: () => void) => Promise<void>;
}) {
  const [otpSeconds, setOtpSeconds] = useState(180);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setOtpSeconds(180);
    timerRef.current = setInterval(() => {
      setOtpSeconds((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <AnimatedModal
      hideModal={hideModal}
      title="Verify your email"
      description={
        <>
          We sent a {OTP_LENGTH}-digit code to <strong className="text-zinc-100">{email}</strong>
        </>
      }
      preventClose
      className="max-w-sm"
    >
      <motion.form
        onSubmit={form.handleSubmit((data) => verifyOtpAndComplete(data, hideModal))}
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 }}
      >
        <div>
          <label className="block text-sm font-medium text-zinc-400">Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            {...form.register("otp")}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-lg tracking-[0.4em] text-zinc-100"
          />
          {form.formState.errors.otp && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.otp.message}</p>
          )}
        </div>
        <p className={`text-center text-sm tabular-nums ${otpSeconds > 0 ? "text-zinc-400" : "text-red-400"}`}>
          {otpSeconds > 0
            ? `Code expires in ${Math.floor(otpSeconds / 60)}:${String(otpSeconds % 60).padStart(2, "0")}`
            : "Code expired"}
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || otpSeconds === 0}
        >
          {form.formState.isSubmitting ? "Setting up..." : "Verify"}
        </Button>
      </motion.form>
    </AnimatedModal>
  );
}

export default function SignupPage() {
  const [error, setError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthday: "",
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { watch, getValues, setValue } = form;
  const email = watch("email");
  const password = watch("password") ?? "";
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRequirements = [
    { label: "8+ characters", check: (p: string) => p.length >= 8 },
    { label: "1+ special character", check: (p: string) => (p.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 1 },
    { label: "2+ uppercase letters", check: (p: string) => (p.match(/[A-Z]/g) || []).length >= 2 },
    { label: "2+ lowercase letters", check: (p: string) => (p.match(/[a-z]/g) || []).length >= 2 },
    { label: "2+ numbers", check: (p: string) => (p.match(/\d/g) || []).length >= 2 },
  ];

  const updateProfileWithName = async (
    userId: string,
    data: Pick<SignupForm, "firstName" | "lastName" | "birthday">
  ) => {
    const updates: { first_name?: string; last_name?: string; birthday?: string } = {};
    if (data.firstName) updates.first_name = data.firstName;
    if (data.lastName) updates.last_name = data.lastName;
    if (data.birthday?.trim()) updates.birthday = data.birthday.trim();
    if (Object.keys(updates).length > 0) {
      await supabase.from("profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", userId);
    }
  };

  const verifyOtpAndComplete = async (data: Pick<SignupForm, "otp">, hideOtpModal: () => void) => {
    setError("");
    const ok = await form.trigger(["password", "confirmPassword"]);
    if (!ok) return;

    const otpResult = signupOtpSchema.safeParse({ otp: data.otp });
    if (!otpResult.success) {
      form.setError("otp", { message: otpResult.error.issues[0]?.message ?? "Invalid code" });
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email: getValues("email"),
      token: otpResult.data.otp,
      type: "email",
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }

    const all = getValues();
    const profileData = { firstName: all.firstName, lastName: all.lastName, birthday: all.birthday };
    const { data: authData, error: updateError } = await supabase.auth.updateUser({ password: all.password });
    if (updateError) {
      setError(updateError.message);
      toast.error(updateError.message);
      return;
    }
    if (authData.user) await updateProfileWithName(authData.user.id, profileData);
    toast.success("Account created successfully");
    hideOtpModal();
    router.push("/dashboard");
    router.refresh();
  };

  const [showOtpModal, hideOtpModal] = useModal(
    () => (
      <OtpModal
        hideModal={hideOtpModal}
        form={form}
        email={email}
        error={error}
        verifyOtpAndComplete={verifyOtpAndComplete}
      />
    ),
    [form, email, error]
  );

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    const ok = await form.trigger(["firstName", "lastName", "email", "password", "confirmPassword"]);
    if (!ok) return;

    const all = getValues();
    setOtpSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: all.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    setOtpSending(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Verification code sent to your email");
    setValue("otp", "");
    showOtpModal();
  };

  const handleSignupSkipOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    const ok = await form.trigger(["firstName", "lastName", "email", "password", "confirmPassword"]);
    if (!ok) return;

    const all = getValues();
    const profileData = { firstName: all.firstName, lastName: all.lastName, birthday: all.birthday };

    const { data: authData, error } = await supabase.auth.signUp({
      email: all.email,
      password: all.password,
      options: {
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      toast.error(error.message);
      return;
    }
    if (authData.session && authData.user) {
      toast.success("Account created successfully");
      await updateProfileWithName(authData.user.id, profileData);
      router.push("/dashboard");
      router.refresh();
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "propedge_pending_profile",
          JSON.stringify({
            email: all.email,
            first_name: all.firstName,
            last_name: all.lastName,
            birthday: all.birthday,
          })
        );
      }
      router.push("/login?message=confirm_email");
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
          <p className="mt-1 text-sm text-zinc-500">Create your account</p>
        </div>

        <motion.form
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-400">First name</label>
              <input
                type="text"
                {...form.register("firstName", { required: "First name is required" })}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              />
              {form.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400">Last name</label>
              <input
                type="text"
                {...form.register("lastName")}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
              />
              {form.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </motion.div>
          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
            <label className="block text-sm font-medium text-zinc-400">
              Birthday <span className="text-zinc-600">(optional)</span>
            </label>
            <Controller
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <BirthdayCalendar
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className="mt-1"
                />
              )}
            />
          </motion.div>
          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
            <label className="block text-sm font-medium text-zinc-400">Email</label>
            <input
              type="email"
              {...form.register("email")}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.email.message}</p>
            )}
          </motion.div>
          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }} className="relative">
            <label className="block text-sm font-medium text-zinc-400">Password</label>
            <div className="relative mt-1 flex">
            <input
              type="password"
              {...form.register("password", {
                onBlur: () => {
                  setPasswordFocused(false);
                  if (form.formState.dirtyFields.password) {
                    form.trigger(["password", "confirmPassword"]);
                  }
                },
              })}
              onFocus={() => setPasswordFocused(true)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
              <AnimatePresence>
                {passwordFocused && (
                  <motion.ul
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-full top-0 z-50 ml-3 min-w-[11rem] space-y-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 shadow-xl max-sm:left-0 max-sm:top-full max-sm:mt-2 max-sm:ml-0"
                  >
                  {passwordRequirements.map((req, i) => {
                    const met = req.check(password);
                    return (
                      <motion.li
                        key={req.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.18 }}
                        className="flex items-center gap-2 text-xs text-zinc-500"
                      >
                        <span className="relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                          <AnimatePresence mode="wait">
                            {met ? (
                              <motion.span
                                key="met"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute inset-0 inline-flex items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 text-white"
                              >
                                <motion.svg
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.05, duration: 0.12 }}
                                  className="h-2 w-2"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M2 6l3 3 5-6" />
                                </motion.svg>
                              </motion.span>
                            ) : (
                              <motion.span
                                key="unmet"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute inset-0 rounded-full border border-zinc-600 bg-transparent"
                              />
                            )}
                          </AnimatePresence>
                        </span>
                        {req.label}
                      </motion.li>
                    );
                  })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.password.message}</p>
            )}
          </motion.div>
          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }}>
            <label className="block text-sm font-medium text-zinc-400">Confirm password</label>
            <input
              type="password"
              {...form.register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === form.watch("password") || "Passwords do not match",
              })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.confirmPassword.message}</p>
            )}
          </motion.div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <motion.div layout transition={{ layout: { duration: 0.2, ease: "easeOut" } }} className="flex flex-col gap-2">
            <button
              type="button"
              disabled={form.formState.isSubmitting || otpSending}
              onClick={handleSignup}
              className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 mt-4"
            >
              {form.formState.isSubmitting ? "Setting up..." : otpSending ? "Sending..." : "Signup"}
            </button>
            <button
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={handleSignupSkipOtp}
              className="w-full text-sm text-zinc-500 hover:text-zinc-300"
            >
              Skip OTP verification (use email link instead)
            </button>
          </motion.div>
        </motion.form>

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
