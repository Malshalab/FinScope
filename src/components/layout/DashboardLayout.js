"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Transactions",
    href: "/expenseTracking",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h3.5a1 1 0 011 1v3.5a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 12.5A1.5 1.5 0 014.5 15h3a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 017.5 21h-3A1.5 1.5 0 013 19.5v-3zM12.5 3H19a1 1 0 011 1v6.5a1 1 0 01-1 1h-6.5a1 1 0 01-1-1V4a1 1 0 011-1zM13 15h7m-7 4h5" />
      </svg>
    ),
  },
  {
    name: "Investments",
    href: "/investments",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 19h18M5 16l2.5-4.5 3 5 4-7 4.5 8.5" />
      </svg>
    ),
  },
  {
    name: "Assets",
    href: "/assets",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16M7 7V4m10 3V4M7 20v-3m10 3v-3" />
      </svg>
    ),
  },
  {
    name: "Planning",
    href: "/monthlyIncome",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8m4 9a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
  },
  {
    name: "Profile",
    href: "/profile",
    icon: () => (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const NavList = ({ onNavigate }) => (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const content = (
          <div
            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active
                ? "bg-gradient-to-r from-blue-600/30 to-purple-500/20 text-white shadow-inner shadow-blue-500/20"
                : "text-slate-400 hover:bg-slate-900/70"
            }`}
          >
            <span
              className={`rounded-lg border border-slate-900/40 p-2 text-slate-300 transition group-hover:text-white ${
                active ? "bg-blue-500/20 text-blue-100" : "bg-slate-900/70"
              }`}
            >
              <item.icon />
            </span>
            <span>{item.name}</span>
          </div>
        );

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => onNavigate?.()}
            className="block"
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-900/40 bg-slate-950/70 px-5 py-6 backdrop-blur-xl lg:flex">
          <div>
            <Link href="/dashboard" className="flex items-center gap-3 text-slate-100">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold">
                FS
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">FinScope</p>
                <p className="text-lg font-semibold text-white">Financial Hub</p>
              </div>
            </Link>
            <NavList />
          </div>

          <div className="mt-auto space-y-6 text-xs text-slate-400">
            <div className="rounded-2xl border border-slate-900/50 bg-slate-950/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.4em] text-blue-200/70">Need support?</p>
              <p className="mt-2 text-sm text-slate-200">We are here to help you stay on track.</p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-100 transition hover:brightness-110"
              >
                Contact us
              </Link>
            </div>
            <p>© {new Date().getFullYear()} FinScope</p>
          </div>
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 translate-x-[-100%] transform bg-slate-950/95 px-6 py-8 backdrop-blur-xl transition-transform duration-300 ease-out sm:w-80 lg:hidden ${
            mobileNavOpen ? "translate-x-0" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 text-slate-100">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-semibold">
                FS
              </span>
              <div>
                <p className="text-sm uppercase tracking-widest text-slate-400">FinScope</p>
                <p className="text-lg font-semibold">Financial Hub</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="rounded-full border border-slate-800 bg-slate-900/70 p-2 text-slate-300 transition hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <NavList onNavigate={() => setMobileNavOpen(false)} />
        </aside>

        <main className="flex-1 lg:ml-[18rem]">
          <div className="sticky top-0 z-30 border-b border-slate-900/40 bg-slate-950/85 px-4 py-4 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                className="rounded-xl border border-slate-900/60 bg-slate-950/70 p-2 text-slate-300 transition hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="text-sm font-semibold tracking-[0.35em] text-slate-400">
                FINSCOPE
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-slate-900/60 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-blue-500/40 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow transition hover:brightness-110"
                >
                  Join
                </Link>
              </div>
            </div>
          </div>

          <div className="px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-10">{children}</div>
          </div>

          <footer className="border-t border-slate-900/40 px-6 py-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} FinScope. Crafted to help you feel confident about every decision.
          </footer>
        </main>
      </div>
    </div>
  );
}
