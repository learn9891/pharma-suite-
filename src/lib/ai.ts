import { DRUGS, findDrug, findInteractions } from "@/lib/drug-knowledge";

export type AgentMessage = { role: "user" | "assistant"; content: string };

export type AgentReply = {
  answer: string;
  engine: "llm" | "rules";
};

const SYSTEM_PROMPT = `You are a pharmacy operations assistant for a retail pharmacy in India.
Answer questions on dispensing, dosage, drug interactions, storage, substitution and stock handling.
Be concise and use short bullet points. Quote strengths and frequencies explicitly.
Always end with a one-line reminder that a pharmacist or prescriber must confirm clinical decisions.`;

async function askLlm(messages: AgentMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

function mentionedDrugs(question: string): string[] {
  const words = question.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 3);
  const found = new Set<string>();
  for (const word of words) {
    const drug = findDrug(word);
    if (drug) found.add(drug.generic);
  }
  return Array.from(found);
}

function ruleAnswer(question: string): string {
  const lower = question.toLowerCase();
  const drugs = mentionedDrugs(question);
  const sections: string[] = [];

  if (drugs.length >= 2) {
    const interactions = findInteractions(drugs);
    if (interactions.length) {
      sections.push(
        ["**Interaction check**", ...interactions.map((i) => `- ${i.a} + ${i.b} (${i.severity}): ${i.effect}. ${i.action}.`)].join("\n"),
      );
    } else {
      sections.push(`**Interaction check**\n- No interaction recorded between ${drugs.join(", ")} in the local rule base.`);
    }
  }

  for (const generic of drugs) {
    const drug = findDrug(generic);
    if (!drug) continue;
    sections.push(
      [
        `**${drug.generic}** (${drug.drugClass})`,
        `- Usual adult dose: ${drug.adultDose}`,
        `- Max per day: ${drug.maxDailyMg ? `${drug.maxDailyMg} mg` : "individualised"}`,
        `- Common brands: ${drug.brands.slice(0, 4).join(", ")}`,
        ...drug.cautions.map((caution) => `- Caution: ${caution}`),
      ].join("\n"),
    );
  }

  if (!sections.length) {
    if (/expir|expiry|damag|return/.test(lower)) {
      sections.push(
        [
          "**Expiry and returns**",
          "- Move stock within 90 days of expiry to a quarantine shelf and stop dispensing it.",
          "- Raise the credit note with the distributor before the return window closes, usually 3-6 months prior to expiry.",
          "- Record batch number, quantity and reason in the returns register.",
        ].join("\n"),
      );
    } else if (/storage|fridge|cold|temperature/.test(lower)) {
      sections.push(
        [
          "**Storage**",
          "- Insulin, vaccines and most biologicals: 2-8 °C, never frozen.",
          "- General tablets and capsules: below 25 °C, away from direct sunlight and moisture.",
          "- Log fridge temperature twice daily and keep a maximum-minimum thermometer inside.",
        ].join("\n"),
      );
    } else if (/schedul|h1|narcotic|register|licen/.test(lower)) {
      sections.push(
        [
          "**Regulatory**",
          "- Schedule H1 drugs need a separate register with patient, prescriber and quantity, retained for three years.",
          "- Dispense Schedule H, H1 and X only against a valid prescription; keep X prescriptions for two years.",
          "- Display the pharmacist registration and drug licence at the counter.",
        ].join("\n"),
      );
    } else {
      sections.push(
        [
          "I could not match a drug in the question to the local formulary. Try naming the medicine, for example \"paracetamol and ibuprofen together\".",
          `Formulary currently covers ${DRUGS.length} molecules: ${DRUGS.map((drug) => drug.generic).slice(0, 10).join(", ")} and more.`,
        ].join("\n"),
      );
    }
  }

  sections.push("_Offline rule engine answer. Set OPENAI_API_KEY for full LLM reasoning. A pharmacist must confirm every clinical decision._");
  return sections.join("\n\n");
}

export async function askPharmaAgent(messages: AgentMessage[]): Promise<AgentReply> {
  const llm = await askLlm(messages);
  if (llm) return { answer: llm, engine: "llm" };
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  return { answer: ruleAnswer(lastUser?.content ?? ""), engine: "rules" };
}
