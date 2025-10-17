"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "../../components/layout/DashboardLayout";
import MoneyLineChart from "../../components/layout/MoneyLineChart";

const performanceCards = [
  { label: "Portfolio value", value: "$214,560", delta: "+$8,420", tone: "up", context: "vs last month" },
  { label: "YTD return", value: "+12.6%", delta: "+2.1%", tone: "up", context: "vs S&P 500" },
  { label: "Cash available", value: "$14,320", delta: "-$1,050", tone: "down", context: "pending redeploy" },
  { label: "Dividend yield", value: "2.8%", delta: "+0.4%", tone: "up", context: "blended across assets" },
];

const riskProfile = {
  score: "Balanced",
  riskScale: [
    { label: "Conservative", value: 25 },
    { label: "Balanced", value: 55 },
    { label: "Growth", value: 75 },
    { label: "Aggressive", value: 95 },
  ],
  metrics: [
    { label: "Portfolio beta", value: "1.04" },
    { label: "Value at risk (95%)", value: "-$7,950" },
    { label: "Max drawdown (3Y)", value: "-14.2%" },
  ],
  aiInsight:
    "Portfolio volatility is 12% above your benchmark. Shifting 5% from crypto to fixed income would reduce variance while preserving return targets.",
};

const volatilityMetrics = [
  { label: "Sharpe ratio", value: "1.12", context: "Above peer median" },
  { label: "Std. deviation", value: "14.6%", context: "Benchmark: 12.9%" },
  { label: "Downside deviation", value: "9.4%", context: "Acceptable risk band" },
  { label: "Sortino ratio", value: "1.63", context: "Healthy reward vs downside" },
];

const allocation = [
  { label: "US Equities", amount: "$96,400", percent: 45, accent: "bg-blue-500" },
  { label: "International Equities", amount: "$38,200", percent: 18, accent: "bg-indigo-500" },
  { label: "Fixed Income", amount: "$32,800", percent: 15, accent: "bg-emerald-500" },
  { label: "Alternatives", amount: "$21,600", percent: 10, accent: "bg-purple-500" },
  { label: "Cash", amount: "$14,320", percent: 7, accent: "bg-cyan-500" },
  { label: "Crypto", amount: "$11,240", percent: 5, accent: "bg-amber-500" },
];

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$189.12", change: "+1.24%", allocation: "12.4%", pnl: "+$4,130" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: "$379.40", change: "+0.87%", allocation: "10.8%", pnl: "+$3,680" },
  { symbol: "VTI", name: "Vanguard Total Market ETF", price: "$227.15", change: "+0.43%", allocation: "9.6%", pnl: "+$2,110" },
  { symbol: "BND", name: "Total Bond Market ETF", price: "$71.23", change: "-0.12%", allocation: "7.2%", pnl: "+$420" },
  { symbol: "NVDA", name: "Nvidia Corp.", price: "$873.21", change: "+2.61%", allocation: "6.8%", pnl: "+$6,980" },
];

const watchlist = [
  { symbol: "TSLA", name: "Tesla Inc.", price: "$212.64", change: "+3.84%", sentiment: "bullish" },
  { symbol: "AMZN", name: "Amazon.com", price: "$176.18", change: "+1.12%", sentiment: "neutral" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: "$426.54", change: "-0.42%", sentiment: "watch" },
  { symbol: "GLD", name: "SPDR Gold Shares", price: "$191.07", change: "+0.65%", sentiment: "hedge" },
];

const scenarios = [
  {
    key: "invest-more",
    title: "Invest $200 more each month",
    description: "Increase automated contributions to accelerate long-term growth.",
    stats: [
      { label: "Projected value (20Y)", value: "$412K (+$128K)" },
      { label: "Expected CAGR", value: "+1.8%" },
      { label: "Dividend income (10Y)", value: "+$4,200" },
    ],
    aiInsight: "Boosting monthly investments compounds into $128K in additional value over 20 years assuming a 7.2% return.",
  },
  {
    key: "market-drop",
    title: "Market drops 10%",
    description: "Stress-test resilience if equity markets correct sharply.",
    stats: [
      { label: "Portfolio impact", value: "-$21,400 (10.2%)" },
      { label: "Recovery timeline", value: "13 months" },
      { label: "Opportunity capital", value: "$14,320 cash" },
    ],
    aiInsight: "Keep $12K+ liquid to deploy into oversold sectors. Scaling into bonds cushions drawdowns by 2.4%.",
  },
  {
    key: "retire-15",
    title: "Retire in 15 years",
    description: "Assess whether current savings trajectory supports retirement income targets.",
    stats: [
      { label: "Projected nest egg", value: "$1.18M" },
      { label: "Income replacement", value: "74% of goal" },
      { label: "Required monthly add", value: "+$480" },
    ],
    aiInsight: "To retire with $1.5M, lift monthly contributions by $480 or increase equity tilt toward dividend growth ETFs.",
  },
];

const goals = [
  {
    name: "Buy a house in 8 years",
    target: "$120,000",
    progress: 58,
    contributed: "$69,400 saved",
    projection: "Forecast $14,200 ahead of schedule",
    riskAdjustment: "Consider shifting 7% from crypto to bonds 18 months before purchase.",
  },
  {
    name: "Retire with $1M",
    target: "$1,000,000",
    progress: 42,
    contributed: "$420,000 projected",
    projection: "Currently tracking toward $860,000",
    riskAdjustment: "Increase 401(k) contributions by 3% or add SCHD for income stability.",
  },
  {
    name: "Fund college plan",
    target: "$180,000",
    progress: 36,
    contributed: "$64,800 saved",
    projection: "On pace for $152,000",
    riskAdjustment: "Move 5% of equities into municipal bonds to de-risk tuition timeline.",
  },
];

const alerts = [
  {
    title: "Bond allocation below 10%",
    detail: "Current fixed income exposure sits at 8.4% vs. 12% target. Rebalance to smooth volatility.",
    tone: "warning",
  },
  {
    title: "Tech sector concentration over 50%",
    detail: "Technology holdings now represent 52% of total equities. Consider trimming gains into defensives.",
    tone: "alert",
  },
  {
    title: "NVIDIA earnings tomorrow",
    detail: "Expect ±3.2% post-earnings move. Review option hedges or trailing stops.",
    tone: "info",
  },
];

const recommendations = [
  {
    title: "Increase dividend sleeve",
    description: "Boost passive income without materially increasing volatility.",
    symbols: ["VTI", "SCHD", "JEPI"],
    rationale: "Historically produces 2.6% yield lift with beta under 0.95.",
  },
  {
    title: "Rebalance toward fixed income",
    description: "Trim high-growth tech and redeploy into intermediate-term bonds.",
    symbols: ["BND", "VCIT", "AGG"],
    rationale: "Reduces drawdown risk by ~1.9% while keeping return projections intact.",
  },
  {
    title: "Add international exposure",
    description: "Diversify away from US earnings cycle with broad developed markets.",
    symbols: ["VXUS", "IEFA"],
    rationale: "Cuts home-country bias and captures recovering EU/JP manufacturing cycle.",
  },
];

const timelineViews = [
  { key: "total", label: "Total return" },
  { key: "dividends", label: "Dividends" },
  { key: "contributions", label: "Contributions vs growth" },
];

const timelineData = {
  total: [
    { month: "Jan", value: "+$3,420" },
    { month: "Feb", value: "+$2,980" },
    { month: "Mar", value: "-$1,260" },
    { month: "Apr", value: "+$4,120" },
    { month: "May", value: "+$5,430" },
    { month: "Jun", value: "+$3,870" },
  ],
  dividends: [
    { month: "Jan", value: "$420" },
    { month: "Feb", value: "$0" },
    { month: "Mar", value: "$525" },
    { month: "Apr", value: "$0" },
    { month: "May", value: "$612" },
    { month: "Jun", value: "$0" },
  ],
  contributions: [
    { month: "Jan", value: "Invested $2,400 • Growth $820" },
    { month: "Feb", value: "Invested $2,400 • Growth $580" },
    { month: "Mar", value: "Invested $2,400 • Growth -$940" },
    { month: "Apr", value: "Invested $2,400 • Growth $1,720" },
    { month: "May", value: "Invested $2,400 • Growth $3,030" },
    { month: "Jun", value: "Invested $2,400 • Growth $1,470" },
  ],
};

const news = [
  {
    title: "Fed signals gradual cuts as inflation cools",
    source: "MarketWatch",
    time: "32m ago",
    summary: "Bond yields retreat and growth stocks rally as investors reprice rate expectations.",
  },
  {
    title: "Tech mega-cap earnings season kicks off",
    source: "Bloomberg",
    time: "1h ago",
    summary: "Analysts forecast double-digit earnings growth driven by AI infrastructure demand.",
  },
  {
    title: "Global PMI data reveal manufacturing rebound",
    source: "Reuters",
    time: "2h ago",
    summary: "International equities surge on stronger-than-expected factory orders in EU and APAC.",
  },
];

export default function InvestmentsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0].key);
  const [selectedTimelineView, setSelectedTimelineView] = useState(timelineViews[0].key);
  const [viewMode, setViewMode] = useState("portfolio");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  const timeframeOptions = useMemo(() => ["1D", "1W", "1M", "3M", "1Y", "5Y"], []);
  const activeScenario = useMemo(() => scenarios.find((scenario) => scenario.key === selectedScenario) ?? scenarios[0], [selectedScenario]);
  const timelineEntries = timelineData[selectedTimelineView] ?? [];

  if (isCheckingAuth) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 pb-12 pt-6 sm:px-6 lg:px-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-900/70 bg-gradient-to-br from-slate-950/95 via-slate-900/75 to-[#050814] px-6 py-8 shadow-xl shadow-blue-900/30">
          <div className="pointer-events-none absolute -right-10 top-14 h-72 w-72 rounded-full bg-emerald-500/20 blur-[140px]" />
          <div className="pointer-events-none absolute -left-16 -bottom-12 h-72 w-72 rounded-full bg-blue-500/15 blur-[160px]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200/70">Investments</p>
              <h1 className="mt-3 text-3xl font-semibold text-white lg:text-4xl">Grow your capital with confidence</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300/80">
                Monitor performance, analyse risk, and act on timely insights across equities, fixed income, and alternative assets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-2xl border border-slate-800/60 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-500/40 hover:text-white">
                Export report
              </button>
              <button className="rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110">
                New investment plan
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {performanceCards.map((card) => (
            <article
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-emerald-900/20"
            >
              <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-emerald-500/10 blur-[110px]" />
              <div className="relative z-10 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold text-white">{card.value}</p>
                <p className="text-xs text-slate-400">
                  <span
                    className={
                      card.tone === "up"
                        ? "text-emerald-300"
                        : card.tone === "down"
                        ? "text-rose-300"
                        : "text-blue-200"
                    }
                  >
                    {card.delta}
                  </span>{" "}
                  {card.context}
                </p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/25">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Performance insights</h2>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Portfolio balance & benchmark</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-900/60 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                {timeframeOptions.map((option) => {
                  const active = option === selectedTimeframe;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedTimeframe(option)}
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow shadow-emerald-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </header>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/90 to-slate-900/70">
              <MoneyLineChart />
            </div>
            <footer className="mt-6 flex flex-col gap-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-100">
                  Gain +18.4% since Jan 1
                </span>
                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-semibold text-blue-100">
                  Best month: May +5.4%
                </span>
                <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 font-semibold text-purple-100">
                  Worst month: Mar -3.1%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("portfolio")}
                  className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.3em] transition ${
                    viewMode === "portfolio"
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100"
                      : "border-slate-800 text-slate-300 hover:border-emerald-500/30 hover:text-white"
                  }`}
                >
                  Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("benchmark")}
                  className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.3em] transition ${
                    viewMode === "benchmark"
                      ? "border-blue-500/40 bg-blue-500/15 text-blue-100"
                      : "border-slate-800 text-slate-300 hover:border-blue-500/30 hover:text-white"
                  }`}
                >
                  Benchmark
                </button>
              </div>
            </footer>
            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/70 p-4 text-xs text-slate-300 sm:grid-cols-3">
              {[
                { label: "Top sector", value: "Technology +24%" },
                { label: "Lagging sector", value: "Emerging Mkts -6%" },
                { label: "Income yield", value: "2.8% trailing 12m" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-emerald-900/20">
            <header>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Risk & volatility</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Portfolio stability profile</h3>
            </header>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/70 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Risk score</p>
                  <p className="mt-1 text-xl font-semibold text-white">{riskProfile.score}</p>
                  <p className="text-xs text-slate-500">Balanced exposure across asset classes</p>
                </div>
                <div className="flex h-14 items-center gap-2">
                  {riskProfile.riskScale.map((item) => (
                    <span
                      key={item.label}
                      className={`h-10 w-2 rounded-full ${
                        item.label === riskProfile.score
                          ? "bg-gradient-to-b from-emerald-400 to-blue-500"
                          : "bg-slate-800"
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>
              <ul className="grid gap-3 text-xs text-slate-400">
                {riskProfile.metrics.map((metric) => (
                  <li key={metric.label} className="flex items-center justify-between rounded-xl border border-slate-900/60 bg-slate-950/60 px-3 py-2">
                    <span className="uppercase tracking-[0.3em]">{metric.label}</span>
                    <span className="text-sm font-semibold text-white">{metric.value}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                {riskProfile.aiInsight}
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
              {volatilityMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/65 px-3 py-3">
                  <p className="uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-xs">{metric.context}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/25">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Portfolio simulation lab</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Model what-if scenarios</p>
              </div>
              <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                View assumptions
              </button>
            </header>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {scenarios.map((scenario) => {
                const active = scenario.key === selectedScenario;
                return (
                  <button
                    key={scenario.key}
                    type="button"
                    onClick={() => setSelectedScenario(scenario.key)}
                    className={`rounded-2xl border p-4 text-left text-sm transition ${
                      active
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100 shadow shadow-emerald-500/20"
                        : "border-slate-900/60 bg-slate-950/60 text-slate-300 hover:border-emerald-500/30 hover:text-white"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{scenario.title}</p>
                    <p className="mt-2 text-xs">{scenario.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/70 p-4 text-sm text-slate-300 md:grid-cols-3">
              {activeScenario.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
              {activeScenario.aiInsight}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-emerald-900/20">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Goal-based investing</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Track outcomes vs. ambition</p>
              </div>
              <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-500/40 hover:text-white">
                Add goal
              </button>
            </header>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              {goals.map((goal) => (
                <li key={goal.name} className="rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/65 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{goal.name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Target {goal.target}</p>
                      <p className="mt-2 text-xs text-slate-400">{goal.projection}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      <p>{goal.contributed}</p>
                      <p className="mt-1 text-emerald-200">{goal.riskAdjustment}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-900/60">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${goal.progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                    {goal.progress}% funded
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-purple-900/20">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Smart alerts & AI signals</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Stay ahead of portfolio drift</p>
              </div>
              <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-purple-500/40 hover:text-white">
                Manage alerts
              </button>
            </header>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {alerts.map((alert) => (
                <li
                  key={alert.title}
                  className={`rounded-2xl border px-4 py-3 ${
                    alert.tone === "warning"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                      : alert.tone === "alert"
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                      : "border-blue-500/40 bg-blue-500/10 text-blue-100"
                  }`}
                >
                  <p className="font-medium">{alert.title}</p>
                  <p className="mt-1 text-xs opacity-80">{alert.detail}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-emerald-900/20">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">AI-powered recommendations</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Personalised by goals & risk tolerance</p>
              </div>
              <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-500/40 hover:text-white">
                View rationale
              </button>
            </header>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              {recommendations.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.symbols.map((symbol) => (
                        <span
                          key={symbol}
                          className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-200"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-emerald-200">{item.rationale}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)]">
          <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Historical performance timeline</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cumulative returns & monthly P&L</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-900/60 bg-slate-950/60 px-2 py-1 text-xs text-slate-300">
                {timelineViews.map((view) => {
                  const active = view.key === selectedTimelineView;
                  return (
                    <button
                      key={view.key}
                      type="button"
                      onClick={() => setSelectedTimelineView(view.key)}
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow shadow-blue-500/20"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {view.label}
                    </button>
                  );
                })}
              </div>
            </header>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/90 to-slate-900/70">
              <MoneyLineChart />
            </div>
            <ul className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-3">
              {timelineEntries.map((entry) => (
                <li key={entry.month} className="rounded-xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/65 px-3 py-3">
                  <p className="uppercase tracking-[0.3em] text-slate-500">{entry.month}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{entry.value}</p>
                </li>
              ))}
            </ul>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Asset allocation</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Balanced risk profile</p>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
                  Target 60/40
                </span>
              </header>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                {allocation.map((bucket) => (
                  <li key={bucket.label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${bucket.accent}`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{bucket.label}</span>
                          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{bucket.percent}% allocation</span>
                        </div>
                      </div>
                      <span className="font-semibold text-white">{bucket.amount}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-900/60">
                      <div className={`h-full rounded-full ${bucket.accent}`} style={{ width: `${bucket.percent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span>Drift vs. target: <span className="text-emerald-300">+1.8%</span></span>
                <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-500/40 hover:text-white">
                  Rebalance
                </button>
              </footer>
            </article>

            <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Watchlist</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Real-time ideas to consider</p>
                </div>
                <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-500/40 hover:text-white">
                  Manage
                </button>
              </header>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {watchlist.map((item) => (
                  <li
                    key={item.symbol}
                    className="flex items-center justify-between rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.symbol}</p>
                      <p className="text-xs text-slate-500">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{item.price}</p>
                      <p
                        className={`text-xs ${
                          item.change.startsWith("-") ? "text-rose-300" : "text-emerald-300"
                        }`}
                      >
                        {item.change}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
                        item.sentiment === "bullish"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                          : item.sentiment === "watch"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                          : "border-slate-800 text-slate-300"
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Top holdings</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Sorted by portfolio weight</p>
                </div>
                <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                  Export CSV
                </button>
              </header>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/60 bg-slate-950/60">
                <table className="min-w-full divide-y divide-slate-900/60 text-sm text-slate-300">
                  <thead className="uppercase tracking-[0.35em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Holding</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Daily</th>
                      <th className="px-4 py-3 text-right">Allocation</th>
                      <th className="px-4 py-3 text-right">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {holdings.map((holding) => (
                      <tr key={holding.symbol}>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{holding.symbol}</span>
                            <span className="text-xs text-slate-500">{holding.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">{holding.price}</td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                            holding.change.startsWith("-") ? "text-rose-300" : "text-emerald-300"
                          }`}
                        >
                          {holding.change}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">{holding.allocation}</td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                            holding.pnl.startsWith("-") ? "text-rose-300" : "text-emerald-300"
                          }`}
                        >
                          {holding.pnl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Market pulse</p>
              <h3 className="text-lg font-semibold text-white">Latest headlines</h3>
            </div>
            <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
              View feed
            </button>
          </header>
          <ul className="mt-6 grid gap-4 text-sm text-slate-300 lg:grid-cols-3">
            {news.map((item) => (
              <li key={item.title} className="rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/65 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.source}</span>
                  <span>{item.time}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
                <p className="mt-2 text-xs text-slate-400">{item.summary}</p>
                <button className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-300 transition hover:text-blue-200">
                  Read analysis
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4m4-4H3" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
