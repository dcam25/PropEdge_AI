"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";

export default function ProfilePage() {
  const { user, profile, loading, isUpdatingProfile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setBirthday(profile.birthday ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      birthday: birthday.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges =
    (profile?.first_name ?? "") !== firstName.trim() ||
    (profile?.last_name ?? "") !== lastName.trim() ||
    (profile?.birthday ?? "") !== birthday.trim();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
        <p className="text-zinc-500">Sign in to view your profile</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-bold text-emerald-400">
            PropEdge AI
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100">
              Dashboard
            </Link>
            <Link href="/models" className="text-sm text-zinc-400 hover:text-zinc-100">
              My Models
            </Link>
            <Link href="/profile" className="text-sm text-emerald-400">
              Profile
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-zinc-100">
              Pricing
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="mb-8 text-2xl font-bold text-zinc-100">Profile</h1>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400">Email</label>
                <p className="mt-1 text-zinc-100">{user.email}</p>
                <p className="mt-1 text-xs text-zinc-500">Email is managed by your sign-in provider.</p>
              </div>

              <div>
                <label className="block text-sm text-zinc-400">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400">Birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving..." : saved ? "Saved" : "Save changes"}
                </Button>
                {saved && (
                  <span className="text-sm text-emerald-400">Profile updated.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-100">
                    {profile?.is_premium ? "Premium" : "Free"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {profile?.is_premium
                      ? "You have access to all features."
                      : "Upgrade for more models and unlimited AI insights."}
                  </p>
                </div>
                {!profile?.is_premium && (
                  <Link href="/pricing">
                    <Button size="sm">Upgrade</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
