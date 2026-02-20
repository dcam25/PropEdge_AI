"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "react-modal-hook";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedModal } from "@/components/animated-modal";
import { DialogClose } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BirthdayCalendar } from "@/components/ui/birthday-calendar";
import { PASSWORD_REQUIREMENTS, passwordChangeSchema } from "@/lib/validations/signup";
import { profileSchema, profileSaveSchema } from "@/lib/validations/profile";
import { PREMIUM_PRICE, PREMIUM_PERIOD } from "@/lib/prices";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SpinInput } from "@/components/ui/spin-input";
import { toast } from "sonner";

type ProfileTab = "profile" | "password" | "plan" | "balance";

const SIDEBAR_LINKS: { id: ProfileTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Password" },
  { id: "plan", label: "Plan" },
  { id: "balance", label: "Balance & Transactions" },
];

function DeleteAccountModal({
  hideModal,
  router,
}: {
  hideModal: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        hideModal();
        router.push("/");
        router.refresh();
      } else {
        toast.error(data.error ?? "Failed to delete account");
      }
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <AnimatedModal
      hideModal={hideModal}
      title="Delete account"
      description="This will permanently delete your account and all data. This cannot be undone. Type &quot;DELETE&quot; below to confirm."
    >
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
            onClick={handleDelete}
          >
            {deleteLoading ? "Deleting..." : "Delete account"}
          </Button>
        </div>
      </div>
    </AnimatedModal>
  );
}

function PurchaseModal({
  hideModal,
  showChargeModal,
  balance,
  subscribeLoading,
  setSubscribeLoading,
  refreshProfile,
  fetchInvoicesAndBalance,
}: {
  hideModal: () => void;
  showChargeModal: () => void;
  balance: number | null;
  subscribeLoading: boolean;
  setSubscribeLoading: (v: boolean) => void;
  refreshProfile: () => Promise<void>;
  fetchInvoicesAndBalance: () => void;
}) {
  return (
    <AnimatedModal
      hideModal={hideModal}
      title="Upgrade to Premium"
      description="Confirm this invoice to upgrade your account."
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">1 × PropEdge Premium</span>
            <span className="font-medium text-zinc-100">$19.99</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-zinc-800 pt-2 text-sm">
            <span className="text-zinc-400">Total</span>
            <span className="font-semibold text-zinc-100">$19.99 USD</span>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          Your balance:{" "}
          <span className="font-medium text-zinc-100">
            {(balance ?? 0) === 0
              ? "$0.00"
              : (balance ?? 0) < 0
                ? `$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`
                : `-$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`}{" "}
            USD
          </span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {(balance ?? 0) <= -1999 ? (
            <Button
              disabled={subscribeLoading}
              onClick={async () => {
                setSubscribeLoading(true);
                try {
                  const res = await fetch("/api/premium/purchase-with-balance", { method: "POST" });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    hideModal();
                    toast.success("Upgraded to Premium");
                    await refreshProfile();
                    fetchInvoicesAndBalance();
                  } else {
                    toast.error(data.error ?? "Failed to upgrade");
                  }
                } catch {
                  toast.error("Failed to upgrade");
                } finally {
                  setSubscribeLoading(false);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {subscribeLoading ? "Upgrading..." : "Confirm & upgrade"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  hideModal();
                  showChargeModal();
                }}
              >
                Add balance
              </Button>
              <Button
                disabled={subscribeLoading}
                onClick={async () => {
                  setSubscribeLoading(true);
                  try {
                    const res = await fetch("/api/stripe/checkout", { method: "POST" });
                    const data = await res.json();
                    if (data.url) {
                      hideModal();
                      window.location.href = data.url;
                    } else {
                      toast.error(data.error ?? "Failed to start checkout");
                    }
                  } catch {
                    toast.error("Failed to start checkout");
                  } finally {
                    setSubscribeLoading(false);
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {subscribeLoading ? "Redirecting..." : "Pay with card"}
              </Button>
            </>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, isUpdatingProfile, updateProfile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [saved, setSaved] = useState(false);
  const [transactions, setTransactions] = useState<
    { id: string; date: string; dateTime: string; amount: number; currency: string; type: "credit" | "debit"; description: string }[]
  >([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("10");
  const [addBalanceLoading, setAddBalanceLoading] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const fetchInvoicesAndBalance = useCallback(() => {
    if (!user) return;
    setInvoicesLoading(true);
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions ?? []);
        setBalance(data.balance ?? null);
        setSubscriptionEnd(data.subscription?.currentPeriodEnd ?? null);
      })
      .catch(() => {
        // Keep existing transactions on fetch error
      })
      .finally(() => setInvoicesLoading(false));
  }, [user]);

  const [showDeleteModal, hideDeleteModal] = useModal(
    () => <DeleteAccountModal hideModal={hideDeleteModal} router={router} />,
    [router]
  );

  const [showChargeModal, hideChargeModal] = useModal(
    () => (
      <AnimatedModal
        hideModal={hideChargeModal}
        title="Add balance"
        description="Add credit to your account. Minimum $10. Credit is applied to future purchases."
      >
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
              onClick={async () => {
                const amount = parseFloat(chargeAmount);
                if (Number.isNaN(amount) || amount < 10) return;
                setAddBalanceLoading(true);
                try {
                  const res = await fetch("/api/stripe/charge-balance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                  });
                  const data = await res.json();
                  if (data.url) {
                    hideChargeModal();
                    window.location.href = data.url;
                  } else {
                    toast.error(data.error ?? "Failed to start charge");
                  }
                } catch {
                  toast.error("Failed to start charge");
                } finally {
                  setAddBalanceLoading(false);
                }
              }}
            >
              {addBalanceLoading ? "Opening..." : "Charge"}
            </Button>
          </div>
        </div>
      </AnimatedModal>
    ),
    [chargeAmount, addBalanceLoading]
  );

  const [showPurchaseModal, hidePurchaseModal] = useModal(
    () => (
      <PurchaseModal
        hideModal={hidePurchaseModal}
        showChargeModal={showChargeModal}
        balance={balance}
        subscribeLoading={subscribeLoading}
        setSubscribeLoading={setSubscribeLoading}
        refreshProfile={refreshProfile}
        fetchInvoicesAndBalance={fetchInvoicesAndBalance}
      />
    ),
    [balance, subscribeLoading, refreshProfile, fetchInvoicesAndBalance]
  );

  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSaveSchema),
    defaultValues: { firstName: "", lastName: "", birthday: "" },
  });

  const emailForm = useForm({
    resolver: zodResolver(profileSchema.pick({ email: true })),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const watchedPassword = passwordForm.watch("password");
  const watchedConfirmPassword = passwordForm.watch("confirmPassword");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "balance") setActiveTab("balance");
    else if (tab === "plan") setActiveTab("plan");
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        birthday: profile.birthday ?? "",
      });
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      emailForm.reset({ email: user.email ?? "" });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSave = profileForm.handleSubmit(async (data) => {
    await updateProfile({
      first_name: data.firstName.trim() || null,
      last_name: data.lastName.trim() || null,
      birthday: data.birthday?.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  });

  const handleEmailUpdate = emailForm.handleSubmit(async (data) => {
    if (!user) return;
    if (data.email === user.email) return;
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: data.email });
    if (error) {
      emailForm.setError("email", { message: error.message });
    } else {
      toast.success("Check your email to confirm the new address.");
    }
  });

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
      else toast.error(data.error ?? "Failed to open payment");
    } catch {
      toast.error("Failed to open payment");
    } finally {
      setChargeLoading(false);
    }
  };

  const handlePasswordUpdate = passwordForm.handleSubmit(async (data) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      toast.error(error.message);
    } else {
      passwordForm.reset();
      setPasswordSaved(true);
      toast.success("Password updated");
      setTimeout(() => setPasswordSaved(false), 2000);
    }
  });

  const handleDeleteClick = () => {
    showDeleteModal();
  };

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
    router.replace("/");
    return null;
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
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${activeTab === link.id
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
                          {...emailForm.register("email")}
                          className={cn(
                            "flex-1 rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                            emailForm.formState.errors.email ? "border-red-500/50" : "border-zinc-700"
                          )}
                        />
                        <Button variant="outline" size="sm" onClick={handleEmailUpdate} disabled={!emailForm.formState.isDirty}>
                          Update
                        </Button>
                      </div>
                      {emailForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-400">{emailForm.formState.errors.email.message}</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">You may need to confirm the new email.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-zinc-400">First name</label>
                        <input
                          {...profileForm.register("firstName")}
                          className={cn(
                            "mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                            profileForm.formState.errors.firstName ? "border-red-500/50" : "border-zinc-700"
                          )}
                          placeholder="First name"
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="mt-1 text-sm text-red-400">{profileForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-zinc-400">Last name</label>
                        <input
                          {...profileForm.register("lastName")}
                          className={cn(
                            "mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100",
                            profileForm.formState.errors.lastName ? "border-red-500/50" : "border-zinc-700"
                          )}
                          placeholder="Last name"
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="mt-1 text-sm text-red-400">{profileForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400">Birthday</label>
                      <div className="mt-1">
                        <Controller
                          control={profileForm.control}
                          name="birthday"
                          render={({ field }) => (
                            <BirthdayCalendar
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button disabled={!profileForm.formState.isDirty || isUpdatingProfile} onClick={handleSave}>
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
                      <div className="relative mt-1 flex">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                          {...passwordForm.register("password", {
                            onBlur: () => {
                              setPasswordFocused(false);
                              if (passwordForm.formState.dirtyFields.password) {
                                passwordForm.trigger(["password", "confirmPassword"]);
                              }
                            },
                          })}
                            onFocus={() => setPasswordFocused(true)}
                            className={cn(
                              "w-full rounded-lg border bg-zinc-900 px-3 py-2 pr-10 text-zinc-100",
                              watchedPassword && passwordForm.formState.errors.password
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
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute left-full top-0 z-50 ml-3 min-w-[11rem] space-y-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 shadow-xl max-sm:left-0 max-sm:top-full max-sm:mt-2 max-sm:ml-0"
                            >
                            {PASSWORD_REQUIREMENTS.map((req, i) => {
                              const met = req.check(watchedPassword || "");
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
                      {watchedPassword && passwordForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-400">
                          {passwordForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400">Confirm password</label>
                      <div className="relative mt-1">
                        <input
                          type={showPasswordConfirm ? "text" : "password"}
                          {...passwordForm.register("confirmPassword")}
                          className={cn(
                            "w-full rounded-lg border bg-zinc-900 px-3 py-2 pr-10 text-zinc-100",
                            watchedConfirmPassword && passwordForm.formState.errors.confirmPassword
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
                      {watchedConfirmPassword && passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handlePasswordUpdate}
                      disabled={!passwordForm.formState.isValid}
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
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${profile?.is_premium
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
                        {invoicesLoading ? (
                          <p className="text-sm text-zinc-500">Loading subscription details...</p>
                        ) : (
                          <>
                            <p className="text-sm text-zinc-400">
                              Billed{" "}
                              <span className="font-medium text-zinc-100">
                                {(profile.subscription_amount_cents ?? 0) > 0
                                  ? `$${(profile.subscription_amount_cents! / 100).toFixed(2)}`
                                  : PREMIUM_PRICE}
                                /month
                              </span>
                            </p>
                            {subscriptionEnd ? (
                              <p className="text-sm text-zinc-400">
                                Expires{" "}
                                <span className="font-medium text-zinc-100">
                                  {new Date(subscriptionEnd).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </p>
                            ) : (
                              <p className="text-sm text-zinc-500">Subscription active</p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {!profile?.is_premium && (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => showPurchaseModal()}
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
                    <CardTitle>Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Account balance
                          </p>
                          {invoicesLoading ? (
                            <p className="mt-1 text-2xl font-semibold text-zinc-500 animate-pulse">
                              Loading...
                            </p>
                          ) : (
                            <p
                              className={`mt-1 text-2xl font-semibold ${(balance ?? 0) <= 0 ? "text-zinc-100" : "text-red-400"
                                }`}
                            >
                              {(balance ?? 0) === 0
                                ? "$0.00"
                                : (balance ?? 0) < 0
                                  ? `$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`
                                  : `-$${(Math.abs(balance ?? 0) / 100).toFixed(2)}`}{" "}
                              USD
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {invoicesLoading
                              ? "\u00A0"
                              : (balance ?? 0) < 0
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
                            onClick={() => showChargeModal()}
                            disabled={addBalanceLoading || invoicesLoading}
                          >
                            {addBalanceLoading ? "Opening..." : "Charge"}
                          </Button>
                          {!invoicesLoading && (balance ?? 0) > 0 && (
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
                  </CardContent>
                  <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {invoicesLoading ? (
                      <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-[1fr_10rem_8rem] gap-4 border-b border-zinc-800 bg-zinc-900/50 px-3 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 min-h-[2.25rem]">
                          <span>Description</span>
                          <span className="text-right">Date & time</span>
                          <span className="text-right">Amount</span>
                        </div>
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-zinc-500 animate-pulse">Loading...</p>
                        </div>
                      </div>
                    ) : transactions.length === 0 ? (
                      <p className="text-sm text-zinc-500">No transactions yet.</p>
                    ) : (
                      <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-[1fr_10rem_8rem] gap-4 border-b border-zinc-800 bg-zinc-900/50 px-3 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 min-h-[2.25rem]">
                          <span>Description</span>
                          <span className="text-right">Date & time</span>
                          <span className="text-right">Amount</span>
                        </div>
                        <ul className="divide-y divide-zinc-800">
                          {transactions.map((tx) => (
                            <li
                              key={tx.id}
                              className="grid grid-cols-[1fr_10rem_8rem] gap-4 px-3 py-3 text-sm items-center"
                            >
                              <span className="text-zinc-100">{tx.description}</span>
                              <span className="text-zinc-500 text-right tabular-nums">
                                {tx.dateTime
                                  ? new Date(tx.dateTime).toLocaleString(undefined, {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })
                                  : tx.date}
                              </span>
                              <span
                                className={`font-medium text-right tabular-nums ${
                                  tx.type === "credit" ? "text-emerald-400" : "text-zinc-100"
                                }`}
                              >
                                {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)} {tx.currency}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}

function ProfileFallback() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-zinc-500">Loading profile...</div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
