# FinScope

# 🧠💸 FinScope – AI-Powered Investment & Wealth Optimization Hub

FinScope is a full-stack AI-powered personal finance and investment platform designed to help users track their net worth, analyze their portfolio, and receive intelligent, personalized investment insights — all in one secure dashboard.

Built to showcase advanced fintech capabilities, applied AI reasoning, and scalable architecture for real-world finance.

---

## 🚀 Features

### 🧠 AI-Powered Insights
- **Portfolio Summarizer** – GPT-4 interprets your current asset allocation and highlights imbalances.
- **Spending ↔ Investment Optimizer** – See how past expenses could have impacted your investment growth.
- **Simulated Returns** – Run simple projections based on savings reallocation or market trends.
- **Custom Report Generator** – Ask questions like:  
  _“Why did my portfolio drop this month?”_ or  
  _“How much interest am I missing by not investing idle cash?”_

### 📈 Real-Time Finance Tracking
- Sync accounts via **Plaid** or **Teller**
- Pull in investments via **Alpaca**, **Yodlee**, or **CoinGecko**
- Visualize portfolio performance and net worth trends

### 🔐 Secure and Scalable Architecture
- Full **Row-Level Security** with Supabase Auth
- Real-time vector search using **pgvector** (or FAISS)
- Containerized backend with **Docker** and **Railway**
- Deployed frontend on **Vercel**

---

## 🧱 Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Frontend    | Next.js, Tailwind CSS, Recharts/D3.js           |
| Backend     | Python (FastAPI), Supabase                      |
| AI / LLM    | GPT-4 (OpenAI API), Optional: FinGPT / Phi-3     |
| Finance APIs| Plaid, Alpaca, Yodlee, CoinGecko                 |
| Auth / DB   | Supabase, Postgres + pgvector                   |
| Infra       | Docker, Railway (API), Vercel (UI)              |

---

## 📂 Folder Structure
