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
