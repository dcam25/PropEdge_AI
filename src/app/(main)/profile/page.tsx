"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BirthdayCalendar } from "@/components/ui/birthday-calendar";
import { passwordSchema } from "@/lib/validations/signup";
import { profileSchema, profileSaveSchema } from "@/lib/validations/profile";
import { PREMIUM_PRICE, PREMIUM_PERIOD } from "@/lib/prices";
import type { InvoiceItem } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SpinInput } from "@/components/ui/spin-input";

type ProfileTab = "profile" | "password" | "plan" | "balance";

const SIDEBAR_LINKS: { id: ProfileTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Password" },
  { id: "plan", label: "Plan" },
  { id: "balance", label: "Balance & Invoices" },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, isUpdatingProfile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [saved, setSaved] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("10");
  const [addBalanceLoading, setAddBalanceLoading] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [profileErrors, setProfileErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [emailError, setEmailError] = useState<string | null>(null);

  const passwordRequirements = [
    { label: "8+ characters", check: (p: string) => p.length >= 8 },
    { label: "1+ special character", check: (p: string) => (p.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 1 },
    { label: "2+ uppercase letters", check: (p: string) => (p.match(/[A-Z]/g) || []).length >= 2 },
    { label: "2+ lowercase letters", check: (p: string) => (p.match(/[a-z]/g) || []).length >= 2 },
    { label: "2+ numbers", check: (p: string) => (p.match(/\d/g) || []).length >= 2 },
  ];

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "balance") setActiveTab("balance");
    else if (tab === "plan") setActiveTab("plan");
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setBirthday(profile.birthday ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
    }
  }, [user]);

  const fetchInvoicesAndBalance = () => {
    if (!user) return;
    setInvoicesLoading(true);
    Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/stripe/subscription").then((r) => r.json()),
    ])
      .then(([invData, subData]) => {
        setInvoices(invData.invoices ?? []);
        setBalance(invData.balance ?? null);
        setSubscriptionEnd(subData.subscription?.currentPeriodEnd ?? null);
      })
      .catch(() => {
        setInvoices([]);
      })
      .finally(() => setInvoicesLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchInvoicesAndBalance();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const success = searchParams.get("success");
    if (success === "1") {
      router.replace("/profile?tab=balance", { scroll: false });
      const t = setTimeout(() => fetchInvoicesAndBalance(), 2500);
      return () => clearTimeout(t);
    }
  }, [user, searchParams, router]);

  const handleSave = async () => {
    const result = profileSaveSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthday: birthday.trim() || undefined,
    });
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors;
      setProfileErrors({
        firstName: issues.firstName?.[0],
        lastName: issues.lastName?.[0],
      });
      return;
    }
    setProfileErrors({});
    await updateProfile({
      first_name: result.data.firstName || null,
      last_name: result.data.lastName || null,
      birthday: birthday.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEmailUpdate = async () => {
    const result = profileSchema.shape.email.safeParse(email.trim());
    if (!result.success) {
      setEmailError(result.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setEmailError(null);
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: result.data });
    if (error) {
      setEmailError(error.message);
    } else {
      alert("Check your email to confirm the new address.");
    }
  };

  const handlePayBalance = async () => {
    setChargeLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ return_url: "/profile" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Failed to open payment");
    } catch {
      alert("Failed to open payment");
    } finally {
      setChargeLoading(false);
    }
  };

  const handlePurchasePremium = async () => {
    setSubscribeLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        setPurchaseDialogOpen(false);
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start checkout");
      }
    } catch {
      alert("Failed to start checkout");
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(chargeAmount);
    if (Number.isNaN(amount) || amount < 10) {
      alert("Minimum charge is $10");
      return;
    }
    setAddBalanceLoading(true);
    try {
      const res = await fetch("/api/stripe/charge-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        setChargeDialogOpen(false);
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start charge");
      }
    } catch {
      alert("Failed to start charge");
    } finally {
      setAddBalanceLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password || !passwordConfirm) {
      alert("Please fill in both password fields.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("Passwords do not match.");
      return;
    }
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      alert(result.error.issues[0]?.message ?? "Password does not meet requirements.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert(error.message);
    } else {
      setPassword("");
      setPasswordConfirm("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDeleteDialogOpen(false);
        router.push("/");
        router.refresh();
      } else {
        alert(data.error ?? "Failed to delete account");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasChanges =
    (profile?.first_name ?? "") !== firstName.trim() ||
    (profile?.last_name ?? "") !== lastName.trim() ||
    (profile?.birthday ?? "") !== birthday.trim();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Sign in to view your profile</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex gap-8"
      >
        <aside className="w-56 shrink-0 self-start border-r border-zinc-800 pr-8">
          <nav className="sticky top-24 space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  activeTab === link.id
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400">Email</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      className={cn(
                        "flex-1 rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                        emailError ? "border-red-500/50" : "border-zinc-700"
                      )}
                    />
                    <Button variant="outline" size="sm" onClick={handleEmailUpdate}>
                      Update
                    </Button>
                  </div>
                  {emailError && <p className="mt-1 text-sm text-red-400">{emailError}</p>}
                  <p className="mt-1 text-xs text-zinc-500">You may need to confirm the new email.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-zinc-400">First name</label>
                    <input
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (profileErrors.firstName) setProfileErrors((p) => ({ ...p, firstName: undefined }));
                      }}
                      className={cn(
                        "mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                        profileErrors.firstName ? "border-red-500/50" : "border-zinc-700"
                      )}
                      placeholder="First name"
                    />
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{profileErrors.firstName}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-zinc-400">Last name</label>
                    <input
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (profileErrors.lastName) setProfileErrors((p: { firstName?: string; lastName?: string }) => ({ ...p, lastName: undefined }));
                      }}
                      className={cn(
                        "mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                        profileErrors.lastName ? "border-red-500/50" : "border-zinc-700"
                      )}
                      placeholder="Last name"
                    />
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{profileErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Birthday</label>
                  <div className="mt-1">
                    <BirthdayCalendar
                      value={birthday}
                      onChange={setBirthday}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button disabled={!hasChanges || isUpdatingProfile} onClick={handleSave}>
                    {isUpdatingProfile ? "Saving..." : saved ? "Saved" : "Save changes"}
                  </Button>
                  {saved && <span className="text-sm text-emerald-400">Profile updated.</span>}
                </div>

                <div className="mt-8 rounded-lg border border-red-900/60 bg-red-950/30 p-4">
                  <h4 className="mb-2 font-medium text-red-400/90">Danger zone</h4>
                  <p className="mb-3 text-sm text-zinc-500">
                    Permanently delete your account and all data. This cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-900/50 text-red-400/90 hover:bg-red-950/50"
                    onClick={handleDeleteClick}
                  >
                    Delete account
                  </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400">New password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className={cn(
                        "w-full rounded-lg border bg-zinc-900 px-3 py-2 pr-10 text-zinc-100",
                        password &&
                          !passwordSchema.safeParse(password).success
                          ? "border-red-500/50"
                          : "border-zinc-700"
                      )}
                      placeholder="Input new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <AnimatePresence>
                    {passwordFocused && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mt-2 space-y-1.5"
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
                  {password &&
                    !passwordSchema.safeParse(password).success && (
                      <p className="mt-1 text-sm text-red-400">
                        {passwordSchema.safeParse(password).error?.issues[0]?.message ??
                          "Password does not meet strength requirements"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm text-zinc-400">Confirm password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className={cn(
                        "w-full rounded-lg border bg-zinc-900 px-3 py-2 pr-10 text-zinc-100",
                        passwordConfirm && password !== passwordConfirm
                          ? "border-red-500/50"
                          : "border-zinc-700"
                      )}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
                  )}
                </div>
                <Button
                  onClick={handlePasswordUpdate}
                  disabled={!password || !passwordConfirm || !passwordSchema.safeParse(password).success}
                >
                  {passwordSaved ? "Saved" : "Update password"}
                </Button>
              </CardContent>
            </Card>
              </motion.div>
            )}

            {activeTab === "plan" && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card
                  className={
                    profile?.is_premium
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : ""
                  }
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Plan</CardTitle>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          profile?.is_premium
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700"
                        }`}
                      >
                        {profile?.is_premium ? "Premium" : "Free"}
                      </span>
                      {profile?.is_premium && (
                        <span className="text-xs text-zinc-500">Active</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {profile?.is_premium
                        ? "You have access to all features including unlimited AI insights, up to 10 custom models, and full backtesting."
                        : "Upgrade for more models and unlimited AI insights."}
                    </p>

                    {profile?.is_premium && (
                      <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        {(profile.subscription_amount_cents ?? 0) > 0 && (
                          <p className="text-sm text-zinc-400">
                            Billed{" "}
                            <span className="font-medium text-zinc-100">
                              ${(profile.subscription_amount_cents! / 100).toFixed(2)}/month
                            </span>
                          </p>
                        )}
                        {subscriptionEnd && (
                          <p className="text-sm text-zinc-400">
                            Renews on{" "}
                            <span className="font-medium text-zinc-100">
                              {subscriptionEnd}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {!profile?.is_premium && (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => setPurchaseDialogOpen(true)}
                      >
                        Purchase premium
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "balance" && (
              <motion.div
                key="balance"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Card>
              <CardHeader>
                <CardTitle>Balance & Invoices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoicesLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                    <p className="text-sm text-zinc-500">Loading balance & invoices...</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Account balance
                          </p>
                          <p
                            className={`mt-1 text-2xl font-semibold ${
                              (balance ?? 0) <= 0 ? "text-zinc-100" : "text-red-400"
                            }`}
                          >
                            {(balance ?? 0) === 0
                              ? "$0.00"
                              : (balance ?? 0) < 0
                                ? `+$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`
                                : `-$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`}{" "}
                            USD
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {(balance ?? 0) < 0
                              ? "Credit applied to future invoices"
                              : (balance ?? 0) > 0
                                ? "Balance owed"
                                : "No balance"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => fetchInvoicesAndBalance()}
                            disabled={invoicesLoading}
                          >
                            {invoicesLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Refresh"
                            )}
                          </Button>
                          <Button
                            onClick={() => setChargeDialogOpen(true)}
                            disabled={addBalanceLoading}
                          >
                            {addBalanceLoading ? "Opening..." : "Charge"}
                          </Button>
                          {(balance ?? 0) > 0 && (
                            <Button
                              variant="outline"
                              onClick={handlePayBalance}
                              disabled={chargeLoading}
                            >
                              {chargeLoading ? "Opening..." : "Pay balance"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-zinc-400">Invoices</p>
                      {invoices.length === 0 ? (
                        <p className="text-sm text-zinc-500">No charges yet.</p>
                      ) : (
                        <div className="rounded-lg border border-zinc-800 overflow-hidden">
                            <div className="grid grid-cols-[1fr_10rem_8rem] gap-4 border-b border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <span>Description</span>
                            <span className="text-right">Date & time</span>
                            <span className="text-right">Amount</span>
                          </div>
                          <ul className="divide-y divide-zinc-800">
                            {invoices.map((inv) => (
                              <li
                                key={inv.id}
                                className="grid grid-cols-[1fr_10rem_8rem] gap-4 px-3 py-3 text-sm items-center"
                              >
                                <span className="text-zinc-100">{inv.description}</span>
                                <span className="text-zinc-500 text-right tabular-nums">
                                  {inv.dateTime
                                    ? new Date(inv.dateTime).toLocaleString(undefined, {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      })
                                    : inv.date}
                                </span>
                                <span className="font-medium text-zinc-100 text-right tabular-nums">
                                  ${inv.amount.toFixed(2)} {inv.currency}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all data. This cannot be undone.
              Type &quot;DELETE&quot; below to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                disabled={deleteConfirm !== "DELETE" || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Balance change</DialogTitle>
            <DialogDescription>
              Purchasing Premium will charge $19.99/month. Your current balance is{" "}
              <span className="font-medium text-zinc-100">
                {(balance ?? 0) === 0
                  ? "$0.00"
                  : (balance ?? 0) < 0
                    ? `+$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`
                    : `-$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`}{" "}
                USD
              </span>
              . Any positive balance will be applied to future invoices. You will be redirected to complete payment.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={subscribeLoading}
              onClick={handlePurchasePremium}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {subscribeLoading ? "Redirecting..." : "Continue to payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={chargeDialogOpen} onOpenChange={setChargeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add balance</DialogTitle>
            <DialogDescription>
              Add credit to your account. Minimum $10. Credit is applied to future invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400">Amount (USD)</label>
              <SpinInput
                value={chargeAmount}
                onChange={setChargeAmount}
                min={10}
                step={1}
                placeholder="10"
                variant="pagination"
                suffix="USD"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-zinc-500">Minimum $10</p>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                disabled={addBalanceLoading || parseFloat(chargeAmount) < 10}
                onClick={handleAddBalance}
              >
                {addBalanceLoading ? "Opening..." : "Charge"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
