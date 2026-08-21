"use client";

import { useState } from "react";
import Link from "next/link";
import Spinner from "@/components/Spinner";

type AnalysedLine = {
  raw: string;
  drugName: string;
  generic: string | null;
  strengthMg: number | null;
  frequencyPerDay: number | null;
  durationDays: number | null;
  quantity: number | null;
  recommendedDose: string | null;
  issues: string[];
  inventory: { id: string; name: string; batchNo: string; stockQty: number; unitPrice: number; sufficient: boolean } | null;
};

type Analysis = {
  id: string;
  summary: string;
  lines: AnalysedLine[];
  warnings: Array<{ severity: "high" | "moderate" | "info"; title: string; detail: string }>;
};

const SAMPLE = `Patient: Ramesh Kumar, 54 / M
Dr. S. Iyer

1. Tab Dolo 650 mg 1-0-1 x 5 days
2. Tab Pantop 40 mg OD x 7 days
3. Tab Ecosprin 75 mg OD
4. Tab Brufen 400 mg TDS x 3 days
5. Cap Warf 5 mg OD
6. Tab Omez 20 mg OD x 7 days`;

const SEVERITY_STYLE = {
  high: "border-rose-200 bg-rose-50 text-rose-800 animate-pulse-ring",
  moderate: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

export default function PrescriptionAnalyser() {
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyse(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName, doctorName, text }),
    });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Analysis failed");
      return;
    }
    setAnalysis((await response.json()) as Analysis);
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold">
          <span className="gradient-text">Prescription analyser</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste or type the prescription. Each line is parsed into molecule, strength, frequency and duration, then checked
          for interactions, duplicate therapy and dose limits, and matched against your stock.
        </p>
      </div>

      <form onSubmit={analyse} className="card animate-fade-up space-y-4 p-5" style={{ animationDelay: "80ms" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-600">Patient name</span>
            <input
              required
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              className="field"
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs font-medium text-slate-600">Prescriber (optional)</span>
            <input
              value={doctorName}
              onChange={(event) => setDoctorName(event.target.value)}
              className="field"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="block text-xs font-medium text-slate-600">Prescription text</span>
          <textarea
            required
            rows={10}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Tab Dolo 650 mg 1-0-1 x 5 days"
            className="field font-mono text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
            {loading && <Spinner />}
            {loading ? "Analysing..." : "Analyse prescription"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPatientName("Ramesh Kumar");
              setDoctorName("Dr. S. Iyer");
              setText(SAMPLE);
            }}
            className="btn-ghost"
          >
            Load sample
          </button>
        </div>
        {error && <p className="animate-fade-up text-sm text-rose-600">{error}</p>}
      </form>

      {analysis && (
        <div className="space-y-6">
          <p className="animate-pop rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            {analysis.summary}
          </p>

          {analysis.warnings.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Alerts</h2>
              {analysis.warnings.map((warning, index) => (
                <div
                  key={`${warning.title}-${index}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className={`animate-fade-up rounded-lg border px-4 py-3 text-sm ${SEVERITY_STYLE[warning.severity]}`}
                >
                  <p className="font-medium capitalize">
                    {warning.severity !== "info" ? `${warning.severity} · ` : ""}
                    {warning.title}
                  </p>
                  <p>{warning.detail}</p>
                </div>
              ))}
            </section>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Line</th>
                  <th className="px-4 py-3">Molecule</th>
                  <th className="px-4 py-3">Strength</th>
                  <th className="px-4 py-3">Regimen</th>
                  <th className="px-4 py-3">Qty to dispense</th>
                  <th className="px-4 py-3">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.lines.map((line, index) => (
                  <tr
                    key={`${line.raw}-${index}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="row-hover animate-fade-up"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{line.raw}</td>
                    <td className="px-4 py-3">
                      {line.generic ?? <span className="text-amber-600">unmatched</span>}
                      {line.recommendedDose && <p className="text-xs text-slate-500">usual: {line.recommendedDose}</p>}
                    </td>
                    <td className="px-4 py-3">{line.strengthMg ? `${line.strengthMg} mg` : "—"}</td>
                    <td className="px-4 py-3">
                      {line.frequencyPerDay ? `${line.frequencyPerDay}x/day` : "unclear"}
                      {line.durationDays ? ` · ${line.durationDays} days` : ""}
                    </td>
                    <td className="px-4 py-3">{line.quantity ?? "—"}</td>
                    <td className="px-4 py-3">
                      {line.inventory ? (
                        <span className={line.inventory.sufficient ? "text-emerald-700" : "text-rose-600"}>
                          {line.inventory.name} · {line.inventory.stockQty} in stock
                        </span>
                      ) : (
                        <span className="text-slate-500">not in stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            href="/billing"
            className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            Create invoice for this patient
          </Link>
        </div>
      )}
    </div>
  );
}
