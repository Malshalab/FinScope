"use client";

export default function TransactionTable({ transactions }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-900/60 bg-slate-950/70 shadow-xl shadow-blue-900/10">
      <div className="flex items-center justify-between border-b border-slate-900/60 px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Ledger</h3>
          <p className="mt-1 text-sm text-slate-300/80">Latest activity synced a few moments ago</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          Reconciled
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs uppercase tracking-[0.3em] text-slate-500">
              <th className="px-6 py-4 text-left font-semibold">Date</th>
              <th className="px-6 py-4 text-left font-semibold">Description</th>
              <th className="px-6 py-4 text-left font-semibold">Category</th>
              <th className="px-6 py-4 text-right font-semibold">Amount</th>
              <th className="px-6 py-4 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="text-sm text-slate-300">
                <td className="whitespace-nowrap px-6 py-4 text-slate-400">{transaction.date}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{transaction.merchant}</span>
                    <span className="text-xs text-slate-500">{transaction.account}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/60 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200">
                    <span className={`h-2 w-2 rounded-full ${transaction.categoryAccent}`} />
                    {transaction.category}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold ${transaction.type === "credit" ? "text-emerald-300" : "text-rose-300"}`}>
                  {transaction.type === "credit" ? "+" : "-"}
                  {transaction.amount}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      transaction.status === "posted"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : transaction.status === "pending"
                        ? "bg-amber-500/15 text-amber-200"
                        : "bg-slate-500/15 text-slate-200"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {transaction.statusLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
