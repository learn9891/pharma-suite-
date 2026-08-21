import Link from "next/link";
import { prisma } from "@/lib/db";
import BillingCounter from "@/components/BillingCounter";
import { inr, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const [medicines, sales] = await Promise.all([
    prisma.medicine.findMany({ where: { stockQty: { gt: 0 } }, orderBy: { name: "asc" } }),
    prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-10">
      <BillingCounter
        medicines={medicines.map((medicine) => ({
          id: medicine.id,
          name: medicine.name,
          genericName: medicine.genericName,
          batchNo: medicine.batchNo,
          unitPrice: medicine.unitPrice,
          gstRate: medicine.gstRate,
          stockQty: medicine.stockQty,
        }))}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent invoices</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {sales.map((sale) => (
            <li key={sale.id} className="flex flex-wrap justify-between gap-2 py-2">
              <Link href={`/billing/${sale.id}`} className="text-teal-700 hover:underline">
                {sale.invoiceNo} — {sale.customerName}
              </Link>
              <span className="text-slate-500">{shortDate(sale.createdAt)}</span>
              <span className="font-medium">{inr(sale.total)}</span>
            </li>
          ))}
          {sales.length === 0 && <li className="py-2 text-slate-500">No invoices yet.</li>}
        </ul>
      </section>
    </div>
  );
}
