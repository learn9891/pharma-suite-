import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { inr, shortDate } from "@/lib/format";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!sale) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/billing" className="text-sm text-teal-700 hover:underline">
          ← Back to billing
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="flex flex-wrap justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold">PharmaSuite Chemists</h1>
            <p className="text-sm text-slate-600">GSTIN 29ABCDE1234F1Z5 · DL 20B/21B-1234</p>
          </div>
          <div className="text-sm">
            <p className="font-medium">{sale.invoiceNo}</p>
            <p className="text-slate-600">{shortDate(sale.createdAt)}</p>
            <p className="text-slate-600">{sale.paymentMode}</p>
          </div>
        </div>

        <div className="grid gap-2 py-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Customer: </span>
            {sale.customerName}
            {sale.customerPhone ? ` · ${sale.customerPhone}` : ""}
          </p>
          <p>
            <span className="text-slate-500">Prescriber: </span>
            {sale.doctorName ?? "—"}
          </p>
        </div>

        <table className="w-full text-sm">
          <thead className="border-y border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2">Batch</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Rate</th>
              <th className="py-2">GST</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.batchNo}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{inr(item.unitPrice)}</td>
                <td className="py-2">{item.gstRate}%</td>
                <td className="py-2 text-right">{inr(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{inr(sale.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>-{inr(sale.discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>GST</dt>
            <dd>{inr(sale.gstAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{inr(sale.total)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-slate-500">
          Prescription drugs dispensed against a valid prescription. Goods once sold are not returnable except as per the
          Drugs and Cosmetics Act.
        </p>
      </div>
    </div>
  );
}
