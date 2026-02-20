import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-100">Privacy Policy</h1>
        <p className="mt-4 text-zinc-500">
          Placeholder. Add your Privacy Policy content here.
        </p>
        <Link href="/" className="mt-6 inline-block text-emerald-400 hover:underline">
          ← Back
        </Link>
      </div>
    </div>
  );
}
