import Link from "next/link";
import { prisma } from "@/lib/db";
import { inr, shortDate, daysUntil } from "@/lib/format";
import Reveal from "@/components/Reveal";
import StatCard, { type Stat } from "@/components/StatCard";
import AnimatedNumber from "@/components/AnimatedNumber";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const soon = new Date(Date.now() + 90 * 86_400_000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [medicines, expiring, todaySales, recentSales] = await Promise.all([
    prisma.medicine.findMany({ orderBy: { stockQty: "asc" } }),
    prisma.medicine.findMany({ where: { expiryDate: { lte: soon } }, orderBy: { expiryDate: "asc" }, take: 6 }),
    prisma.sale.findMany({ where: { createdAt: { gte: startOfToday } } }),
    prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const lowStock = medicines.filter((medicine) => medicine.stockQty <= medicine.reorderLevel);
  const stockValue = medicines.reduce((sum, medicine) => sum + medicine.unitPrice * medicine.stockQty, 0);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const stats: Stat[] = [
    { label: "SKUs in catalogue", value: medicines.length, href: "/stock", kind: "count", tone: "teal" },
    { label: "Low stock items", value: lowStock.length, href: "/stock?filter=low", kind: "count", tone: "rose" },
    { label: "Expiring in 90 days", value: expiring.length, href: "/stock?filter=expiring", kind: "count", tone: "amber" },
    { label: "Sales today", value: todayRevenue, href: "/billing", kind: "currency", tone: "sky" },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-teal-600 via-teal-500 to-sky-600 p-8 text-white shadow-lg">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative animate-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Pharmacy control room</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Everything on the counter, in one view</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85">
            Inventory on shelf is worth{" "}
            <span className="font-semibold">
              <AnimatedNumber value={stockValue} format="currency" />
            </span>
            . Track stock, analyse prescriptions, ask the assistant and bill with GST — without leaving the app.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/billing"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              New bill
            </Link>
            <Link
              href="/prescriptions"
              className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-white/10"
            >
              Analyse a prescription
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="relative">
            <StatCard stat={stat} index={index} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <section className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reorder now</h2>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {lowStock.slice(0, 6).map((medicine, index) => (
                <li
                  key={medicine.id}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="row-hover flex animate-fade-up justify-between rounded px-2 py-2"
                >
                  <span>{medicine.name}</span>
                  <span className="font-medium text-rose-600">
                    {medicine.stockQty} left / reorder at {medicine.reorderLevel}
                  </span>
                </li>
              ))}
              {lowStock.length === 0 && <li className="py-2 text-slate-500">Every item is above its reorder level.</li>}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expiry watchlist</h2>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {expiring.map((medicine, index) => (
                <li
                  key={medicine.id}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="row-hover flex animate-fade-up justify-between rounded px-2 py-2"
                >
                  <span>
                    {medicine.name} <span className="text-slate-500">batch {medicine.batchNo}</span>
                  </span>
                  <span className="font-medium text-amber-600">
                    {shortDate(medicine.expiryDate)}
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {daysUntil(medicine.expiryDate)}d
                    </span>
                  </span>
                </li>
              ))}
              {expiring.length === 0 && <li className="py-2 text-slate-500">No batch expires in the next 90 days.</li>}
            </ul>
          </section>
        </Reveal>
      </div>

      <Reveal delay={80}>
        <section className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent invoices</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {recentSales.map((sale, index) => (
              <li
                key={sale.id}
                style={{ animationDelay: `${index * 70}ms` }}
                className="row-hover flex animate-fade-up justify-between rounded px-2 py-2"
              >
                <Link href={`/billing/${sale.id}`} className="font-medium text-teal-700 hover:underline">
                  {sale.invoiceNo} — {sale.customerName}
                </Link>
                <span className="font-medium">{inr(sale.total)}</span>
              </li>
            ))}
            {recentSales.length === 0 && <li className="py-2 text-slate-500">No invoices yet.</li>}
          </ul>
        </section>
      </Reveal>
    </div>
  );
}
