import {
  aLevelExamBoardQualifications,
  btecAndVocationalQualifications,
  codingTraineeshipQualifications,
  gcseExamBoardQualifications,
  ukHigherEducationQualifications,
} from "./examBoardQualifications";

/** GCSE, A Level, BTEC, traineeship & uni bulk-add templates (dropdown only). */
export type QualificationTemplateId =
  | "gcse"
  | "btec"
  | "alevel"
  | "codingTraineeship"
  | "university";

export const QUALIFICATION_SUBJECT_TEMPLATES: Record<
  QualificationTemplateId,
  { label: string; subjects: string[] }
> = {
  gcse: {
    label:
      "GCSE (AQA, Pearson Edexcel, OCR, WJEC Eduqas, CCEA × common qualifications)",
    subjects: gcseExamBoardQualifications(),
  },
  btec: {
    label: "BTEC / vocational (Pearson BTEC + NCFE-style pathways)",
    subjects: btecAndVocationalQualifications(),
  },
  alevel: {
    label:
      "A Level (AQA, Pearson Edexcel, OCR, WJEC Eduqas, CCEA × common qualifications)",
    subjects: aLevelExamBoardQualifications(),
  },
  codingTraineeship: {
    label: "Coding traineeship (unit-style titles for your pathway)",
    subjects: codingTraineeshipQualifications(),
  },
  university: {
    label: "University (UK HE programme titles — pick your actual degree name)",
    subjects: ukHigherEducationQualifications(),
  },
};

/** Custom-only starter subjects — added from the Custom tab, not the qualification dropdown. */
export const CUSTOM_ESSENTIAL_SUBJECTS: string[] = [
  "Short course: First aid",
  "Short course: Food hygiene / food safety",
  "Short course: Safeguarding essentials",
  "Short course: Mental health awareness",
  "Short course: Digital & IT essentials",
  "Short course: Employability skills",
  "Short course: Financial literacy basics",
  "Short course: Online learning / MOOC",
  "UCAS prep: Personal statement",
  "UCAS prep: Course & university research",
  "UCAS prep: Open days & virtual events",
  "UCAS prep: Application form & choices (up to 5)",
  "UCAS prep: Deadlines & key dates",
  "UCAS prep: Teacher references",
  "UCAS prep: Admissions tests (where required)",
  "UCAS prep: Interview preparation (where required)",
  "UCAS prep: Offers — firm & insurance",
  "Exam revision (all subjects): Master timetable",
  "Exam revision (all subjects): Past papers & mark schemes",
  "Exam revision (all subjects): Flashcards & spaced repetition",
  "Exam revision (all subjects): Topic checklist — every subject",
  "Exam revision (all subjects): Weak areas catch-up",
  "Exam revision (all subjects): Mock exams & timed practice",
  "Exam revision (all subjects): Exam technique & command words",
  "Car theory (cars): Highway Code",
  "Car theory (cars): Hazard perception",
  "Car theory (cars): Theory test — mocks & booking",
  "Car practice (cars): Instructor lessons",
  "Car practice (cars): Manoeuvres (bay, parallel, pull up on right)",
  "Car practice (cars): Independent driving & varied roads",
  "Car practice (cars): Show me / tell me (vehicle safety)",
  "Car practice (cars): Practical driving test preparation",
];

// Consistent colours for common subjects (template adds).
// If a subject isn't mapped, the UI will fall back to a rotating palette.
const SUBJECT_COLOR_MAP: Record<string, string> = {
  // Core GCSE/A-Level
  "mathematics": "#2563eb", // blue
  "further mathematics": "#1d4ed8",
  "statistics": "#3b82f6",
  "english language": "#7c3aed", // purple
  "english literature": "#6d28d9", // violet
  "biology": "#16a34a", // green
  "chemistry": "#f97316", // orange
  "physics": "#4f46e5", // indigo
  "computer science": "#14b8a6", // teal
  "information technology": "#06b6d4", // cyan
  "it / computing": "#06b6d4",
  // Languages
  "french": "#ef4444", // red
  "spanish": "#f59e0b", // amber
  "german": "#111827", // near-black
  "punjabi": "#ec4899", // pink
  "urdu": "#db2777",
  // Humanities / other
  "religious education": "#eab308", // gold
  "religious studies": "#eab308",
  "history": "#a16207", // brown/amber
  "geography": "#22c55e", // green (different shade)
  // Creative
  "art & design": "#ec4899",
  "fine art": "#f472b6",
  "photography": "#64748b", // slate
  "design & technology": "#fb7185", // rose
  "music": "#8b5cf6", // purple
  "drama": "#e11d48", // rose red
  "physical education": "#0ea5e9", // sky
};

export function normalizeSubjectName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Inner qualification title after board/provider prefixes from examBoardQualifications. */
function stemAfterQualificationPrefix(normalizedKey: string): string | null {
  const sepGcse = " · gcse ";
  const iGcse = normalizedKey.indexOf(sepGcse);
  if (iGcse >= 0) return normalizedKey.slice(iGcse + sepGcse.length);

  const sepAle = " · a level ";
  const iAle = normalizedKey.indexOf(sepAle);
  if (iAle >= 0) return normalizedKey.slice(iAle + sepAle.length);

  const sepBtec = " · btec — ";
  const iBtec = normalizedKey.indexOf(sepBtec);
  if (iBtec >= 0) return normalizedKey.slice(iBtec + sepBtec.length);

  const sepVoc = " · vocational — ";
  const iVoc = normalizedKey.indexOf(sepVoc);
  if (iVoc >= 0) return normalizedKey.slice(iVoc + sepVoc.length);

  const prefixHe = "uk he · ";
  if (normalizedKey.startsWith(prefixHe))
    return normalizedKey.slice(prefixHe.length);

  const prefixCt = "coding traineeship · ";
  if (normalizedKey.startsWith(prefixCt))
    return normalizedKey.slice(prefixCt.length);

  return null;
}

export function getSuggestedSubjectColor(name: string): string | null {
  const key = normalizeSubjectName(name);
  const stem = stemAfterQualificationPrefix(key);
  const lookupKey = stem ?? key;
  const exact = SUBJECT_COLOR_MAP[lookupKey] ?? SUBJECT_COLOR_MAP[key];
  if (exact) return exact;
  // Custom starter topics (prefix groups)
  if (key.startsWith("short course:")) return "#0d9488";
  if (key.startsWith("ucas prep:")) return "#7c3aed";
  if (key.startsWith("exam revision (all subjects):")) return "#ea580c";
  if (key.startsWith("car theory (cars):")) return "#475569";
  if (key.startsWith("car practice (cars):")) return "#64748b";
  return null;
}

