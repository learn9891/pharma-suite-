---
name: testing-pharma-suite
description: How to set up, run and end-to-end test the PharmaSuite Next.js 14 + Prisma/SQLite pharmacy app (stock, prescription analyser, assistant, billing, dashboard) in a browser.
---

# Testing PharmaSuite locally

## Setup
```bash
cd /home/ubuntu/repos/pharma-suite
npm install
printf 'DATABASE_URL="file:./dev.db"\n' > .env      # only if missing
npx prisma migrate dev
npx tsx prisma/seed.ts                              # 20 medicines + demo invoices
npm run dev                                          # http://localhost:3000, no auth
```
- No `OPENAI_API_KEY` is expected: the AI assistant must fall back to the built-in rule
  engine and the page should say so. Do not add a key when testing this path.
- If the dev server logs `Error: Cannot find module './948.js'` (or any missing chunk)
  after pulling new commits, stop it, `rm -rf .next`, and restart. Otherwise routes can
  return 500 for reasons unrelated to the change under test.
- Re-running `prisma/seed.ts` resets/duplicates state; if dashboard numbers suddenly
  change mid-run (e.g. SKU count drops), stop, re-check the DB with a quick Prisma
  query, and restart the run — otherwise the evidence is not trustworthy.

## Verifying seeded expectations before asserting in the UI
Query the DB rather than trusting memory, e.g.
```bash
npx tsx -e 'import{PrismaClient}from"@prisma/client";const p=new PrismaClient();p.medicine.findMany().then(m=>{console.log(m.length);console.log(m.filter(x=>x.stockQty<=x.reorderLevel).map(x=>[x.name,x.stockQty,x.reorderLevel]))}).finally(()=>p.$disconnect())'
```
A clean seed gives 20 SKUs, 3 low-stock (Voveran 50, Omez 20, Warf 5), 2 expiring in
90 days, stock value ₹18,442.80, Dolo 650 = 470, Warf 5 = 25.

## Gotchas found while testing
- **Stale data after mutations on client-side navigation.** After generating an invoice,
  soft-navigating to `/stock` can still show the pre-sale quantity (Next.js router cache).
  Hard-reload (`ctrl+shift+r`) before asserting decrements; the same applies to dashboard
  KPIs after any write.
- **Prescription analyser requires `Patient name`.** Submitting with an empty patient
  field only shows the browser "Please fill out this field" tooltip and never calls the
  API — fill it before asserting on parse/alert output.
- **Animated counters (`AnimatedNumber`) start at 0** and ease to the real value over
  ~900 ms. To prove animation, take two screenshots back-to-back right after load and
  compare intermediate values; assert final values only after ~1.5 s.
- **Duplicate-therapy alerts** are not produced by the built-in sample prescription. To
  exercise that rule, paste two drugs of the same class yourself (e.g. two PPIs such as
  Omez 20 and Pantop 40).
- The assistant only answers for molecules present in the local formulary; unknown drugs
  (e.g. insulin) return a graceful fallback rather than a real answer — do not treat that
  as a bug without checking `src/lib` formulary/rule data.
- Print testing: `Print invoice` opens the native Chrome print preview; the nav bar is
  `print:hidden`, so verify it is absent from the preview, then press Escape to close.

## Devin Secrets Needed
None. The app has no auth and deliberately runs without `OPENAI_API_KEY`.
