import { findDrug, findDuplicateClasses, findInteractions } from "@/lib/drug-knowledge";

export type ParsedLine = {
  raw: string;
  drugName: string;
  generic: string | null;
  strengthMg: number | null;
  frequencyPerDay: number | null;
  durationDays: number | null;
  quantity: number | null;
  recommendedDose: string | null;
  issues: string[];
};

export type Warning = {
  severity: "high" | "moderate" | "info";
  title: string;
  detail: string;
};

export type PrescriptionAnalysis = {
  lines: ParsedLine[];
  warnings: Warning[];
  summary: string;
};

const FREQUENCY_PATTERNS: Array<[RegExp, number]> = [
  [/\b(1\s*-\s*1\s*-\s*1|tds|tid|thrice daily|3 times)\b/i, 3],
  [/\b(1\s*-\s*0\s*-\s*1|bd|bid|twice daily|2 times)\b/i, 2],
  [/\b(1\s*-\s*0\s*-\s*0|0\s*-\s*0\s*-\s*1|od|hs|once daily|daily)\b/i, 1],
  [/\b(qid|four times)\b/i, 4],
];

function parseStrength(line: string): number | null {
  const mg = line.match(/(\d+(?:\.\d+)?)\s*mg/i);
  if (mg) return Number(mg[1]);
  const gram = line.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (gram) return Number(gram[1]) * 1000;
  return null;
}

function parseFrequency(line: string): number | null {
  for (const [pattern, perDay] of FREQUENCY_PATTERNS) {
    if (pattern.test(line)) return perDay;
  }
  return null;
}

function parseDuration(line: string): number | null {
  const days = line.match(/(\d+)\s*(?:days?|dys?|d\b)/i);
  if (days) return Number(days[1]);
  const weeks = line.match(/(\d+)\s*weeks?/i);
  if (weeks) return Number(weeks[1]) * 7;
  const months = line.match(/(\d+)\s*months?/i);
  if (months) return Number(months[1]) * 30;
  return null;
}

function parseDrugName(line: string): string {
  const cleaned = line
    .replace(/^\s*(?:\d+[).]|[-*•])\s*/, "")
    .replace(/\b(tab|tablet|cap|capsule|syp|syrup|inj|injection|susp)\b\.?/gi, " ")
    .trim();
  const stopIndex = cleaned.search(/\d|\b(od|bd|bid|tds|tid|qid|hs|sos)\b/i);
  const head = stopIndex > 0 ? cleaned.slice(0, stopIndex) : cleaned;
  return head.replace(/[^a-zA-Z\s-]/g, " ").trim().split(/\s+/).slice(0, 3).join(" ");
}

export function parsePrescription(text: string): PrescriptionAnalysis {
  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 2 && /[a-zA-Z]{3}/.test(line));

  const lines: ParsedLine[] = [];

  for (const raw of rawLines) {
    if (/^(patient|name|age|sex|doctor|dr\.?|date|address|diagnosis|advice|regd|clinic|hospital)\b/i.test(raw)) {
      continue;
    }
    const drugName = parseDrugName(raw);
    const drug = findDrug(drugName);
    if (!drug && !/\d/.test(raw)) continue;

    const strengthMg = parseStrength(raw);
    const frequencyPerDay = parseFrequency(raw);
    const durationDays = parseDuration(raw);
    const issues: string[] = [];

    if (!drug) issues.push("Drug not recognised in the local formulary — verify spelling manually");
    if (!frequencyPerDay) issues.push("Dosing frequency unclear");
    if (!durationDays) issues.push("Duration not specified");
    if (drug && strengthMg && frequencyPerDay && drug.maxDailyMg) {
      const dailyMg = strengthMg * frequencyPerDay;
      if (dailyMg > drug.maxDailyMg) {
        issues.push(`Daily dose ${dailyMg} mg exceeds the usual maximum of ${drug.maxDailyMg} mg`);
      }
    }

    lines.push({
      raw,
      drugName: drugName || raw.slice(0, 40),
      generic: drug?.generic ?? null,
      strengthMg,
      frequencyPerDay,
      durationDays,
      quantity: frequencyPerDay && durationDays ? frequencyPerDay * durationDays : null,
      recommendedDose: drug?.adultDose ?? null,
      issues,
    });
  }

  const generics = lines.map((line) => line.generic).filter((value): value is string => Boolean(value));
  const warnings: Warning[] = [];

  for (const interaction of findInteractions(generics)) {
    warnings.push({
      severity: interaction.severity,
      title: `${interaction.a} + ${interaction.b}`,
      detail: `${interaction.effect}. ${interaction.action}.`,
    });
  }

  for (const duplicate of findDuplicateClasses(generics)) {
    warnings.push({
      severity: "moderate",
      title: "Duplicate therapy",
      detail: `Two drugs from the same class were prescribed (${duplicate}).`,
    });
  }

  for (const line of lines) {
    for (const issue of line.issues) {
      warnings.push({ severity: "info", title: line.drugName, detail: issue });
    }
  }

  const summary = lines.length
    ? `${lines.length} medicine line(s) parsed, ${generics.length} matched to the formulary, ${warnings.filter((w) => w.severity !== "info").length} clinical alert(s).`
    : "No medicine lines could be parsed from this prescription.";

  return { lines, warnings, summary };
}
