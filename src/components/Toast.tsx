"use client";

export type ToastState = { message: string; tone: "success" | "error" } | null;

export default function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 animate-slide-in-right rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        toast.tone === "success" ? "bg-teal-600" : "bg-rose-600"
      }`}
    >
      {toast.message}
    </div>
  );
}
