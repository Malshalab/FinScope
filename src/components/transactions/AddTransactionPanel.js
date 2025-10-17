"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addTransaction } from "../../api/transaction";

const categories = [
  "Groceries",
  "Dining",
  "Travel",
  "Wellness",
  "Subscriptions",
  "Income",
  "Utilities",
  "Transportation",
  "Other",
];

const statusOptions = [
  { value: "posted", label: "Posted" },
  { value: "pending", label: "Pending" },
  { value: "reconciled", label: "Reconciled" },
];

const transactionTypes = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" },
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

const statusAccentMap = {
  posted: "bg-emerald-400",
  pending: "bg-amber-400",
  reconciled: "bg-slate-300",
};

function OptionSelector({ label, value, options, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const activeOption = options.find((option) => option.value === value);

  useEffect(() => {
    let previousFocus;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        if (previousFocus instanceof HTMLElement) {
          previousFocus.focus();
        }
      }
    };

    if (isOpen) {
      previousFocus = document.activeElement;
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3 text-left text-sm text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
          isOpen ? "border-blue-500/40 shadow shadow-blue-900/30" : "hover:border-blue-500/30"
        }`}
      >
        <span className="flex items-center gap-2">
          {activeOption?.accent && <span className={`h-2.5 w-2.5 rounded-full ${activeOption.accent}`} />}
          <span>{activeOption?.label ?? "Select an option"}</span>
        </span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-200" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-3 overflow-hidden rounded-2xl border border-slate-900/70 bg-slate-950/95 shadow-xl shadow-blue-900/40">
          <ul className="max-h-60 overflow-y-auto py-2">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-blue-500/20 text-white"
                        : "text-slate-300 hover:bg-slate-900/70 hover:text-white"
                    }`}
                  >
                    {option.accent && <span className={`h-2.5 w-2.5 rounded-full ${option.accent}`} />}
                    <span className="flex-1 font-medium">{option.label}</span>
                    {isActive && (
                      <svg className="h-4 w-4 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AddTransactionPanel({ onCreate, onClose, className = "" }) {
  const [formData, setFormData] = useState({
    merchant: "",
    account: "",
    category: "Groceries",
    amount: "",
    type: "debit",
    status: "posted",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ tone: null, message: "" });

  const isValid = useMemo(() => {
    return Boolean(formData.merchant && formData.category && formData.amount && Number(formData.amount) > 0);
  }, [formData]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) {
      setFeedback({ tone: "warning", message: "Please fill in the required fields before submitting." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ tone: null, message: "" });

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      categoryAccent: categoryAccentMap[formData.category] ?? categoryAccentMap.Other,
      statusLabel: statusOptions.find((option) => option.value === formData.status)?.label ?? formData.status,
    };

    try {
      if (onCreate) {
        await onCreate(payload);
      }
      setFeedback({
        tone: "success",
        message: "Transaction captured. You'll see it reflected in the ledger momentarily.",
      });
      setFormData((prev) => ({
        ...prev,
        merchant: "",
        amount: "",
        notes: "",
      }));
    } catch (error) {
      setFeedback({
        tone: "error",
        message: "Something went wrong while saving the transaction. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-br from-slate-950/95 via-slate-900/70 to-[#050814] p-6 shadow-xl shadow-blue-900/25 ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-6 h-64 w-64 rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-52 w-52 rounded-full bg-indigo-500/20 blur-[140px]" />
      <div className="relative z-10 space-y-6">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-blue-200/70">Add Transaction</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Capture new activity in seconds</h2>
            <p className="mt-2 max-w-lg text-sm text-slate-300/80">
              Log expenses or incoming transfers with clean, contextual details. This keeps your ledger reconciled and
              insights sharp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
              Guided entry
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-800/60 bg-slate-950/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-blue-500/40 hover:text-white"
              >
                Close
              </button>
            )}
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-12">
          <label className="lg:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Merchant / Source</span>
            <div className="mt-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3 text-sm text-white transition focus-within:border-blue-500/50 focus-within:shadow focus-within:shadow-blue-900/30">
              <input
                value={formData.merchant}
                onChange={updateField("merchant")}
                placeholder="Nimbus Cloud Storage"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </label>

          <label className="lg:col-span-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Account</span>
            <div className="mt-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3 text-sm text-white transition focus-within:border-blue-500/50 focus-within:shadow focus-within:shadow-blue-900/30">
              <input
                value={formData.account}
                onChange={updateField("account")}
                placeholder="Visa •••• 2741"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </label>

          <OptionSelector
            className="lg:col-span-3"
            label="Category"
            value={formData.category}
            options={categories.map((category) => ({
              value: category,
              label: category,
              accent: categoryAccentMap[category] ?? categoryAccentMap.Other,
            }))}
            onChange={(nextCategory) => setFormData((prev) => ({ ...prev, category: nextCategory }))}
          />

          <label className="lg:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Date</span>
            <div className="mt-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3">
              <input
                type="date"
                value={formData.date}
                onChange={updateField("date")}
                className="w-full bg-transparent text-sm text-white focus:outline-none"
              />
            </div>
          </label>

          <label className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Amount</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3 text-sm text-white transition focus-within:border-blue-500/50 focus-within:shadow focus-within:shadow-blue-900/30">
              <span className="text-slate-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={updateField("amount")}
                placeholder="0.00"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </label>

          <fieldset className="lg:col-span-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Type</legend>
            <div className="mt-2 grid gap-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 p-2 sm:grid-cols-2">
              {transactionTypes.map((entry) => {
                const active = formData.type === entry.value;
                return (
                  <button
                    key={entry.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: entry.value }))}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold tracking-[0.2em] transition ${
                      active
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow shadow-blue-900/40"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <OptionSelector
            className="lg:col-span-3"
            label="Status"
            value={formData.status}
            options={statusOptions.map((option) => ({
              ...option,
              accent: statusAccentMap[option.value],
            }))}
            onChange={(nextStatus) => setFormData((prev) => ({ ...prev, status: nextStatus }))}
          />

          <label className="lg:col-span-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Notes</span>
            <div className="mt-2 rounded-2xl border border-slate-900/60 bg-slate-950/70 px-4 py-3 text-sm text-white transition focus-within:border-blue-500/50 focus-within:shadow focus-within:shadow-blue-900/30">
              <textarea
                rows={3}
                value={formData.notes}
                onChange={updateField("notes")}
                placeholder="Add context, receipts, or tags so you remember the story behind this transaction."
                className="w-full resize-none bg-transparent focus:outline-none"
              />
            </div>
          </label>

          <div className="lg:col-span-6 flex flex-col justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Add transaction"}
            </button>
            <p className="text-xs text-slate-500">
              We’ll auto-categorise based on your previous activity. You can always adjust after it syncs.
            </p>
          </div>
        </form>

        {feedback.message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : feedback.tone === "warning"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                : "border-rose-500/30 bg-rose-500/10 text-rose-100"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </section>
  );
}
