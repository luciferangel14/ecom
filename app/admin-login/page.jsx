"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Incorrect username or password.");
      return;
    }

    router.push("/billing");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-offwhite px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-4xl bg-white p-8 shadow-neu-lg"
      >
        <h1 className="font-serif text-2xl text-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-ink/50">Drify billing access only.</p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-ink/50">
          Username
        </label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
          placeholder="you@drify.com"
        />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-ink/50">
          Password
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
          placeholder="••••••••"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold uppercase tracking-wide text-offwhite transition-opacity disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
