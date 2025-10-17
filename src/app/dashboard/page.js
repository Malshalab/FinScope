"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/layout/DashboardLayout";
import MoneyLineChart from "../../components/layout/MoneyLineChart";
import Chatbot from "../../components/layout/Chatbot";

const highlightCards = [
  { label: "Cash on hand", value: "$45,790", trend: "+12.4%", trendTone: "up", description: "vs last week" },
  { label: "Monthly burn", value: "$12,140", trend: "-4.8%", trendTone: "down", description: "projected for Oct" },
  { label: "Active goals", value: "6", trend: "+2", trendTone: "up", description: "new this quarter" },
  { label: "Credit score", value: "782", trend: "stable", trendTone: "neutral", description: "excellent standing" },
];

const quickActions = [
  { title: "Log expense", description: "Capture a new transaction", icon: "🧾", href: "/expenseTracking" },
  { title: "Create budget", description: "Set envelopes for the month", icon: "💰", message: "Budget planning is coming soon. Stay tuned!" },
  { title: "Invite partner", description: "Collaborate on finances", icon: "👫", message: "Shared workspaces will launch shortly." },
  { title: "Automate savings", description: "Schedule smart transfers", icon: "⚙️", message: "Automation playbooks are in development." },
];

const categories = [
  { name: "Housing", amount: "$1,820", limit: "$2,000", progress: 74 },
  { name: "Groceries", amount: "$540", limit: "$650", progress: 66 },
  { name: "Dining", amount: "$220", limit: "$400", progress: 40 },
  { name: "Subscriptions", amount: "$96", limit: "$120", progress: 55 },
];

const milestones = [
  { title: "Emergency fund", status: "78% funded", accent: "bg-emerald-400" },
  { title: "Student loan payoff", status: "5 months ahead", accent: "bg-blue-400" },
  { title: "Euro trip savings", status: "$1,950 of $3,000", accent: "bg-purple-400" },
];

const upcomingPayments = [
  { name: "Rent", amount: "$1,950", due: "Due in 3 days" },
  { name: "Car payment", amount: "$420", due: "Due in 7 days" },
  { name: "Gym membership", amount: "$59", due: "Due in 9 days" },
];

const insights = [
  {
    title: "AI savings insight",
    summary: "You could move $350 from dining to travel and still stay on budget.",
  },
  {
    title: "Investment pulse",
    summary: "Your ETF portfolio outperformed the market by 1.7% over the last 30 days.",
  },
  {
    title: "Smart reminder",
    summary: "Schedule a check-in—emergency fund is 78% to target.",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionTone, setActionTone] = useState("info");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (!actionMessage) return;
    const timeout = setTimeout(() => setActionMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [actionMessage]);

  const handleQuickAction = (action) => {
    if (action.href) {
      router.push(action.href);
      return;
    }
    setActionTone("info");
    setActionMessage(action.message ?? "Feature coming soon.");
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <DashboardLayout>
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-[#050814] px-6 py-8 shadow-lg shadow-blue-900/30">
        <div className="pointer-events-none absolute -right-16 top-12 h-72 w-72 rounded-full bg-blue-500/25 blur-[140px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-purple-500/20 blur-[160px]" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/70">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Let’s make smart money moves today</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300/80">
              Track spending, monitor investments, and unlock AI-driven suggestions tailored to your goals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-blue-500/30 bg-blue-500/15 px-6 py-4 text-sm text-blue-100 shadow-lg shadow-blue-900/30">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-blue-100/70">Total net worth</p>
              <p className="mt-2 text-3xl font-semibold text-white">$128,730</p>
              <span className="text-xs text-emerald-300">▲ 4.2% this month</span>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/30 text-lg font-semibold text-white">82</div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlightCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20 transition hover:border-blue-500/40 hover:shadow-blue-500/20"
          >
            <div className="pointer-events-none absolute -right-6 top-6 h-24 w-24 rounded-full bg-blue-500/15 blur-[80px]" />
            <div className="relative z-10 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
              <p className="text-3xl font-semibold text-white">{card.value}</p>
              <p className="text-xs text-slate-400">
                <span
                  className={
                    card.trendTone === "up"
                      ? "text-emerald-300"
                      : card.trendTone === "down"
                      ? "text-rose-300"
                      : "text-blue-200"
                  }
                >
                  {card.trend}
                </span>{" "}
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-8">
          <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Cashflow overview</h2>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Last 12 months</p>
              </div>
              <button className="rounded-full border border-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                Download report
              </button>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/50 bg-slate-950/70">
              <MoneyLineChart />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-emerald-900/15">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            {actionMessage && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
                  actionTone === "info"
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-100"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {actionMessage}
              </div>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-slate-900/50 bg-slate-950/60 p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-semibold text-white">{action.title}</span>
                  <span className="text-xs text-slate-400 group-hover:text-slate-200">{action.description}</span>
                  {action.href && (
                    <span className="mt-auto text-[10px] uppercase tracking-[0.3em] text-blue-300 group-hover:text-blue-200">
                      Go to page
                    </span>
                  )}
                  {!action.href && (
                    <span className="mt-auto text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      Coming soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </article>

          <article className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/15">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Spending breakdown</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current month</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  Updated just now
                </span>
              </header>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {categories.map((category) => (
                  <li key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{category.name}</span>
                      <span className="text-xs text-slate-400">
                        {category.amount} of {category.limit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-6 rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/15">
              <header>
                <h3 className="text-lg font-semibold text-white">Milestones</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Keep up the momentum</p>
              </header>
              <ul className="space-y-4 text-sm text-slate-300">
                {milestones.map((goal) => (
                  <li
                    key={goal.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-900/60 bg-slate-900/60 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{goal.title}</p>
                      <p className="text-xs text-slate-400">{goal.status}</p>
                    </div>
                    <span
                      className={`ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${goal.accent}`}
                    >
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Upcoming</p>
                <h3 className="text-lg font-semibold text-white">Stay ahead of payments</h3>
              </div>
              <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                Sync calendar
              </button>
            </header>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {upcomingPayments.map((payment) => (
                <li
                  key={payment.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{payment.name}</p>
                    <p className="text-xs text-slate-400">{payment.due}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-100">{payment.amount}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-purple-900/20">
            <h3 className="text-lg font-semibold text-white">FinScope Copilot</h3>
            <p className="mt-3 text-sm text-slate-300">
              Ask budgeting questions, draft saving plans, or analyse spending in seconds.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-900/50 bg-slate-950/60">
              <Chatbot />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20">
            <h3 className="text-lg font-semibold text-white">Today’s insights</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {insights.map((tip) => (
                <li key={tip.title} className="rounded-2xl border border-slate-900/50 bg-slate-950/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-blue-300/80">{tip.title}</p>
                  <p className="mt-2 leading-relaxed">{tip.summary}</p>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>
    </DashboardLayout>
  );
}
