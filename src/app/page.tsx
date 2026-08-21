import Link from "next/link";
import { prisma } from "@/lib/db";
import { inr, shortDate } from "@/lib/format";

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

  const cards = [
    { label: "SKUs in catalogue", value: String(medicines.length), href: "/stock" },
    { label: "Low stock items", value: String(lowStock.length), href: "/stock?filter=low" },
    { label: "Expiring in 90 days", value: String(expiring.length), href: "/stock?filter=expiring" },
    { label: "Sales today", value: inr(todayRevenue), href: "/billing" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Pharmacy dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Inventory value on shelf: <span className="font-medium">{inr(stockValue)}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-500"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Reorder now</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {lowStock.slice(0, 6).map((medicine) => (
              <li key={medicine.id} className="flex justify-between py-2">
                <span>{medicine.name}</span>
                <span className="font-medium text-rose-600">
                  {medicine.stockQty} left / reorder at {medicine.reorderLevel}
                </span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="py-2 text-slate-500">Every item is above its reorder level.</li>}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expiry watchlist</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {expiring.map((medicine) => (
              <li key={medicine.id} className="flex justify-between py-2">
                <span>
                  {medicine.name} <span className="text-slate-500">batch {medicine.batchNo}</span>
                </span>
                <span className="font-medium text-amber-600">{shortDate(medicine.expiryDate)}</span>
              </li>
            ))}
            {expiring.length === 0 && <li className="py-2 text-slate-500">No batch expires in the next 90 days.</li>}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent invoices</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {recentSales.map((sale) => (
            <li key={sale.id} className="flex justify-between py-2">
              <Link href={`/billing/${sale.id}`} className="text-teal-700 hover:underline">
                {sale.invoiceNo} — {sale.customerName}
              </Link>
              <span className="font-medium">{inr(sale.total)}</span>
            </li>
          ))}
          {recentSales.length === 0 && <li className="py-2 text-slate-500">No invoices yet.</li>}
        </ul>
      </section>
    </div>
  );
}
