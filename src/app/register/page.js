"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { register } from "../../api/auth";

const fieldStyles =
  "w-full rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill in all fields to continue.");
      return;
    }

    setError("");

    try {
      const response = await register({
        fullName: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
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
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050814] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-[-4rem] bottom-10 h-72 w-72 rounded-full bg-blue-500/25 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-900/60 bg-slate-950/70 p-8 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-purple-200/70">Create account</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Join the FinScope community</h1>
          <p className="mt-2 text-sm text-slate-400">A modern financial hub designed just for you.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldStyles}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Create a strong password"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:brightness-110"
          >
            Create account
          </button>
        </form>
        <div className="mt-8 rounded-2xl border border-slate-900/50 bg-slate-950/50 p-4 text-center text-sm text-slate-300">
          <p>Already have an account?</p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center rounded-xl border border-blue-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200 transition hover:bg-blue-500/10"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
