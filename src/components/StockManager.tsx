"use client";

import { useMemo, useState } from "react";
import { inr, shortDate, daysUntil } from "@/lib/format";
import type { MedicineDTO } from "@/types";

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
  }

  async function adjustStock(medicine: MedicineDTO, delta: number) {
    const stockQty = Math.max(0, medicine.stockQty + delta);
    const response = await fetch(`/api/medicines/${medicine.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQty }),
    });
    if (!response.ok) return;
    setMedicines((current) => current.map((item) => (item.id === medicine.id ? { ...item, stockQty } : item)));
  }

  async function removeMedicine(id: string) {
    const response = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setMedicines((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Stock</h1>
          <p className="mt-1 text-sm text-slate-600">{visible.length} of {medicines.length} SKUs shown</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or molecule"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          {(["all", "low", "expiring"] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded px-3 py-2 text-sm font-medium ${
                filter === option ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {option === "all" ? "All" : option === "low" ? "Low stock" : "Expiring"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
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
            {visible.map((medicine) => {
              const low = medicine.stockQty <= medicine.reorderLevel;
              const days = daysUntil(medicine.expiryDate);
              return (
                <tr key={medicine.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-xs text-slate-500">
                      {medicine.genericName} · {medicine.manufacturer}
                      {medicine.rxRequired ? " · Rx" : ""}
                    </p>
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
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        aria-label={`Reduce stock of ${medicine.name}`}
                        onClick={() => adjustStock(medicine, -10)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedicine(medicine.id)}
                        className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-600"
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

      <form onSubmit={addMedicine} className="rounded-lg border border-slate-200 bg-white p-5">
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
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
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
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add to stock"}
        </button>
      </form>
    </div>
  );
}
