import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-100">Terms of Service</h1>
        <p className="mt-4 text-zinc-500">
          Placeholder. Add your Terms of Service content here.
        </p>
        <Link href="/" className="mt-6 inline-block text-emerald-400 hover:underline">
          ← Back
        </Link>
      </div>
    </div>
  );
}
