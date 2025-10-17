This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Frontend (Next.js)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the UI. Edit files under `src/` and the page auto-updates.

### Backend (FastAPI)

1. Create a virtual environment and install dependencies:

   ```bash
   cd services/backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Start the API server:

   ```bash
   uvicorn services.backend.main:app --reload
   ```

Point your HTTP client at [http://localhost:8000](http://localhost:8000). FastAPI routes live under `services/backend/routers`.

> If your editor reports missing imports such as `pydantic`, ensure it is using the `.venv` interpreter created above.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# 🧠💸 FinScope – AI-Powered Investment & Wealth Optimization Hub

FinScope is a **full-stack AI-powered personal finance and investment platform** designed to help users track their net worth, analyze their portfolio, and receive intelligent, personalized investment insights — all in one secure dashboard.

Built to showcase advanced **fintech capabilities**, **applied AI reasoning**, and **scalable architecture** for real-world finance.

---

## 🚀 Features

### 🧠 AI-Powered Insights
- **Portfolio Summarizer** — GPT-4 interprets your asset allocation and flags imbalances.
- **Spending ↔ Investment Optimizer** — See how past expenses could have impacted growth.
- **Simulated Returns** — Run projections based on savings reallocation or market trends.
- **Custom Report Generator** — Ask questions like:
  - “Why did my portfolio drop this month?”
  - “How much interest am I missing by not investing idle cash?”

### 📈 Real-Time Finance Tracking
- Sync accounts via **Plaid** or **Teller**.
- Pull investments from **Alpaca**, **Yodlee**, or **CoinGecko**.
- Visualize portfolio performance and net worth trends.

### 🔐 Secure & Scalable Architecture
- **Row-Level Security** with Supabase Auth.
- Real-time vector search using **pgvector** or FAISS.
- Containerized backend with **Docker** + **Railway**.
- Deployed frontend on **Vercel**.

---

## 🏗️ Detailed Feature Roadmap

### Core (MVP)
1. **Secure User Accounts & Profiles**
   - Email/password authentication (JWT or OAuth).
   - Two-Factor Authentication (2FA).
   - User preferences for currency and country.

2. **Net Worth Tracker**
   - Link accounts or manually enter assets (cash, stocks, crypto, real estate, loans).
   - Visual net worth dashboard — line & pie charts.
   - Asset categorization (liquid vs non-liquid).

3. **Portfolio Aggregation & Analytics**
   - Integrate brokerages / crypto exchanges (Plaid, Binance API, Coinbase, Alpaca).
   - Real-time portfolio value and allocation (sector, asset class, region).
   - Historical performance tracking (gain/loss, ROI, dividends).

4. **Transaction History**
   - Automated imports or CSV uploads.
   - Tagging & categorization (salary, rent, subscriptions, investments).
   - Monthly & quarterly summaries.

---

### Intelligence & AI Insights
5. **Investment Health Check**
   - Risk analysis (volatility, diversification, asset correlation).
   - AI suggestions for rebalancing based on time horizon & goals.

6. **Cash Flow Forecasting**
   - Predict upcoming expenses and income.
   - “What if” simulations (e.g., “What if I invest $500 more per month?”).

7. **Goal-Based Planning**
   - Set targets (buy a house, retire early, save for a trip).
   - Auto-calculate required contributions and show progress.

8. **AI Investment Recommendations**
   - Natural language queries (“How can I reduce my portfolio risk?”).
   - Personalized asset suggestions (stocks, ETFs, crypto).
   - Drift & concentration alerts.

---

### Automation & Integrations
9. **Smart Alerts & Notifications**
   - Stock target price alerts.
   - Overspending warnings.
   - Tax-loss harvesting reminders.

10. **Open Banking & API Integrations**
    - Plaid / Yodlee for account aggregation.
    - Brokerage APIs for trades & holdings.
    - Tax report export (TurboTax/Wealthsimple friendly).

11. **Multi-Currency & Localization**
    - Live FX conversion for global portfolios.
    - Region-specific tax insights.

---

### Advanced Add-Ons
12. **AI Chat & Financial Assistant**
    - Ask “How’s my net worth vs inflation?” or “Should I rebalance?”
    - Plain-English portfolio explanations.

13. **Alternative Investment Tracking**
    - Real estate, collectibles, private equity.
    - Valuation APIs (Zillow, NFT pricing oracles).

14. **Tax Optimization & Reporting**
    - Auto capital gains/loss reports.
    - Tax bracket forecasting.

15. **Social & Community Features**
    - Compare against anonymized peer benchmarks.
    - Share goals or allocation trends anonymously.

---

## 🌟 Learning & Implementation Roadmap

If you’re building **FinScope** to **maximize full-stack skills**:

- ✅ **Phase 1 — MVP**: Auth → Net Worth → Portfolio Aggregation → Charts  
- ✅ **Phase 2 — AI**: Risk analysis, recommendations, chat assistant  
- ✅ **Phase 3 — Automation**: Smart alerts, cash flow, notifications  
- ✅ **Phase 4 — Integrations**: Brokerage APIs, tax tools, multi-currency support  

---

## 🛠️ Tech Stack

- **Frontend** — Next.js, React, TailwindCSS  
- **Backend** — Python FastAPI *(or Node.js alternative)*  
- **Database** — PostgreSQL + Prisma / SQLAlchemy  
- **Auth & Security** — Supabase / JWT / OAuth  
- **AI Layer** — OpenAI API, LangChain, pgvector  
- **Infra & Deployment** — Docker, Railway, Vercel

---

## 🚦 Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/finscope.git
cd finscope

# Install dependencies
npm install    # or yarn

# Set up environment variables
cp .env.example .env

# Run the dev server
npm run dev
