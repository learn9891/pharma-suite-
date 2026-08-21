"use client";

import Link from "next/link";
import AnimatedNumber from "@/components/AnimatedNumber";
import { inr } from "@/lib/format";

export type Stat = {
  label: string;
  value: number;
  href: string;
  kind: "count" | "currency";
  tone: "teal" | "rose" | "amber" | "sky";
};

const TONE: Record<Stat["tone"], { wash: string; text: string }> = {
  teal: { wash: "from-teal-500/15 to-teal-500/0", text: "text-teal-700" },
  rose: { wash: "from-rose-500/15 to-rose-500/0", text: "text-rose-700" },
  amber: { wash: "from-amber-500/15 to-amber-500/0", text: "text-amber-700" },
  sky: { wash: "from-sky-500/15 to-sky-500/0", text: "text-sky-700" },
};

export default function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <Link
      href={stat.href}
      style={{ animationDelay: `${index * 90}ms` }}
      className="card card-hover group relative block animate-fade-up overflow-hidden p-4"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${TONE[stat.tone].wash}`} />
      <p className="relative text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
      <p className={`relative mt-2 text-2xl font-semibold ${TONE[stat.tone].text}`}>
        <AnimatedNumber value={stat.value} format={stat.kind === "currency" ? inr : undefined} />
      </p>
      <span className="relative mt-2 inline-block text-xs text-slate-500 opacity-0 transition duration-300 group-hover:opacity-100">
        View details →
      </span>
    </Link>
  );
}
