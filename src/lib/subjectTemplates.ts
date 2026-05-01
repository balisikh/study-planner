export type SubjectTemplateId =
  | "gcse"
  | "btec"
  | "alevel"
  | "codingTraineeship"
  | "university"
  | "custom";

export const SUBJECT_TEMPLATES: Record<
  SubjectTemplateId,
  { label: string; subjects: string[] }
> = {
  gcse: {
    label: "GCSE (all common subjects)",
    subjects: [
      "English Language",
      "English Literature",
      "Mathematics",
      "Statistics",
      "Combined Science",
      "Biology",
      "Chemistry",
      "Physics",
      "Computer Science",
      "Business",
      "Economics",
      "Citizenship",
      "History",
      "Geography",
      "Religious Studies",
      "Religious Education",
      "Psychology",
      "Sociology",
      "Media Studies",
      "Film Studies",
      "Information Technology",
      "French",
      "Spanish",
      "German",
      "Italian",
      "Arabic",
      "Mandarin Chinese",
      "Polish",
      "Portuguese",
      "Punjabi",
      "Urdu",
      "Art & Design",
      "Fine Art",
      "Photography",
      "Textiles",
      "Design & Technology",
      "Food Preparation & Nutrition",
      "Music",
      "Music Technology",
      "Drama",
      "Dance",
      "Physical Education",
    ],
  },
  btec: {
    label: "BTEC (Levels 1–3 pathways / subject areas)",
    subjects: [
      "Applied Science",
      "Business",
      "Enterprise & Entrepreneurship",
      "Accounting",
      "Law",
      "Esports",
      "Health & Social Care",
      "Childcare / Early Years",
      "Applied Psychology",
      "Sport",
      "IT / Computing",
      "Computing (Software Development)",
      "Digital Development",
      "Information Technology (IT)",
      "Cyber Security",
      "Creative Media / Digital Media",
      "Engineering",
      "Electrical & Electronic Engineering",
      "Motor Vehicle / Automotive",
      "Construction",
      "Bricklaying",
      "Carpentry & Joinery",
      "Plumbing",
      "Electrical Installation",
      "Painting & Decorating",
      "Performing Arts",
      "Dance",
      "Music",
      "Art & Design",
      "Travel & Tourism",
      "Public Services",
      "Uniformed Protective Services",
      "Hospitality & Catering",
      "Hair & Beauty",
      "Fashion",
      "Animal Care",
      "Agriculture / Land-Based",
      "Legal Services",
      "Retail",
      "Human Resources",
      "Project Management",
    ],
  },
  alevel: {
    label: "A Level (all common subjects)",
    subjects: [
      "Mathematics",
      "Further Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Computer Science",
      "Design & Technology",
      "Product Design",
      "Engineering",
      "English Literature",
      "English Language",
      "English Language & Literature",
      "History",
      "Politics",
      "Geography",
      "Psychology",
      "Sociology",
      "Economics",
      "Business",
      "Accounting",
      "Law",
      "Religious Studies",
      "Philosophy",
      "Classical Civilisation",
      "Latin",
      "Ancient History",
      "French",
      "Spanish",
      "German",
      "Italian",
      "Arabic",
      "Mandarin Chinese",
      "Art & Design",
      "Fine Art",
      "Photography",
      "Textiles",
      "Music",
      "Music Technology",
      "Drama & Theatre",
      "Physical Education",
    ],
  },
  codingTraineeship: {
    label: "Coding Traineeship (modules / topics)",
    subjects: [
      "Digital Skills & Productivity Tools",
      "HTML & CSS",
      "Accessibility (a11y) basics",
      "Responsive Design",
      "JavaScript Fundamentals",
      "TypeScript Basics",
      "Git & GitHub",
      "Programming Fundamentals",
      "Debugging",
      "React Basics",
      "Routing (React Router / Next.js)",
      "State Management (basics)",
      "Forms & Validation",
      "UI Components & Design Systems",
      "APIs (REST & JSON)",
      "Authentication (concepts)",
      "Security Basics (OWASP intro)",
      "Databases (SQL basics)",
      "Backend Basics (Node.js)",
      "Backend APIs (Express basics)",
      "Error handling & logging",
      "Testing Basics",
      "Code Quality (linting, formatting)",
      "Deployment Basics",
      "CI/CD basics",
      "Agile / Scrum",
      "Teamwork (tickets, code reviews)",
      "Portfolio & Interview Prep",
    ],
  },
  university: {
    label: "University (common degrees)",
    subjects: [
      "Accounting",
      "Computer Science",
      "Software Engineering",
      "Cyber Security",
      "Data Science",
      "Artificial Intelligence",
      "Information Technology",
      "Computer Networks",
      "Computer Engineering",
      "Electrical & Electronic Engineering",
      "Business Management",
      "Accounting & Finance",
      "Economics",
      "Marketing",
      "Human Resource Management",
      "International Business",
      "Project Management",
      "Entrepreneurship",
      "Nursing",
      "Midwifery",
      "Medicine",
      "Dentistry",
      "Pharmacy",
      "Physiotherapy",
      "Public Health",
      "Radiography",
      "Occupational Therapy",
      "Speech & Language Therapy",
      "Paramedic Science",
      "Biomedical Science",
      "Healthcare Science",
      "Healthcare Science (Respiratory & Sleep Physiology)",
      "Psychology",
      "Sociology",
      "Criminology",
      "Politics / International Relations",
      "Law",
      "Mechanical Engineering",
      "Civil Engineering",
      "Aerospace Engineering",
      "Biomedical Engineering",
      "Architecture",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Biochemistry",
      "Environmental Science",
      "Geography",
      "Education",
      "English Literature",
      "History",
      "Journalism",
      "Media & Communications",
      "Graphic Design",
      "Fine Art",
    ],
  },
  custom: {
    label: "Custom (useful extras)",
    subjects: [
      "Short course: First Aid",
      "Short course: Online course",
      "EPQ-style work",
      "UCAS prep",
      "Exam revision",
      "Driving theory",
    ],
  },
};

export const CUSTOM_ESSENTIAL_SUBJECTS = SUBJECT_TEMPLATES.custom.subjects;

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

export function getSuggestedSubjectColor(name: string): string | null {
  const key = normalizeSubjectName(name);
  return SUBJECT_COLOR_MAP[key] ?? null;
}

