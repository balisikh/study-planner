/**
 * Bulk-add strings for Subjects → Quick add templates.
 * GCSE / A Level: major England/Wales/NI boards × common qualification titles (not every unique spec code).
 * BTEC: Pearson-led naming plus a short NCFE-style vocational set.
 * University / traineeship: framed as programme titles (UK HE is not exam-board spec’d like GCSE).
 */

export const UK_GCSE_BOARDS = [
  "AQA",
  "Pearson Edexcel",
  "OCR",
  "WJEC Eduqas",
  "CCEA",
] as const;

export const UK_ALEVEL_BOARDS = [
  "AQA",
  "Pearson Edexcel",
  "OCR",
  "WJEC Eduqas",
  "CCEA",
] as const;

/** Short qualification title after the board (we prefix with "GCSE …"). */
const GCSE_CORE: readonly string[] = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Statistics",
  "Combined Science: Trilogy",
  "Combined Science: Synergy",
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
  "Classical Civilisation",
  "Latin",
  "Ancient History",
];

/** Short qualification title after the board (we prefix with "A Level …"). */
const ALEVEL_CORE: readonly string[] = [
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
];

/** Pearson registers BTEC; list stays pathway-oriented (L1–L3 family names). */
const BTEC_PEARSON_PATHWAYS: readonly string[] = [
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
];

const NCFE_VOCATIONAL_LADDER: readonly string[] = [
  "Computer Science (technical pathway)",
  "Digital Skills",
  "Cybersecurity Awareness",
  "Graphic Design",
  "Sport",
  "Health & Social Care",
];

const UNIVERSITY_PROGRAMME_CORE: readonly string[] = [
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
];

const CODING_TRAINEESHIP_UNITS: readonly string[] = [
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
];

export function gcseExamBoardQualifications(): string[] {
  return UK_GCSE_BOARDS.flatMap((board) =>
    GCSE_CORE.map((s) => `${board} · GCSE ${s}`)
  );
}

export function aLevelExamBoardQualifications(): string[] {
  return UK_ALEVEL_BOARDS.flatMap((board) =>
    ALEVEL_CORE.map((s) => `${board} · A Level ${s}`)
  );
}

export function btecAndVocationalQualifications(): string[] {
  const pearson = BTEC_PEARSON_PATHWAYS.map((s) => `Pearson · BTEC — ${s}`);
  const ncfe = NCFE_VOCATIONAL_LADDER.map((s) => `NCFE · Vocational — ${s}`);
  return [...pearson, ...ncfe];
}

/** UK degrees are awarded by universities (not GCSE-style boards); prefix keeps naming consistent. */
export function ukHigherEducationQualifications(): string[] {
  return UNIVERSITY_PROGRAMME_CORE.map((s) => `UK HE · ${s}`);
}

/** Traineeships vary by provider; unit titles stay usable as subject rows. */
export function codingTraineeshipQualifications(): string[] {
  return CODING_TRAINEESHIP_UNITS.map((u) => `Coding traineeship · ${u}`);
}
