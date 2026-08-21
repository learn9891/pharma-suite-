export type DrugInfo = {
  generic: string;
  brands: string[];
  drugClass: string;
  adultDose: string;
  maxDailyMg: number | null;
  cautions: string[];
};

export const DRUGS: DrugInfo[] = [
  {
    generic: "paracetamol",
    brands: ["dolo", "crocin", "calpol", "acetaminophen", "pcm"],
    drugClass: "analgesic-antipyretic",
    adultDose: "500-1000 mg every 6-8 h",
    maxDailyMg: 4000,
    cautions: ["Hepatotoxic above 4 g/day", "Avoid with other paracetamol combinations"],
  },
  {
    generic: "ibuprofen",
    brands: ["brufen", "combiflam", "ibugesic"],
    drugClass: "nsaid",
    adultDose: "200-400 mg every 6-8 h after food",
    maxDailyMg: 2400,
    cautions: ["Gastric irritation", "Avoid in renal impairment and third-trimester pregnancy"],
  },
  {
    generic: "diclofenac",
    brands: ["voveran", "dynapar"],
    drugClass: "nsaid",
    adultDose: "50 mg two to three times daily after food",
    maxDailyMg: 150,
    cautions: ["Cardiovascular risk on long-term use", "Gastric irritation"],
  },
  {
    generic: "amoxicillin",
    brands: ["mox", "novamox", "amoxil"],
    drugClass: "penicillin-antibiotic",
    adultDose: "500 mg every 8 h for 5-7 days",
    maxDailyMg: 3000,
    cautions: ["Penicillin allergy", "Complete the full course"],
  },
  {
    generic: "azithromycin",
    brands: ["azithral", "azee", "zithromax"],
    drugClass: "macrolide-antibiotic",
    adultDose: "500 mg once daily for 3-5 days",
    maxDailyMg: 500,
    cautions: ["QT prolongation", "Take one hour before food"],
  },
  {
    generic: "cefixime",
    brands: ["taxim-o", "zifi"],
    drugClass: "cephalosporin-antibiotic",
    adultDose: "200 mg twice daily for 5-7 days",
    maxDailyMg: 400,
    cautions: ["Cross-reactivity in penicillin allergy"],
  },
  {
    generic: "pantoprazole",
    brands: ["pan", "pantocid", "pantop"],
    drugClass: "proton-pump-inhibitor",
    adultDose: "40 mg once daily before breakfast",
    maxDailyMg: 80,
    cautions: ["Long-term use lowers magnesium and B12"],
  },
  {
    generic: "omeprazole",
    brands: ["omez", "ocid"],
    drugClass: "proton-pump-inhibitor",
    adultDose: "20 mg once daily before food",
    maxDailyMg: 40,
    cautions: ["Reduces clopidogrel activation"],
  },
  {
    generic: "metformin",
    brands: ["glycomet", "glucophage", "obimet"],
    drugClass: "biguanide-antidiabetic",
    adultDose: "500 mg twice daily after meals",
    maxDailyMg: 2000,
    cautions: ["Withhold before contrast imaging", "Avoid in eGFR < 30"],
  },
  {
    generic: "glimepiride",
    brands: ["amaryl", "glimy"],
    drugClass: "sulfonylurea-antidiabetic",
    adultDose: "1-2 mg once daily before breakfast",
    maxDailyMg: 8,
    cautions: ["Hypoglycaemia risk, especially when meals are skipped"],
  },
  {
    generic: "amlodipine",
    brands: ["amlopres", "stamlo", "amlong"],
    drugClass: "calcium-channel-blocker",
    adultDose: "5 mg once daily",
    maxDailyMg: 10,
    cautions: ["Ankle oedema", "Monitor blood pressure"],
  },
  {
    generic: "telmisartan",
    brands: ["telma", "telsar"],
    drugClass: "angiotensin-receptor-blocker",
    adultDose: "40 mg once daily",
    maxDailyMg: 80,
    cautions: ["Avoid in pregnancy", "Monitor potassium and creatinine"],
  },
  {
    generic: "atorvastatin",
    brands: ["atorva", "lipitor", "storvas"],
    drugClass: "statin",
    adultDose: "10-20 mg once daily at night",
    maxDailyMg: 80,
    cautions: ["Myopathy risk", "Check liver enzymes if symptomatic"],
  },
  {
    generic: "cetirizine",
    brands: ["cetzine", "alerid", "okacet"],
    drugClass: "antihistamine",
    adultDose: "10 mg once daily at night",
    maxDailyMg: 10,
    cautions: ["Drowsiness", "Additive sedation with alcohol"],
  },
  {
    generic: "montelukast",
    brands: ["montair", "montek"],
    drugClass: "leukotriene-antagonist",
    adultDose: "10 mg once daily at night",
    maxDailyMg: 10,
    cautions: ["Neuropsychiatric effects reported"],
  },
  {
    generic: "warfarin",
    brands: ["warf", "uniwarfin"],
    drugClass: "anticoagulant",
    adultDose: "Individualised to INR target",
    maxDailyMg: null,
    cautions: ["Narrow therapeutic index", "Many drug and food interactions"],
  },
  {
    generic: "aspirin",
    brands: ["ecosprin", "disprin"],
    drugClass: "antiplatelet-nsaid",
    adultDose: "75-150 mg once daily after food",
    maxDailyMg: 4000,
    cautions: ["Bleeding risk", "Avoid in children with viral fever"],
  },
  {
    generic: "clopidogrel",
    brands: ["clopilet", "plavix", "deplatt"],
    drugClass: "antiplatelet",
    adultDose: "75 mg once daily",
    maxDailyMg: 75,
    cautions: ["Bleeding risk", "Reduced effect with omeprazole"],
  },
  {
    generic: "levothyroxine",
    brands: ["thyronorm", "eltroxin"],
    drugClass: "thyroid-hormone",
    adultDose: "Individualised, once daily on empty stomach",
    maxDailyMg: null,
    cautions: ["Separate from calcium and iron by four hours"],
  },
  {
    generic: "tramadol",
    brands: ["ultracet", "tramazac"],
    drugClass: "opioid-analgesic",
    adultDose: "50 mg every 6-8 h as needed",
    maxDailyMg: 400,
    cautions: ["Seizure risk", "Serotonin syndrome with SSRIs"],
  },
  {
    generic: "sertraline",
    brands: ["daxid", "zoloft", "serlift"],
    drugClass: "ssri-antidepressant",
    adultDose: "50 mg once daily",
    maxDailyMg: 200,
    cautions: ["Serotonin syndrome with other serotonergic drugs"],
  },
];

export type InteractionRule = {
  a: string;
  b: string;
  severity: "high" | "moderate";
  effect: string;
  action: string;
};

export const INTERACTIONS: InteractionRule[] = [
  {
    a: "warfarin",
    b: "aspirin",
    severity: "high",
    effect: "Markedly increased bleeding risk",
    action: "Refer prescriber before dispensing together",
  },
  {
    a: "warfarin",
    b: "ibuprofen",
    severity: "high",
    effect: "GI bleeding and raised INR",
    action: "Suggest paracetamol as the analgesic instead",
  },
  {
    a: "warfarin",
    b: "azithromycin",
    severity: "moderate",
    effect: "INR may rise",
    action: "Advise INR check within 3-5 days",
  },
  {
    a: "clopidogrel",
    b: "omeprazole",
    severity: "moderate",
    effect: "Reduced antiplatelet activation",
    action: "Prefer pantoprazole",
  },
  {
    a: "ibuprofen",
    b: "diclofenac",
    severity: "high",
    effect: "Duplicate NSAID therapy, ulcer and renal risk",
    action: "Dispense only one NSAID",
  },
  {
    a: "ibuprofen",
    b: "telmisartan",
    severity: "moderate",
    effect: "Reduced antihypertensive effect, renal strain",
    action: "Limit NSAID duration and monitor blood pressure",
  },
  {
    a: "metformin",
    b: "glimepiride",
    severity: "moderate",
    effect: "Additive hypoglycaemia",
    action: "Counsel on hypoglycaemia symptoms and regular meals",
  },
  {
    a: "tramadol",
    b: "sertraline",
    severity: "high",
    effect: "Serotonin syndrome risk",
    action: "Refer prescriber, monitor for agitation and tremor",
  },
  {
    a: "levothyroxine",
    b: "pantoprazole",
    severity: "moderate",
    effect: "Reduced levothyroxine absorption",
    action: "Separate doses and monitor TSH",
  },
  {
    a: "atorvastatin",
    b: "azithromycin",
    severity: "moderate",
    effect: "Increased myopathy risk",
    action: "Watch for muscle pain during the antibiotic course",
  },
];

const LOOKUP = new Map<string, DrugInfo>();
for (const drug of DRUGS) {
  LOOKUP.set(drug.generic, drug);
  for (const brand of drug.brands) LOOKUP.set(brand, drug);
}

export function findDrug(term: string): DrugInfo | null {
  const key = term.trim().toLowerCase();
  if (!key) return null;
  const direct = LOOKUP.get(key);
  if (direct) return direct;
  for (const [name, drug] of LOOKUP) {
    if (key.includes(name) || name.includes(key)) return drug;
  }
  return null;
}

export function findInteractions(generics: string[]): InteractionRule[] {
  const unique = Array.from(new Set(generics));
  const hits: InteractionRule[] = [];
  for (const rule of INTERACTIONS) {
    if (unique.includes(rule.a) && unique.includes(rule.b)) hits.push(rule);
  }
  return hits;
}

export function findDuplicateClasses(generics: string[]): string[] {
  const byClass = new Map<string, string[]>();
  for (const generic of new Set(generics)) {
    const drug = findDrug(generic);
    if (!drug) continue;
    const list = byClass.get(drug.drugClass) ?? [];
    list.push(drug.generic);
    byClass.set(drug.drugClass, list);
  }
  return Array.from(byClass.entries())
    .filter(([, drugs]) => drugs.length > 1)
    .map(([drugClass, drugs]) => `${drugClass}: ${drugs.join(" + ")}`);
}
