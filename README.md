# PharmaSuite

Retail pharmacy operations app: stock, prescription analysis, an AI pharma assistant and GST billing.

## Modules

- **Dashboard** (`/`) — stock value, low-stock and expiry watchlists, today's sales, recent invoices.
- **Stock** (`/stock`) — add/delete medicines, quick stock adjustments, search, low-stock and expiry filters. Tracks batch, HSN, MRP, GST rate, reorder level, expiry and Rx flag.
- **Prescription analyser** (`/prescriptions`) — parses free-text prescriptions line by line into molecule, strength, frequency and duration; computes the quantity to dispense; flags interactions, duplicate therapy, dose-limit breaches and missing directions; matches every line against live stock.
- **AI assistant** (`/assistant`) — chat for dosing, interactions, storage and regulatory questions, grounded in current stock. Uses OpenAI when `OPENAI_API_KEY` is set, otherwise a built-in pharmacy rule engine so the feature works offline.
- **Billing** (`/billing`) — search stock, build a cart, apply discount, per-item GST, invoice generation with stock decrement in a transaction, printable invoice at `/billing/<id>`.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite · Zod

## Getting started

```bash
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
npx prisma migrate dev
npx tsx prisma/seed.ts        # 20 sample medicines
npm run dev                   # http://localhost:3000
```

Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4o-mini`) in `.env` to enable LLM answers in the assistant.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET/POST | `/api/medicines` | list (`?q=`) / create |
| PATCH/DELETE | `/api/medicines/:id` | update / delete |
| GET/POST | `/api/prescriptions` | history / analyse and store |
| POST | `/api/agent` | assistant reply, `{ answer, engine }` |
| GET/POST | `/api/sales` | invoice list / create invoice |

## Clinical data

`src/lib/drug-knowledge.ts` holds the local formulary (21 molecules with brands, class, adult dose, daily maximum, cautions) and the interaction rules. Extend those arrays to widen coverage. The output is decision support only — a pharmacist must confirm every clinical decision.
