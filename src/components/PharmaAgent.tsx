"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const PRESETS = [
  "Can I dispense ibuprofen to a patient already on warfarin?",
  "What is the adult dose of azithromycin and how should it be taken?",
  "How should I handle stock that expires in two months?",
  "Which register do I need for Schedule H1 drugs?",
];

export default function PharmaAgent({ llmConfigured }: { llmConfigured: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<"llm" | "rules" | null>(null);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });
    setLoading(false);
    if (!response.ok) {
      setMessages([...nextMessages, { role: "assistant", content: "The assistant could not answer that. Please retry." }]);
      return;
    }
    const data = (await response.json()) as { answer: string; engine: "llm" | "rules" };
    setEngine(data.engine);
    setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI pharma assistant</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ask about interactions, dosing, storage, substitution or counter operations. Answers are grounded in your own
          stock where relevant.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {llmConfigured
            ? "LLM backend configured."
            : "No OPENAI_API_KEY set — answers come from the built-in pharmacy rule engine."}
          {engine && ` Last answer came from the ${engine === "llm" ? "LLM" : "rule engine"}.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => send(preset)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:border-teal-500"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="min-h-[240px] space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {messages.length === 0 && <p className="text-sm text-slate-500">Ask your first question to start.</p>}
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-full whitespace-pre-wrap rounded-lg px-4 py-3 text-sm ${
                message.role === "user" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-slate-500">Thinking...</p>}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a pharmacy question"
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={loading} className="rounded bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          Ask
        </button>
      </form>
    </div>
  );
}
