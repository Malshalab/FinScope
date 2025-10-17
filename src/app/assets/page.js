"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getGoals } from "../../api/goals";

const wrapperOptions = ["TFSA", "RRSP", "Non-Registered", "Crypto", "RESP", "Cash"];
const currencyOptions = ["CAD", "USD"];
const assetTypeOptions = ["Mutual fund", "ETF", "Stock", "Crypto", "Cash", "GIC"];

const allocationBuckets = ["Equity", "Fixed Income", "Cash", "Crypto", "Alternatives"];
const allocationColors = {
  Equity: "bg-emerald-500",
  "Fixed Income": "bg-blue-500",
  Cash: "bg-cyan-500",
  Crypto: "bg-purple-500",
  Alternatives: "bg-amber-500",
};

const goalAccentStyles = [
  { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-100" },
  { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-100" },
  { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-100" },
  { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-100" },
  { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-100" },
];

const defaultAccountForm = {
  name: "",
  wrapper: "",
  institution: "",
  currency: "CAD",
  cashBalance: "",
};

const defaultHoldingForm = {
  accountId: "",
  assetType: "",
  code: "",
  name: "",
  units: "",
  avgCost: "",
  marketPrice: "",
  currency: "CAD",
  linkedGoalId: "",
  monthlyContribution: "",
};

const seededAccounts = [
  {
    id: "acc-1",
    name: "WealthSmart TFSA",
    wrapper: "TFSA",
    institution: "Wealthsimple",
    currency: "CAD",
    cashBalance: 1200.43,
  },
  {
    id: "acc-2",
    name: "Global Growth RRSP",
    wrapper: "RRSP",
    institution: "RBC Direct Investing",
    currency: "CAD",
    cashBalance: 640.12,
  },
];

const seededHoldings = [
  {
    id: "hold-1",
    accountId: "acc-1",
    assetType: "Mutual fund",
    code: "TDB900",
    name: "TD Canadian Equity Fund",
    units: 184.29,
    avgCost: 34.18,
    marketPrice: 37.62,
    currency: "CAD",
    linkedGoalId: "",
    monthlyContribution: 250,
    mix: { Equity: 85, "Fixed Income": 10, Cash: 5 },
  },
  {
    id: "hold-2",
    accountId: "acc-1",
    assetType: "ETF",
    code: "XEQT",
    name: "iShares All-Equity ETF",
    units: 92.4,
    avgCost: 25.41,
    marketPrice: 28.12,
    currency: "CAD",
    linkedGoalId: "",
    monthlyContribution: 150,
    mix: { Equity: 100 },
  },
  {
    id: "hold-3",
    accountId: "acc-2",
    assetType: "Stock",
    code: "SHOP",
    name: "Shopify Inc.",
    units: 14,
    avgCost: 63.4,
    marketPrice: 96.2,
    currency: "CAD",
    linkedGoalId: "",
    monthlyContribution: 0,
    mix: { Equity: 100 },
  },
];

const seedGoalFallback = [
  { id: "goal-1", name: "Buy lake cottage" },
  { id: "goal-2", name: "Retire at 55" },
  { id: "goal-3", name: "Kids RESP" },
];

function formatCurrency(value, currency = "CAD") {
  if (!Number.isFinite(value)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(value);
  }
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${Math.round(value)}%`;
}

function computeHoldingValue(holding) {
  return holding.units * (holding.marketPrice || holding.avgCost || 0);
}

function computeHoldingBookCost(holding) {
  return holding.units * (holding.avgCost || 0);
}

function computeHoldingGain(holding) {
  return computeHoldingValue(holding) - computeHoldingBookCost(holding);
}

function lookupSecurityMock(code) {
  const normalized = (code || "").trim().toUpperCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      const catalog = {
        TDB900: {
          name: "TD Canadian Bond Index Fund",
          mer: "0.30%",
          risk: "Medium",
          assetClass: "Balanced",
          mix: { Equity: 40, "Fixed Income": 55, Cash: 5 },
        },
        XEQT: {
          name: "iShares Core Equity ETF Portfolio",
          mer: "0.18%",
          risk: "Medium-High",
          assetClass: "Equity",
          mix: { Equity: 100 },
        },
        SHOP: {
          name: "Shopify Inc.",
          mer: "0.00%",
          risk: "High",
          assetClass: "Technology",
          mix: { Equity: 100 },
        },
      };

      const fallback = {
        name: `Security ${normalized || "Lookup"}`,
        mer: "0.45%",
        risk: "Medium",
        assetClass: "Core",
        mix: { Equity: 60, "Fixed Income": 30, Cash: 10 },
      };

      resolve(catalog[normalized] ?? fallback);
    }, 650);
  });
}

export default function AssetsPage() {
  const [accounts, setAccounts] = useState(seededAccounts);
  const [holdings, setHoldings] = useState(seededHoldings);

  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goalsError, setGoalsError] = useState(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({ ...defaultAccountForm });
  const [accountErrors, setAccountErrors] = useState({});

  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [holdingForm, setHoldingForm] = useState({ ...defaultHoldingForm });
  const [holdingErrors, setHoldingErrors] = useState({});
  const [holdingLookupInfo, setHoldingLookupInfo] = useState(null);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("value");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingGoals(true);
        const data = await getGoals();
        if (!isMounted) {
          return;
        }
        const mapped = data.map((goal) => ({ id: String(goal.id), name: goal.name }));
        setGoals(mapped.length ? mapped : seedGoalFallback);
        setGoalsError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setGoals(seedGoalFallback);
        setGoalsError(
          error?.response?.data?.detail ??
            "Live goals unavailable. Showing sample list.",
        );
      } finally {
        if (isMounted) {
          setLoadingGoals(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const goalLookup = useMemo(() => {
    const map = new Map();
    goals.forEach((goal) => map.set(String(goal.id), goal));
    return map;
  }, [goals]);

  const accountsWithTotals = useMemo(() => {
    return accounts.map((account) => {
      const accountHoldings = holdings.filter((holding) => holding.accountId === account.id);
      const totalValue = accountHoldings.reduce(
        (sum, holding) => sum + computeHoldingValue(holding),
        0,
      );
      const totalBook = accountHoldings.reduce(
        (sum, holding) => sum + computeHoldingBookCost(holding),
        0,
      );
      const linkedGoals = new Set(
        accountHoldings
          .map((holding) => holding.linkedGoalId)
          .filter(Boolean)
          .map((id) => goalLookup.get(String(id))?.name)
          .filter(Boolean),
      );

      return {
        ...account,
        totalValue,
        totalBook,
        holdingsCount: accountHoldings.length,
        linkedGoals: Array.from(linkedGoals),
      };
    });
  }, [accounts, holdings, goalLookup]);

  const filteredHoldings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let list = holdings;
    if (query) {
      list = holdings.filter((holding) =>
        `${holding.name} ${holding.code}`.toLowerCase().includes(query),
      );
    }

    const decorated = list.map((holding) => ({
      ...holding,
      value: computeHoldingValue(holding),
      gainLoss: computeHoldingGain(holding),
    }));

    decorated.sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      if (sortKey === "gainLoss") {
        return factor * (a.gainLoss - b.gainLoss);
      }
      return factor * (a.value - b.value);
    });

    return decorated;
  }, [holdings, searchTerm, sortKey, sortOrder]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredHoldings.length / pageSize));
  const paginatedHoldings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHoldings.slice(start, start + pageSize);
  }, [filteredHoldings, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const allocationByClass = useMemo(() => {
    const totals = new Map(allocationBuckets.map((bucket) => [bucket, 0]));
    holdings.forEach((holding) => {
      const value = computeHoldingValue(holding);
      if (value <= 0) {
        return;
      }
      const mix = holding.mix ?? {};
      const mixEntries = Object.entries(mix);
      if (!mixEntries.length) {
        totals.set("Alternatives", (totals.get("Alternatives") ?? 0) + value);
        return;
      }
      mixEntries.forEach(([label, percent]) => {
        const bucket =
          allocationBuckets.find(
            (candidate) =>
              candidate.toLowerCase() === label.toLowerCase().replace(/\s+/g, ""),
          ) ?? label;
        const amount = (percent / 100) * value;
        totals.set(bucket, (totals.get(bucket) ?? 0) + amount);
      });
    });
    const aggregate = Array.from(totals.entries());
    const grandTotal = aggregate.reduce((sum, [, amount]) => sum + amount, 0);
    return aggregate.map(([bucket, amount]) => ({
      bucket,
      amount,
      percent: grandTotal ? (amount / grandTotal) * 100 : 0,
    }));
  }, [holdings]);

  const topHoldings = useMemo(() => {
    return [...holdings]
      .map((holding) => ({ ...holding, value: computeHoldingValue(holding) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [holdings]);

  const totalInvested = holdings.reduce(
    (sum, holding) => sum + computeHoldingValue(holding),
    0,
  );
  const totalBookCost = holdings.reduce(
    (sum, holding) => sum + computeHoldingBookCost(holding),
    0,
  );
  const linkedGoalsValue = holdings.reduce((sum, holding) => {
    if (!holding.linkedGoalId) {
      return sum;
    }
    return sum + computeHoldingValue(holding);
  }, 0);
  const monthlyContribution = holdings.reduce(
    (sum, holding) => sum + (holding.monthlyContribution || 0),
    0,
  );

  const openAccountModal = () => {
    setAccountErrors({});
    setAccountForm({ ...defaultAccountForm });
    setIsAccountModalOpen(true);
  };

  const openHoldingModal = (accountId) => {
    setHoldingErrors({});
    setHoldingLookupInfo(null);
    setHoldingForm({
      ...defaultHoldingForm,
      accountId: accountId ?? "",
    });
    setIsHoldingModalOpen(true);
  };

  const validateAccountForm = () => {
    const errors = {};
    if (!accountForm.name.trim()) {
      errors.name = "Account name is required.";
    }
    if (!accountForm.wrapper) {
      errors.wrapper = "Select the account wrapper.";
    }
    if (!accountForm.currency) {
      errors.currency = "Choose a currency.";
    }
    return errors;
  };

  const validateHoldingForm = () => {
    const errors = {};
    if (!holdingForm.accountId) {
      errors.accountId = "Select the destination account.";
    }
    if (!holdingForm.assetType) {
      errors.assetType = "Choose an asset type.";
    }
    if (!holdingForm.code.trim()) {
      errors.code = "Enter the holding code.";
    }
    if (!holdingForm.units || Number(holdingForm.units) <= 0) {
      errors.units = "Units must be greater than zero.";
    }
    if (!holdingForm.currency) {
      errors.currency = "Choose a currency.";
    }
    return errors;
  };

  const handleAccountSubmit = (event) => {
    event.preventDefault();
    const errors = validateAccountForm();
    setAccountErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }
    const newAccount = {
      id: `acc-${Date.now()}`,
      name: accountForm.name.trim(),
      wrapper: accountForm.wrapper,
      institution: accountForm.institution.trim(),
      currency: accountForm.currency,
      cashBalance: Number.parseFloat(accountForm.cashBalance || 0) || 0,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setIsAccountModalOpen(false);
  };

  const handleHoldingSubmit = (event) => {
    event.preventDefault();
    const errors = validateHoldingForm();
    setHoldingErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }

    const units = Number.parseFloat(holdingForm.units);
    const avgCost = Number.parseFloat(holdingForm.avgCost || 0) || 0;
    const marketPrice =
      Number.parseFloat(holdingForm.marketPrice || 0) || avgCost || 0;
    const monthly = Number.parseFloat(holdingForm.monthlyContribution || 0) || 0;

    const newHolding = {
      id: `hold-${Date.now()}`,
      accountId: holdingForm.accountId,
      assetType: holdingForm.assetType,
      code: holdingForm.code.trim().toUpperCase(),
      name: holdingForm.name.trim() || holdingForm.code.trim().toUpperCase(),
      units,
      avgCost,
      marketPrice,
      currency: holdingForm.currency,
      linkedGoalId: holdingForm.linkedGoalId || "",
      monthlyContribution: monthly,
      mix: holdingLookupInfo?.mix ?? {},
    };
    setHoldings((prev) => [...prev, newHolding]);
    setIsHoldingModalOpen(false);
  };

  const handleLookupSecurity = async () => {
    const code = holdingForm.code.trim();
    if (!code) {
      setHoldingErrors((prev) => ({
        ...prev,
        code: "Enter a code before lookup.",
      }));
      return;
    }
    setIsLookupLoading(true);
    const info = await lookupSecurityMock(code);
    setHoldingLookupInfo(info);
    setHoldingForm((prev) => ({
      ...prev,
      name: prev.name || info.name,
    }));
    setIsLookupLoading(false);
  };

  const handleSortChange = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const handleRemoveAccount = (accountId) => {
    setAccounts((prev) => prev.filter((account) => account.id !== accountId));
    setHoldings((prev) =>
      prev.filter((holding) => holding.accountId !== accountId),
    );
  };

  const handleRemoveHolding = (holdingId) => {
    setHoldings((prev) => prev.filter((holding) => holding.id !== holdingId));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 pb-16 pt-6 sm:px-6 lg:px-12">
        <header className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-[#050814] px-6 py-8 shadow-xl shadow-emerald-900/20">
          <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-[150px]" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-blue-500/15 blur-[150px]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200/80">
                Assets workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white lg:text-4xl">
                Map every account and holding
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300/80">
                Add FundSERV mutual funds, ETFs, crypto wallets, or cash accounts, then connect
                them to your goals. Allocation and goal coverage stay in sync as you grow.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openAccountModal}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100 transition hover:brightness-110"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                </svg>
                Add account
              </button>
              <button
                type="button"
                onClick={() => openHoldingModal(accounts[0]?.id)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
                </svg>
                Add holding
              </button>
            </div>
          </div>
        </header>

        {goalsError ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {goalsError}
          </div>
        ) : null}

        <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-900/70 bg-slate-950/85 p-6 shadow-lg shadow-emerald-900/20">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Accounts</h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Consolidate holdings across institutions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-500/40 hover:text-white"
                >
                  New account
                </button>
              </header>

              {accountsWithTotals.length === 0 ? (
                <EmptyStateCard
                  title="You have no accounts yet."
                  description="Add your first investment account to start organising holdings."
                />
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {accountsWithTotals.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onAddHolding={() => openHoldingModal(account.id)}
                      onRemove={() => handleRemoveAccount(account.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-900/70 bg-slate-950/85 p-6 shadow-lg shadow-blue-900/20">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Holdings</h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Detailed view of every asset you track
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by code or name"
                      className="w-56 rounded-full border border-slate-900/60 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => openHoldingModal()}
                    className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-500/40 hover:text-white"
                  >
                    Add holding
                  </button>
                </div>
              </header>

              {holdings.length === 0 ? (
                <EmptyStateCard
                  title="No holdings tracked yet."
                  description="Add holdings to your accounts to see allocation, performance, and goal coverage."
                />
              ) : (
                <HoldingsTable
                  holdings={paginatedHoldings}
                  goalLookup={goalLookup}
                  accounts={accounts}
                  onRemove={handleRemoveHolding}
                  onSort={handleSortChange}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                />
              )}

              {holdings.length > 0 ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span>
                    Showing{" "}
                    <span className="text-slate-200">
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, filteredHoldings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="text-slate-200">{filteredHoldings.length}</span> holdings
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-full border border-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.3em] transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-500/40 hover:text-white"
                    >
                      Prev
                    </button>
                    <span className="rounded-full border border-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="rounded-full border border-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.3em] transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-emerald-500/40 hover:text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <SummaryPanel
              allocationByClass={allocationByClass}
              totalValue={totalInvested}
              totalBook={totalBookCost}
              linkedGoalsValue={linkedGoalsValue}
              topHoldings={topHoldings}
              goalLookup={goalLookup}
              monthlyContribution={monthlyContribution}
            />
            <AdditionalInsights holdings={holdings} accounts={accounts} />
          </aside>
        </div>
      </div>

      <AddAccountModal
        isOpen={isAccountModalOpen}
        form={accountForm}
        errors={accountErrors}
        onChange={(field, value) =>
          setAccountForm((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleAccountSubmit}
      />

      <AddHoldingModal
        isOpen={isHoldingModalOpen}
        form={holdingForm}
        errors={holdingErrors}
        onChange={(field, value) =>
          setHoldingForm((prev) => ({
            ...prev,
            [field]: value,
          }))
        }
        onClose={() => setIsHoldingModalOpen(false)}
        onSubmit={handleHoldingSubmit}
        onLookup={handleLookupSecurity}
        lookupInfo={holdingLookupInfo}
        isLookupLoading={isLookupLoading}
        accounts={accounts}
        goals={goals}
        loadingGoals={loadingGoals}
      />
    </DashboardLayout>
  );
}

function EmptyStateCard({ title, description }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-6 text-sm text-slate-400">
      <p className="font-medium text-slate-200">{title}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.3em]">{description}</p>
    </div>
  );
}

function AccountCard({ account, onAddHolding, onRemove }) {
  const badges = account.linkedGoals.map((name, index) => {
    const style = goalAccentStyles[index % goalAccentStyles.length];
    return { name, ...style };
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-br from-slate-950/85 to-slate-900/70 p-5 shadow-lg shadow-emerald-900/15">
      <div className="pointer-events-none absolute -right-14 bottom-0 h-32 w-32 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{account.wrapper}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{account.name}</h3>
            <p className="text-xs text-slate-400">
              {account.institution || "Institution — add later"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddHolding}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100 transition hover:brightness-110"
            >
              Add holding
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full border border-slate-900/60 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-500/40 hover:text-white"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Total value</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(account.totalValue, account.currency)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Book cost {formatCurrency(account.totalBook, account.currency)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Cash</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {formatCurrency(account.cashBalance, account.currency)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {account.holdingsCount} holdings tracked
            </p>
          </div>
        </div>
        {badges.length ? (
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-300">
            {badges.map((badge) => (
              <span
                key={badge.name}
                className={`rounded-full border ${badge.border} ${badge.bg} ${badge.text} px-3 py-1`}
              >
                {badge.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No linked goals yet — assign one when adding a holding.
          </p>
        )}
      </div>
    </div>
  );
}

function HoldingsTable({
  holdings,
  goalLookup,
  accounts,
  onRemove,
  onSort,
  sortKey,
  sortOrder,
}) {
  const accountMap = useMemo(() => {
    const map = new Map();
    accounts.forEach((account) => map.set(account.id, account));
    return map;
  }, [accounts]);

  const renderSortIndicator = (key) => {
    const active = sortKey === key;
    const direction = active && sortOrder === "asc" ? "rotate-180" : "";
    return (
      <svg
        className={`ml-1 inline h-3 w-3 transition ${active ? direction : "opacity-40"}`}
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4l3-3 3 3M3 8l3 3 3-3" />
      </svg>
    );
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/60 bg-slate-950/70">
      <table className="min-w-full divide-y divide-slate-900/60 text-sm text-slate-300">
        <thead className="bg-slate-950/70 text-[11px] uppercase tracking-[0.35em] text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Holding</th>
            <th className="px-4 py-3 text-left">Code</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-right">Units</th>
            <th className="px-4 py-3 text-right">
              <button
                type="button"
                onClick={() => onSort("value")}
                className="inline-flex items-center"
              >
                Value
                {renderSortIndicator("value")}
              </button>
            </th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3 text-right">Book cost</th>
            <th className="px-4 py-3 text-right">
              <button
                type="button"
                onClick={() => onSort("gainLoss")}
                className="inline-flex items-center"
              >
                Gain/Loss
                {renderSortIndicator("gainLoss")}
              </button>
            </th>
            <th className="px-4 py-3 text-left">Linked goal</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900/60">
          {holdings.map((holding) => {
            const account = accountMap.get(holding.accountId);
            const goal = holding.linkedGoalId
              ? goalLookup.get(String(holding.linkedGoalId))
              : null;
            const value = computeHoldingValue(holding);
            const book = computeHoldingBookCost(holding);
            const gain = value - book;
            const gainClass =
              gain > 0 ? "text-emerald-300" : gain < 0 ? "text-rose-300" : "text-slate-300";

            return (
              <tr key={holding.id} className="transition hover:bg-slate-900/40">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{holding.name}</span>
                    <span className="text-xs text-slate-500">
                      {account?.name || "Unassigned account"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {holding.code}
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {holding.assetType}
                </td>
                <td className="px-4 py-3 text-right">
                  {holding.units.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">
                  {formatCurrency(value, holding.currency)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(holding.marketPrice, holding.currency)}
                </td>
                <td className="px-4 py-3 text-right text-slate-400">
                  {formatCurrency(book, holding.currency)}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${gainClass}`}>
                  {formatCurrency(gain, holding.currency)}
                </td>
                <td className="px-4 py-3">
                  {goal ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100">
                      {goal.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(holding.id)}
                    className="rounded-full border border-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-500/40 hover:text-white"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryPanel({
  allocationByClass,
  totalValue,
  totalBook,
  linkedGoalsValue,
  topHoldings,
  goalLookup,
  monthlyContribution,
}) {
  const delta = totalValue - totalBook;
  const deltaClass =
    delta > 0 ? "text-emerald-300" : delta < 0 ? "text-rose-300" : "text-slate-300";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-900/60 bg-gradient-to-br from-slate-950/90 to-slate-900/75 p-6 shadow-lg shadow-emerald-900/15">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
          Snapshot
        </h3>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Portfolio value</p>
            <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(totalValue)}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Book cost {formatCurrency(totalBook)}</span>
            <span className={deltaClass}>
              {delta >= 0 ? "+" : ""}
              {formatCurrency(delta)}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-900/50 bg-slate-950/60 p-3 text-xs text-slate-400">
            <p>{formatCurrency(linkedGoalsValue)} of assets are linked directly to goals.</p>
            <p className="mt-2 text-slate-500">
              Monthly contributions queued: {formatCurrency(monthlyContribution)} on{" "}
              <span className="text-slate-300">1st of next month</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-900/60 bg-slate-950/80 p-6 shadow-lg shadow-blue-900/20">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
          Allocation by asset class
        </h3>
        <ul className="mt-4 space-y-3 text-xs text-slate-300">
          {allocationByClass.map((item) => (
            <li key={item.bucket}>
              <div className="flex items-center justify-between">
                <span>{item.bucket}</span>
                <span className="text-slate-400">{formatPercent(item.percent)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-900/60">
                <div
                  className={`h-full rounded-full ${allocationColors[item.bucket] ?? "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-slate-900/60 bg-slate-950/80 p-6 shadow-lg shadow-purple-900/20">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-200">
          Top holdings by value
        </h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {topHoldings.length === 0 ? (
            <li className="text-xs text-slate-500">Add holdings to populate this list.</li>
          ) : (
            topHoldings.map((holding) => {
              const goal = holding.linkedGoalId
                ? goalLookup.get(String(holding.linkedGoalId))
                : null;
              return (
                <li
                  key={holding.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-900/50 bg-slate-950/60 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{holding.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {holding.code} • {holding.assetType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(computeHoldingValue(holding), holding.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {goal ? `Goal: ${goal.name}` : "Goal: —"}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

function AdditionalInsights({ holdings, accounts }) {
  const totalAccounts = accounts.length;
  const totalHoldings = holdings.length;
  const cryptoCount = holdings.filter(
    (holding) => holding.assetType.toLowerCase() === "crypto",
  ).length;
  const cashCount = holdings.filter(
    (holding) => holding.assetType.toLowerCase() === "cash",
  ).length;

  return (
    <div className="rounded-3xl border border-slate-900/60 bg-slate-950/85 p-6 shadow-lg shadow-emerald-900/15">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
        Coach insights
      </h3>
      <ul className="mt-4 space-y-4 text-xs text-slate-400">
        <li className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
          {totalAccounts
            ? `You track ${totalAccounts} accounts with ${totalHoldings} holdings.`
            : "Add your first account to unlock fintech insights."}
        </li>
        <li className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-blue-100">
          {cryptoCount
            ? `Crypto sleeve: ${cryptoCount} holding${cryptoCount === 1 ? "" : "s"}.`
            : "Consider adding crypto wallets to capture the full picture."}
        </li>
        <li className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-100">
          {cashCount
            ? "Cash positions are tracked — monitor deployment alongside your DCA plan."
            : "Log cash or HISA positions to keep emergency funds visible."}
        </li>
      </ul>
    </div>
  );
}

function AddAccountModal({ isOpen, onClose, onSubmit, form, errors, onChange }) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-900/70 bg-slate-950/90 p-6 shadow-2xl shadow-emerald-900/25">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200/70">New account</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Add an investment account</h3>
            <p className="mt-2 text-xs text-slate-400">
              Track TFSAs, RRSPs, crypto wallets, or cash accounts in one workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add account modal"
            className="rounded-full border border-slate-900/60 bg-slate-950/60 p-2 text-slate-300 transition hover:border-rose-500/40 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form className="mt-6 space-y-4 text-sm" onSubmit={onSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="account-name">
              Account name *
            </label>
            <input
              id="account-name"
              type="text"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                errors.name ? "border-rose-500/40" : ""
              }`}
              placeholder="e.g. Wealthsimple TFSA"
              required
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-rose-300">{errors.name}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="account-wrapper">
                Wrapper *
              </label>
              <select
                id="account-wrapper"
                value={form.wrapper}
                onChange={(event) => onChange("wrapper", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.wrapper ? "border-rose-500/40" : ""
                }`}
                required
              >
                <option value="">Select wrapper</option>
                {wrapperOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.wrapper ? (
                <p className="mt-1 text-xs text-rose-300">{errors.wrapper}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="account-institution">
                Institution
              </label>
              <input
                id="account-institution"
                type="text"
                value={form.institution}
                onChange={(event) => onChange("institution", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. TD Direct Investing"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="account-currency">
                Currency *
              </label>
              <select
                id="account-currency"
                value={form.currency}
                onChange={(event) => onChange("currency", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.currency ? "border-rose-500/40" : ""
                }`}
                required
              >
                <option value="">Select currency</option>
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.currency ? (
                <p className="mt-1 text-xs text-rose-300">{errors.currency}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="account-cash">
                Cash balance
              </label>
              <input
                id="account-cash"
                type="number"
                min="0"
                step="0.01"
                value={form.cashBalance}
                onChange={(event) => onChange("cashBalance", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. 1,500.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-900/60 bg-slate-950/60 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500/40 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddHoldingModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  errors,
  onChange,
  onLookup,
  lookupInfo,
  isLookupLoading,
  accounts,
  goals,
  loadingGoals,
}) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-3xl rounded-3xl border border-slate-900/70 bg-slate-950/90 p-6 shadow-2xl shadow-blue-900/30">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/70">New holding</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Add an asset to your account</h3>
            <p className="mt-2 text-xs text-slate-400">
              Capture FundSERV codes, ETFs, stocks, or crypto positions. Link each asset to the goal it fuels.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add holding modal"
            className="rounded-full border border-slate-900/60 bg-slate-950/60 p-2 text-slate-300 transition hover:border-rose-500/40 hover:text-white"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form className="mt-6 space-y-5 text-sm" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-account">
                Account *
              </label>
              <select
                id="holding-account"
                value={form.accountId}
                onChange={(event) => onChange("accountId", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.accountId ? "border-rose-500/40" : ""
                }`}
                required
              >
                <option value="">Select a destination account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} • {account.wrapper}
                  </option>
                ))}
              </select>
              {errors.accountId ? (
                <p className="mt-1 text-xs text-rose-300">{errors.accountId}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-asset-type">
                Asset type *
              </label>
              <select
                id="holding-asset-type"
                value={form.assetType}
                onChange={(event) => onChange("assetType", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.assetType ? "border-rose-500/40" : ""
                }`}
                required
              >
                <option value="">Choose type</option>
                {assetTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.assetType ? (
                <p className="mt-1 text-xs text-rose-300">{errors.assetType}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-code">
                Code (FundSERV / Ticker) *
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="holding-code"
                  type="text"
                  value={form.code}
                  onChange={(event) => onChange("code", event.target.value)}
                  className={`w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white uppercase focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    errors.code ? "border-rose-500/40" : ""
                  }`}
                  placeholder="e.g. TDB900"
                  required
                />
                <button
                  type="button"
                  onClick={onLookup}
                  className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100 transition hover:brightness-125"
                >
                  {isLookupLoading ? "Looking…" : "Lookup"}
                </button>
              </div>
              {errors.code ? (
                <p className="mt-1 text-xs text-rose-300">{errors.code}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-name">
                Name
              </label>
              <input
                id="holding-name"
                type="text"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Automatically filled after lookup"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-units">
                Units *
              </label>
              <input
                id="holding-units"
                type="number"
                min="0"
                step="0.0001"
                value={form.units}
                onChange={(event) => onChange("units", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.units ? "border-rose-500/40" : ""
                }`}
                placeholder="e.g. 125.5"
                required
              />
              {errors.units ? (
                <p className="mt-1 text-xs text-rose-300">{errors.units}</p>
              ) : null}
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-avg-cost">
                Avg cost
              </label>
              <input
                id="holding-avg-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.avgCost}
                onChange={(event) => onChange("avgCost", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. 24.10"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-market-price">
                Market price
              </label>
              <input
                id="holding-market-price"
                type="number"
                min="0"
                step="0.01"
                value={form.marketPrice}
                onChange={(event) => onChange("marketPrice", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="e.g. 26.45"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-currency">
                Currency *
              </label>
              <select
                id="holding-currency"
                value={form.currency}
                onChange={(event) => onChange("currency", event.target.value)}
                className={`mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  errors.currency ? "border-rose-500/40" : ""
                }`}
                required
              >
                <option value="">Select currency</option>
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.currency ? (
                <p className="mt-1 text-xs text-rose-300">{errors.currency}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-goal">
                Linked goal
              </label>
              <select
                id="holding-goal"
                value={form.linkedGoalId}
                onChange={(event) => onChange("linkedGoalId", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">No goal linkage</option>
                {loadingGoals ? (
                  <option value="" disabled>
                    Loading goals…
                  </option>
                ) : (
                  goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500" htmlFor="holding-monthly">
                Monthly contribution
              </label>
              <input
                id="holding-monthly"
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyContribution}
                onChange={(event) => onChange("monthlyContribution", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Wrapper summary</label>
              <div className="mt-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
                Auto-sync with account on save.
              </div>
            </div>
          </div>

          {lookupInfo ? <SecurityLookupInfo lookupInfo={lookupInfo} /> : null}

          <div className="flex justify-end gap-3 pt-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-900/60 bg-slate-950/60 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500/40 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityLookupInfo({ lookupInfo }) {
  return (
    <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
      <p className="text-sm font-semibold text-white">{lookupInfo.name}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="uppercase tracking-[0.3em] text-blue-200/70">MER</p>
          <p className="mt-1 text-sm text-white">{lookupInfo.mer}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-blue-200/70">Risk</p>
          <p className="mt-1 text-sm text-white">{lookupInfo.risk}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-blue-200/70">Asset class</p>
          <p className="mt-1 text-sm text-white">{lookupInfo.assetClass}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="uppercase tracking-[0.3em] text-blue-200/70">Asset mix</p>
        <div className="mt-2 space-y-1">
          {Object.entries(lookupInfo.mix || {}).map(([bucket, percent]) => (
            <div key={bucket} className="flex items-center justify-between text-slate-200">
              <span>{bucket}</span>
              <span>{formatPercent(percent)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
