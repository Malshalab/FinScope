"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Jan", money: 4000 },
  { name: "Feb", money: 3000 },
  { name: "Mar", money: 5000 },
  { name: "Apr", money: 4780 },
  { name: "May", money: 5890 },
  { name: "Jun", money: 4390 },
  { name: "Jul", money: 6490 },
];

export default function MoneyLineChart() {
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-3xl border border-slate-900/40 bg-gradient-to-br from-slate-900/70 via-slate-950 to-slate-950/70 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-blue-200/70">Money trend</p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Year-to-date cashflow</h2>
        </div>
        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-100">Updated weekly</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 24, right: 16, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorMoney" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="#60a5fa"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="#1d4ed8"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#1e40af"
            tick={{ fill: "#cbd5f5", fontWeight: 500, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#1e40af"
            tick={{ fill: "#cbd5f5", fontWeight: 500, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.85)",
              borderRadius: "12px",
              border: "1px solid rgba(96, 165, 250, 0.35)",
              color: "#e2e8f0",
              fontSize: 13,
            }}
            cursor={{ stroke: "rgba(96,165,250,0.5)", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="money"
            stroke="#60a5fa"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#0f172a",
              stroke: "#60a5fa",
              strokeWidth: 3,
            }}
            activeDot={{
              r: 7,
              fill: "#60a5fa",
              stroke: "#0f172a",
              strokeWidth: 2,
            }}
            fillOpacity={1}
            fill="url(#colorMoney)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
