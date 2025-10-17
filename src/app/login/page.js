"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { login } from "../../api/auth";

const fieldStyles =
  "w-full rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await login({ email: username.trim(), password: password.trim() });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.access_token);
      }
      router.push("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to sign in right now. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050814] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute right-[-5rem] top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-900/60 bg-slate-950/70 p-8 shadow-2xl shadow-blue-900/20 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/70">Welcome back</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Sign in to FinScope</h1>
          <p className="mt-2 text-sm text-slate-400">Your personalised finance hub awaits.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={fieldStyles}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldStyles}
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Need credentials? Use the demo above.</span>
            <Link href="#" className="text-blue-300 transition hover:text-blue-200">
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="rounded-xl bg-rose-500/10 px-4 py-2 text-xs text-rose-400 border border-rose-500/40">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-8 rounded-2xl border border-slate-900/50 bg-slate-950/50 p-4 text-center text-sm text-slate-300">
          <p>New to FinScope?</p>
          <Link
            href="/register"
            className="mt-2 inline-flex items-center justify-center rounded-xl border border-blue-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200 transition hover:bg-blue-500/10"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
