"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inr } from "@/lib/format";
import Spinner from "@/components/Spinner";
import AnimatedNumber from "@/components/AnimatedNumber";

type BillableMedicine = {
  id: string;
  name: string;
  genericName: string;
  batchNo: string;
  unitPrice: number;
  gstRate: number;
  stockQty: number;
};

type CartLine = { medicine: BillableMedicine; quantity: number };

export default function BillingCounter({ medicines }: { medicines: BillableMedicine[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [discount, setDiscount] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return medicines
      .filter((medicine) => `${medicine.name} ${medicine.genericName}`.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [medicines, query]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, line) => sum + line.medicine.unitPrice * line.quantity, 0);
    const gst = cart.reduce(
      (sum, line) => sum + (line.medicine.unitPrice * line.quantity * line.medicine.gstRate) / 100,
      0,
    );
    const discountValue = Math.min(Number(discount) || 0, subtotal);
    return { subtotal, gst, discountValue, total: subtotal - discountValue + gst };
  }, [cart, discount]);

  function addToCart(medicine: BillableMedicine) {
    setCart((current) => {
      const existing = current.find((line) => line.medicine.id === medicine.id);
      if (existing) {
        return current.map((line) =>
          line.medicine.id === medicine.id
            ? { ...line, quantity: Math.min(line.quantity + 1, medicine.stockQty) }
            : line,
        );
      }
      return [...current, { medicine, quantity: 1 }];
    });
    setQuery("");
  }

  function setQuantity(id: string, quantity: number) {
    setCart((current) =>
      current
        .map((line) =>
          line.medicine.id === id
            ? { ...line, quantity: Math.max(0, Math.min(quantity, line.medicine.stockQty)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  async function checkout(event: React.FormEvent) {
    event.preventDefault();
    if (cart.length === 0) {
      setError("Add at least one medicine to the bill.");
      return;
    }
    setSaving(true);
    setError(null);
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerPhone,
        doctorName,
        paymentMode,
        discount: Number(discount) || 0,
        items: cart.map((line) => ({ medicineId: line.medicine.id, quantity: line.quantity })),
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not create the invoice");
      return;
    }
    const sale = (await response.json()) as { id: string };
    router.push(`/billing/${sale.id}`);
  }

  return (
    <form onSubmit={checkout} className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold">
          <span className="gradient-text">Billing counter</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">Search stock, build the bill, and GST is applied per item.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="card animate-fade-up p-5">
            <label className="block text-sm">
              <span className="block text-xs font-medium text-slate-600">Add medicine</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Type a brand or molecule"
                className="field"
              />
            </label>
            {matches.length > 0 && (
              <ul className="mt-2 animate-fade-up divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                {matches.map((medicine, index) => (
                  <li key={medicine.id} style={{ animationDelay: `${index * 40}ms` }} className="animate-fade-up">
                    <button
                      type="button"
                      onClick={() => addToCart(medicine)}
                      className="flex w-full justify-between px-3 py-2 text-left text-sm transition duration-200 hover:bg-teal-50/70 hover:pl-4"
                    >
                      <span>
                        {medicine.name}
                        <span className="ml-2 text-xs text-slate-500">
                          {medicine.genericName} · batch {medicine.batchNo} · {medicine.stockQty} in stock
                        </span>
                      </span>
                      <span>{inr(medicine.unitPrice)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">GST</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((line) => {
                  const net = line.medicine.unitPrice * line.quantity;
                  return (
                    <tr key={line.medicine.id} className="row-hover animate-fade-up">
                      <td className="px-4 py-3">
                        {line.medicine.name}
                        <span className="block text-xs text-slate-500">batch {line.medicine.batchNo}</span>
                      </td>
                      <td className="px-4 py-3">{inr(line.medicine.unitPrice)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={line.medicine.stockQty}
                          value={line.quantity}
                          aria-label={`Quantity of ${line.medicine.name}`}
                          onChange={(event) => setQuantity(line.medicine.id, Number(event.target.value))}
                          className="w-16 rounded-md border border-slate-300 px-2 py-1 transition duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        />
                      </td>
                      <td className="px-4 py-3">{line.medicine.gstRate}%</td>
                      <td className="px-4 py-3">{inr(net + (net * line.medicine.gstRate) / 100)}</td>
                    </tr>
                  );
                })}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      The bill is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card animate-fade-up space-y-4 p-5" style={{ animationDelay: "120ms" }}>
          <label className="block text-sm">
            <span className="block text-xs font-medium text-slate-600">Customer name</span>
            <input
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="block text-xs font-medium text-slate-600">Phone</span>
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="block text-xs font-medium text-slate-600">Prescriber</span>
            <input
              value={doctorName}
              onChange={(event) => setDoctorName(event.target.value)}
              className="field"
            />
          </label>
          <label className="block text-sm">
            <span className="block text-xs font-medium text-slate-600">Payment mode</span>
            <select
              value={paymentMode}
              onChange={(event) => setPaymentMode(event.target.value)}
              className="field"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="block text-xs font-medium text-slate-600">Discount (₹)</span>
            <input
              type="number"
              min={0}
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              className="field"
            />
          </label>

          <dl className="space-y-1 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{inr(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{inr(totals.discountValue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>GST</dt>
              <dd>{inr(totals.gst)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-teal-700">
                <AnimatedNumber value={totals.total} format={inr} duration={500} />
              </dd>
            </div>
          </dl>

          {error && <p className="animate-fade-up text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex w-full items-center justify-center gap-2"
          >
            {saving && <Spinner />}
            {saving ? "Generating..." : "Generate invoice"}
          </button>
        </div>
      </div>
    </form>
  );
}
