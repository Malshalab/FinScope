"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TransactionTable from "../../components/transactions/TransactionTable";
import AddTransactionPanel from "../../components/transactions/AddTransactionPanel";
import { addTransaction, getTransactions, getTransactionCategories } from "../../api/transaction";

const summaryCards = [
  {
    label: "Total spend",
    value: "$8,420",
    delta: "-6.2%",
    tone: "down",
    sublabel: "vs last month",
  },
  {
    label: "Incoming transfers",
    value: "$12,960",
    delta: "+14.0%",
    tone: "up",
    sublabel: "settled this month",
  },
  {
    label: "Pending approval",
    value: "$640",
    delta: "3 items",
    tone: "neutral",
    sublabel: "awaiting review",
  },
];

const categoryAccentMap = {
  Groceries: "bg-emerald-400",
  Dining: "bg-rose-400",
  Travel: "bg-indigo-400",
  Wellness: "bg-purple-400",
  Subscriptions: "bg-indigo-400",
  Income: "bg-blue-400",
  Utilities: "bg-cyan-400",
  Transportation: "bg-amber-400",
  Other: "bg-slate-400",
};

const statusLabelMap = {
  posted: "Posted",
  pending: "Pending",
  reconciled: "Reconciled",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const formatTransactionForTable = (transaction) => {
  const amountValue =
    typeof transaction.amount === "number"
      ? transaction.amount
      : Number(transaction.amount);

  const safeAmount = Number.isNaN(amountValue) ? 0 : amountValue;
  const transactionDate = transaction.date
    ? new Date(transaction.date)
    : new Date();

  return {
    id: transaction.id,
    date: transactionDate.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
    }),
    merchant: transaction.description || "Untitled transaction",
    account: transaction.account || "Manual entry",
    category: transaction.category,
    categoryAccent:
      categoryAccentMap[transaction.category] ?? categoryAccentMap.Other,
    amount: formatCurrency(safeAmount),
    type: transaction.type === "credit" ? "credit" : "debit",
    status: transaction.status,
    statusLabel: statusLabelMap[transaction.status] ?? transaction.status,
  };
};

const formatDistributionForUI = (item) => {
  const amountValue =
    typeof item.amount === "number" ? item.amount : Number(item.amount);

  const safeAmount = Number.isNaN(amountValue) ? 0 : amountValue;
  const safePercent = Number.isFinite(item.percent) ? item.percent : 0;

  return {
    category: item.category,
    formattedAmount: formatCurrency(safeAmount),
    amountValue: safeAmount,
    share: Math.max(0, Math.min(100, safePercent)),
    count: item.count ?? 0,
    accent: categoryAccentMap[item.category] ?? categoryAccentMap.Other,
  };
};

const upcomingPayments = [
  { label: "Studio lease", amount: "$1,950", due: "Due in 3 days", accent: "bg-rose-500/20 text-rose-200" },
  { label: "Car insurance", amount: "$210", due: "Due in 6 days", accent: "bg-amber-500/20 text-amber-200" },
  { label: "Spotify Premium", amount: "$17", due: "Due in 9 days", accent: "bg-blue-500/20 text-blue-200" },
];

const activityFeed = [
  {
    id: "activity-1",
    title: "Card synced",
    description: "Visa •••• 2741 pulled 12 new transactions",
    timestamp: "5m ago",
    accent: "bg-blue-500/20 text-blue-200",
  },
  {
    id: "activity-2",
    title: "Rule applied",
    description: "“Dining under $100” auto-categorised 4 items",
    timestamp: "22m ago",
    accent: "bg-purple-500/20 text-purple-200",
  },
  {
    id: "activity-3",
    title: "Receipt uploaded",
    description: "Nimbus Cloud Storage",
    timestamp: "1h ago",
    accent: "bg-emerald-500/20 text-emerald-200",
  },
];

export default function ExpenseTrackingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [isLoadingDistribution, setIsLoadingDistribution] = useState(false);
  const [distributionError, setDistributionError] = useState("");
  const [availableFilters, setAvailableFilters] = useState(["All"]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (isComposerOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isComposerOpen]);

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        setIsLoadingTransactions(true);
        setLoadError("");
        setIsLoadingDistribution(true);
        setDistributionError("");

        const [transactionsResult, categoriesResult] = await Promise.allSettled([
          getTransactions(),
          getTransactionCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        if (transactionsResult.status === "fulfilled") {
          const formatted = transactionsResult.value.map(formatTransactionForTable);
          setAllTransactions(formatted);
          const categoriesFromTransactions = Array.from(
            new Set(formatted.map((item) => item.category))
          );
          setAvailableFilters(["All", ...categoriesFromTransactions]);
        } else {
          setLoadError(
            transactionsResult.reason?.response?.data?.detail ??
              transactionsResult.reason?.message ??
              "Unable to fetch transactions right now."
          );
          setAllTransactions([]);
          setAvailableFilters(["All"]);
        }

        if (categoriesResult.status === "fulfilled") {
          const formattedDistribution = categoriesResult.value.map(formatDistributionForUI);
          setCategoryDistribution(formattedDistribution);
        } else {
          setDistributionError(
            categoriesResult.reason?.response?.data?.detail ??
              categoriesResult.reason?.message ??
              "Unable to load spending distribution."
          );
          setCategoryDistribution([]);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setLoadError(
          error?.response?.data?.detail ??
            "Unable to fetch transactions right now."
        );
        setDistributionError(
          error?.response?.data?.detail ??
            "Unable to load spending distribution."
        );
      } finally {
        if (isMounted) {
          setIsLoadingTransactions(false);
          setIsLoadingDistribution(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allTransactions.filter((transaction) => {
      const matchesFilter =
        activeFilter === "All" || transaction.category === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        transaction.merchant.toLowerCase().includes(term) ||
        transaction.account.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term)
      );
    });
  }, [allTransactions, activeFilter, searchTerm]);

  const isFiltering = activeFilter !== "All" || searchTerm.trim().length > 0;

  const handleCreateTransaction = async (payload) => {
    const apiPayload = {
      description: payload.merchant,
      category: payload.category,
      account: payload.account || "Manual entry",
      amount: Number(payload.amount),
      status: payload.status,
      type: payload.type,
      date: payload.date
        ? new Date(payload.date).toISOString()
        : new Date().toISOString(),
    };

    const transaction = await addTransaction(apiPayload);

    const nextTransaction = formatTransactionForTable(transaction);
    setAllTransactions((prev) => {
      const updated = [nextTransaction, ...prev];
      const updatedCategories = Array.from(new Set(updated.map((item) => item.category)));
      setAvailableFilters(["All", ...updatedCategories]);
      return updated;
    });

    try {
      setIsLoadingDistribution(true);
      const categories = await getTransactionCategories();
      setCategoryDistribution(categories.map(formatDistributionForUI));
      setDistributionError("");
    } catch (error) {
      setDistributionError(
        error?.response?.data?.detail ??
          error?.message ??
          "Unable to refresh spending distribution."
      );
    } finally {
      setIsLoadingDistribution(false);
    }

    return nextTransaction;
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 pb-10 pt-6 sm:px-6 lg:px-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-900/70 bg-gradient-to-br from-slate-950/95 via-slate-900/75 to-[#050814] px-6 py-8 shadow-xl shadow-blue-900/30">
          <div className="pointer-events-none absolute -right-10 top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="pointer-events-none absolute -left-16 -bottom-10 h-56 w-56 rounded-full bg-purple-500/25 blur-[120px]" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/70">Transactions</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Track every move your money makes</h1>
              <p className="mt-3 max-w-xl text-sm text-slate-300/80">
                Monitor spending trends, reconcile accounts, and stay ahead of upcoming payments—all harmonised in a single
                workspace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-2xl border border-slate-800/60 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-blue-500/40 hover:text-white">
                Export CSV
              </button>
              <button
                onClick={() => setIsComposerOpen((prev) => !prev)}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110"
              >
                New transaction
              </button>
            </div>
          </div>
        </section>

        {isComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity"
              onClick={() => setIsComposerOpen(false)}
            />
            <div
              className="relative z-10 w-full max-w-4xl transition-transform"
              onClick={(event) => event.stopPropagation()}
            >
              <AddTransactionPanel
                className="p-8"
                onCreate={async (payload) => {
                  await handleCreateTransaction(payload);
                  setIsComposerOpen(false);
                }}
                onClose={() => setIsComposerOpen(false)}
              />
            </div>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20"
            >
              <div className="pointer-events-none absolute -right-10 top-6 h-40 w-40 rounded-full bg-blue-500/15 blur-[100px]" />
              <div className="relative z-10 space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
                <p className="text-3xl font-semibold text-white">{card.value}</p>
                <p
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    card.tone === "up"
                      ? "bg-emerald-500/15 text-emerald-200"
                      : card.tone === "down"
                      ? "bg-rose-500/15 text-rose-200"
                      : "bg-slate-500/15 text-slate-200"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {card.delta}
                </p>
                <p className="text-xs text-slate-500">{card.sublabel}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-6 rounded-3xl border border-slate-900/70 bg-slate-950/80 p-6 shadow-xl shadow-blue-900/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-900/50 bg-slate-950/70 px-3 py-2 shadow-inner shadow-blue-900/20">
                <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by merchant, account, or category"
                />
              </div>
             <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
                disabled={!isFiltering}
                className="flex items-center gap-2 rounded-2xl border border-slate-900/50 bg-slate-950/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-blue-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {availableFilters.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-full px-3 py-1 font-semibold tracking-[0.2em] transition ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow shadow-blue-900/40"
                          : "border border-slate-900/50 bg-slate-950/60 text-slate-300 hover:border-blue-500/30 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 rounded-full border border-slate-900/50 bg-slate-950/60 px-3 py-1">
                {isFiltering ? (
                  <>
                    Showing <span className="text-white">{filteredTransactions.length}</span> of{" "}
                    <span className="text-white">{allTransactions.length}</span> transactions
                  </>
                ) : (
                  <>
                    Transactions synced: <span className="text-white">{allTransactions.length}</span>
                  </>
                )}
              </div>
              {activeFilter !== "All" && (
                <div className="flex items-center gap-2 rounded-full border border-slate-900/50 bg-slate-950/60 px-3 py-1">
                  Active filter: <span className="text-white capitalize">{activeFilter}</span>
                </div>
              )}
              {searchTerm && (
                <div className="flex items-center gap-2 rounded-full border border-slate-900/50 bg-slate-950/60 px-3 py-1">
                  Search: <span className="text-white">{searchTerm}</span>
                </div>
              )}
            </div>
          </div>

          {isLoadingTransactions ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/70 px-6 py-12 text-sm text-slate-300 shadow-inner shadow-blue-900/20">
              Fetching your latest transactions…
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {loadError}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-900/60 bg-gradient-to-br from-slate-950/80 to-slate-900/65 px-6 py-10 text-center text-sm text-slate-300 shadow-inner shadow-blue-900/20">
              <p>
                {isFiltering
                  ? "No transactions match your current filters."
                  : "No transactions logged yet."}
              </p>
              <button
                onClick={() => {
                  if (isFiltering) {
                    setSearchTerm("");
                    setActiveFilter("All");
                    return;
                  }
                  setIsComposerOpen(true);
                }}
                className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110"
              >
                {isFiltering ? "Clear filters" : "Add your first transaction"}
              </button>
            </div>
          ) : (
            <TransactionTable transactions={filteredTransactions} />
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/15">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Spending distribution</p>
                  <h3 className="text-lg font-semibold text-white">Where your money went</h3>
                </div>
                <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                  View reports
                </button>
              </header>
              <div className="mt-6 space-y-3">
                {isLoadingDistribution ? (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
                    Crunching the latest categories…
                  </div>
                ) : distributionError ? (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {distributionError}
                  </div>
                ) : categoryDistribution.length === 0 ? (
                  <div className="rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-6 text-center text-sm text-slate-400">
                    No categorised spend yet. Log a transaction to see insights here.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {categoryDistribution.map((segment) => (
                      <li
                        key={segment.category}
                        className="rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-3"
                      >
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${segment.accent}`} />
                            <div className="flex flex-col">
                              <span className="font-medium text-white capitalize">{segment.category}</span>
                              <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                                {segment.count} {segment.count === 1 ? "transaction" : "transactions"}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-white">{segment.formattedAmount}</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-900/60">
                          <div
                            className={`h-full rounded-full ${segment.accent}`}
                            style={{ width: `${segment.share}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                          {segment.share.toFixed(1)}% of spend
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/15">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Activity</p>
                  <h3 className="text-lg font-semibold text-white">Realtime sync updates</h3>
                </div>
                <button className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white">
                  Refresh
                </button>
              </header>
              <ul className="mt-6 space-y-4">
                {activityFeed.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-3">
                    <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${item.accent}`}>•</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.timestamp}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="space-y-6">
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
                  <li key={payment.label} className="flex items-center justify-between rounded-2xl border border-slate-900/60 bg-slate-950/60 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{payment.label}</p>
                      <p className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${payment.accent}`}>
                        {payment.due}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-slate-100">{payment.amount}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl border border-slate-900/60 bg-slate-950/70 p-6 shadow-lg shadow-blue-900/20">
              <header>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Smart insights</p>
                <h3 className="mt-1 text-lg font-semibold text-white">AI suggestions</h3>
              </header>
              <ul className="mt-6 space-y-4 text-sm text-slate-300">
                <li className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 shadow-inner shadow-blue-900/40">
                  <p className="font-medium text-blue-100">Shift $120 from dining to travel and stay within goals.</p>
                  <p className="mt-1 text-xs text-blue-200/80">Based on last 30 days</p>
                </li>
                <li className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 shadow-inner shadow-purple-900/40">
                  <p className="font-medium text-purple-100">Automate savings of $200 when income posts above $5,000.</p>
                  <p className="mt-1 text-xs text-purple-200/80">Rule template ready</p>
                </li>
                <li className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-inner shadow-emerald-900/40">
                  <p className="font-medium text-emerald-100">Two subscriptions unused for 60+ days—review to cut $38/mo spend.</p>
                  <p className="mt-1 text-xs text-emerald-200/80">Nimbus Storage, FitTrack Pro</p>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
