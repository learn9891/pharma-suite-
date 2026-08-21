"use client";

import { useMemo, useState } from "react";
import { inr, shortDate, daysUntil } from "@/lib/format";
import type { MedicineDTO } from "@/types";
import Toast, { type ToastState } from "@/components/Toast";
import Spinner from "@/components/Spinner";
import AnimatedNumber from "@/components/AnimatedNumber";

type Filter = "all" | "low" | "expiring";

const EMPTY_FORM = {
  name: "",
  genericName: "",
  manufacturer: "",
  category: "Tablet",
  batchNo: "",
  hsnCode: "3004",
  unitPrice: "",
  gstRate: "12",
  stockQty: "",
  reorderLevel: "20",
  expiryDate: "",
  rxRequired: false,
};

export default function StockManager({
  initialMedicines,
  initialFilter,
}: {
  initialMedicines: MedicineDTO[];
  initialFilter: Filter;
}) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function flash(message: string, tone: "success" | "error" = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return medicines.filter((medicine) => {
      if (needle && !`${medicine.name} ${medicine.genericName}`.toLowerCase().includes(needle)) return false;
      if (filter === "low") return medicine.stockQty <= medicine.reorderLevel;
      if (filter === "expiring") return daysUntil(medicine.expiryDate) <= 90;
      return true;
    });
  }, [medicines, query, filter]);

  async function addMedicine(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      setError("Could not save the medicine. Check every field, especially price, quantity and expiry date.");
      return;
    }
    const created = (await response.json()) as MedicineDTO;
    setMedicines((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(EMPTY_FORM);
    flash(`${created.name} added to stock`);
  }

  async function adjustStock(medicine: MedicineDTO, delta: number) {
    const stockQty = Math.max(0, medicine.stockQty + delta);
    setBusyId(medicine.id);
    const response = await fetch(`/api/medicines/${medicine.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQty }),
    });
    setBusyId(null);
    if (!response.ok) {
      flash("Stock update failed", "error");
      return;
    }
    setMedicines((current) => current.map((item) => (item.id === medicine.id ? { ...item, stockQty } : item)));
    flash(`${medicine.name} stock set to ${stockQty}`);
  }

  async function removeMedicine(id: string) {
    setBusyId(id);
    const response = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      flash("Could not delete this medicine", "error");
      return;
    }
    setMedicines((current) => current.filter((item) => item.id !== id));
    flash("Medicine removed");
  }

  return (
    <div className="space-y-8">
      <Toast toast={toast} />
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold">
            <span className="gradient-text">Stock</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            <AnimatedNumber value={visible.length} /> of {medicines.length} SKUs shown
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or molecule"
            className="rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm transition duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          {(["all", "low", "expiring"] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition duration-200 active:scale-95 ${
                filter === option
                  ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-sm"
                  : "border border-slate-300 bg-white/70 text-slate-700 hover:border-teal-400 hover:text-teal-700"
              }`}
            >
              {option === "all" ? "All" : option === "low" ? "Low stock" : "Expiring"}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">MRP</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((medicine, index) => {
              const low = medicine.stockQty <= medicine.reorderLevel;
              const days = daysUntil(medicine.expiryDate);
              return (
                <tr
                  key={medicine.id}
                  style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
                  className={`row-hover animate-fade-up ${busyId === medicine.id ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-xs text-slate-500">
                      {medicine.genericName} · {medicine.manufacturer}
                    </p>
                    {medicine.rxRequired && (
                      <span className="mt-1 inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                        Rx only
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{medicine.batchNo}</td>
                  <td className={`px-4 py-3 ${days <= 90 ? "text-amber-600" : ""}`}>
                    {shortDate(medicine.expiryDate)}
                    {days <= 90 && <span className="block text-xs">{days} days left</span>}
                  </td>
                  <td className="px-4 py-3">{inr(medicine.unitPrice)}</td>
                  <td className="px-4 py-3">{medicine.gstRate}%</td>
                  <td className={`px-4 py-3 font-medium ${low ? "text-rose-600" : ""}`}>
                    {medicine.stockQty}
                    {low && <span className="block text-xs">below reorder level {medicine.reorderLevel}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label={`Add stock to ${medicine.name}`}
                        onClick={() => adjustStock(medicine, 10)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs transition duration-200 hover:border-teal-400 hover:text-teal-700 active:scale-90"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        aria-label={`Reduce stock of ${medicine.name}`}
                        onClick={() => adjustStock(medicine, -10)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs transition duration-200 hover:border-amber-400 hover:text-amber-700 active:scale-90"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedicine(medicine.id)}
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 transition duration-200 hover:bg-rose-50 active:scale-90"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No medicine matches this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={addMedicine} className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add medicine</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "name", label: "Brand name", type: "text" },
            { key: "genericName", label: "Molecule", type: "text" },
            { key: "manufacturer", label: "Manufacturer", type: "text" },
            { key: "category", label: "Form", type: "text" },
            { key: "batchNo", label: "Batch number", type: "text" },
            { key: "hsnCode", label: "HSN code", type: "text" },
            { key: "unitPrice", label: "MRP per unit", type: "number" },
            { key: "gstRate", label: "GST %", type: "number" },
            { key: "stockQty", label: "Quantity", type: "number" },
            { key: "reorderLevel", label: "Reorder level", type: "number" },
            { key: "expiryDate", label: "Expiry date", type: "date" },
          ].map((field) => (
            <label key={field.key} className="text-sm">
              <span className="block text-xs font-medium text-slate-600">{field.label}</span>
              <input
                required
                type={field.type}
                step={field.type === "number" ? "any" : undefined}
                value={String(form[field.key as keyof typeof form] ?? "")}
                onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                className="field"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={form.rxRequired}
              onChange={(event) => setForm((current) => ({ ...current, rxRequired: event.target.checked }))}
            />
            Prescription required
          </label>
        </div>
        {error && <p className="mt-3 animate-fade-up text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary mt-4 inline-flex items-center gap-2">
          {saving && <Spinner />}
          {saving ? "Saving..." : "Add to stock"}
        </button>
      </form>
    </div>
  );
}
