import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaSuite — pharmacy operations",
  description: "Stock, prescription analysis, AI assistant and GST billing for retail pharmacies",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/stock", label: "Stock" },
  { href: "/prescriptions", label: "Prescription analyser" },
  { href: "/assistant", label: "AI assistant" },
  { href: "/billing", label: "Billing" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white print:hidden">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-teal-700">
              PharmaSuite
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-slate-600">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-teal-700">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
