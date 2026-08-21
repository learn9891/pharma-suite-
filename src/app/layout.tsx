import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "PharmaSuite — pharmacy operations",
  description: "Stock, prescription analysis, AI assistant and GST billing for retail pharmacies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <NavBar />
        <main key="page" className="mx-auto max-w-6xl animate-fade-up px-6 py-8">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 text-xs text-slate-500 print:hidden">
          Decision support only — a registered pharmacist must confirm every clinical decision.
        </footer>
      </body>
    </html>
  );
}
