/**
 * Topic / concept checklists as task titles, keyed by qualification stem or custom subject name.
 * Stems match titles after board prefixes (see qualificationSubjectStem).
 */

import type { Subject, SubjectCategory, Task } from "./types";
import { normalizeSubjectName, qualificationSubjectStem } from "./subjectTemplates";

const GCSE_FALLBACK = [
  "Specification overview & assessment objectives",
  "Core themes — notes & key definitions",
  "Exam technique & command words",
  "Past papers — timed practice",
  "Weak-topic remediation list",
  "Revision timetable check-ins",
];

const LANG_GCSE = [
  "Themes / vocabulary breadth",
  "Listening — practice papers & transcripts",
  "Speaking — photo card & conversation prompts",
  "Reading — comprehension & inference",
  "Writing — structure, accuracy & range",
  "Grammar, tense grids & translation drills",
  "Mocks — speaking window prep",
];

const GCSE_LANG_STEMS = new Set([
  "french",
  "spanish",
  "german",
  "italian",
  "arabic",
  "mandarin chinese",
  "polish",
  "portuguese",
  "punjabi",
  "urdu",
]);

const GCSE_MATH = [
  "Number — primes, indices, standard form & bounds",
  "Fractions, ratios, percentages & proportion",
  "Algebra — expressions, formulae, sequences",
  "Linear & quadratic equations & graphs",
  "Vectors & geometric reasoning",
  "Angles, polygons, constructions & similarity",
  "Trigonometry & Pythagoras in 2D contexts",
  "Probability — combined events & expectation",
  "Statistics — charts, averages & spread",
  "Problem-solving practice papers",
];

const GCSE_ENG_LANG = [
  "Reading — inference, comparison & synthesis",
  "Summary & synthesis under timed conditions",
  "Creative writing — structure & voice",
  "Transactional writing — audience & purpose",
  "SPaG accuracy drills",
  "Spoken language preparation (where assessed)",
];

const GCSE_ENG_LIT = [
  "Texts — themes, characters & contexts",
  "Unseen poetry technique grid",
  "Comparing poems / extracts",
  "Essay planning — thesis & evidence chains",
  "Quotations bank & flashcards",
  "Timed essay practice",
];

const GCSE_STATS = [
  "Data collection & sampling",
  "Charts, diagrams & interpretation",
  "Averages, spread & outliers",
  "Probability basics",
  "Scatter diagrams & correlation",
  "Hypothesis testing introduction",
];

const GCSE_SCI_COMBINED = [
  "Cell biology & organisation",
  "Infection & response; bioenergetics",
  "Homeostasis & ecology basics",
  "Atomic structure & bonding",
  "Quantitative chemistry & calculations",
  "Energy & chemical changes",
  "Motion, forces & Newton’s laws",
  "Energy stores & transfers",
  "Waves & electromagnetic spectrum",
  "Required practical review — all sciences",
  "Command-word exam technique",
];

const GCSE_BIO = [
  ...GCSE_SCI_COMBINED.slice(0, 4),
  "Inheritance & variation",
  "Evolution & ecology depth",
  "Required practical write-ups",
];

const GCSE_CHEM = [
  "Atomic structure & periodic table",
  "Bonding & properties",
  "Quantitative chemistry",
  "Energy & rates",
  "Organic chemistry basics",
  "Chemical analysis",
  "Industrial chemistry & atmosphere",
  "Required practical write-ups",
];

const GCSE_PHYS = [
  "Energy & electricity",
  "Particle model & forces",
  "Waves & electromagnetic spectrum",
  "Magnets & electromagnetism",
  "Space physics (where included)",
  "Required practical write-ups",
];

const GCSE_CS = [
  "Computational thinking & algorithms",
  "Programming constructs & debugging",
  "Binary, data representation & logic",
  "Computer systems & hardware",
  "Networks, security & ethics",
  "SQL / databases (where spec’d)",
  "NEA / programming project milestones",
];

const GCSE_BUSINESS = [
  "Enterprise & entrepreneurship basics",
  "Marketing mix & segmentation",
  "Finance — revenue, costs & cash flow",
  "Human resources & motivation theory",
  "Operations & procurement",
  "External environment & stakeholders",
  "Case study practice questions",
];

const GCSE_ECON = [
  "Basic economic problem & sectors",
  "Demand, supply & markets",
  "National economy & indicators",
  "Globalisation & trade basics",
  "Government objectives & intervention",
  "Diagram practice & evaluation chains",
];

const GCSE_CIT = [
  "Democracy, voting & participation",
  "Rights, responsibilities & justice",
  "Identity & diversity",
  "Media & digital citizenship",
  "Pressure groups & participation case studies",
];

const GCSE_HIST = [
  "Period overview timelines",
  "Causation & consequence essays",
  "Sources — inference & reliability",
  "Interpretations & historians",
  "Retention quizzes & key figures",
];

const GCSE_GEO = [
  "Physical geography processes",
  "Human geography themes",
  "OS maps & GIS skills",
  "Fieldwork hypotheses & methods",
  "Case studies — place specifics",
];

const GCSE_RS = [
  "Beliefs & teachings — core sources",
  "Practices across traditions",
  "Ethics applied scenarios",
  "Evaluative writing templates",
];

const GCSE_PSYC = [
  "Memory models & studies",
  "Perception & research methods",
  "Development & attachment",
  "Social influence & conformity",
  "Research methods — RM exam focus",
  "Issues & debates recap",
];

const GCSE_SOC = [
  "Families & households",
  "Education & achievement",
  "Crime & deviance basics",
  "Social stratification",
  "Research methods outline",
];

const GCSE_MEDIA = [
  "Media language & theory frameworks",
  "Representations & contexts",
  "Industries & audiences",
  "Non-exam assessment checkpoints",
];

const GCSE_FILM = [
  "Film language — mise-en-scène & sound",
  "Genre & narrative theory",
  "Key texts analysis",
  "Production NEA milestones",
];

const GCSE_IT = [
  "Digital productivity tools",
  "Data modelling & validation",
  "Legislation & e-safety",
  "Project milestones / portfolio evidence",
];

const GCSE_ART = [
  "Research & contextual influences",
  "Development & refinement of ideas",
  "Resolution & final outcome",
  "Annotation quality passes",
];

const GCSE_DT = [
  "Design brief & specification",
  "Research & user needs",
  "Developing & modelling ideas",
  "Manufacturing plan & materials",
  "Testing & evaluation",
];

const GCSE_FOOD = [
  "Nutrition & healthy eating principles",
  "Cooking skills progression",
  "Science of cooking links",
  "Food provenance & sustainability",
  "Non-exam assessment timetable",
];

const GCSE_MUSIC = [
  "Listening skills — dictation & dictation grids",
  "Performance repertoire milestones",
  "Composition sketches & development",
  "Theory & set works revision",
];

const GCSE_MT = [
  ...GCSE_MUSIC.slice(0, 3),
  "DAW workflow & mixing basics",
  "Sequencing & arrangement milestones",
];

const GCSE_DRAMA = [
  "Devising log milestones",
  "Scripted performance rehearsal arc",
  "Theatre roles & live evaluation prep",
];

const GCSE_DANCE = [
  "Choreographic intent & motifs",
  "Performance skills refinement",
  "Anthology appreciation notes",
];

const GCSE_PE = [
  "Anatomy & physiology revision",
  "Training principles & methods",
  "Socio-cultural factors",
  "Health & wellbeing links",
  "Practical moderation readiness",
];

const GCSE_CLASS_CIV = [
  "Literature & mythology foundations",
  "Greek / Roman society themes",
  "Material culture & archaeology basics",
  "Essay argument patterns",
];

const GCSE_LATIN = [
  "Core vocabulary decks",
  "Grammar — nouns, verbs & clauses",
  "Translation technique — prose & verse",
  "Literature set texts notes",
];

const GCSE_ANC_HIST = [
  "Period narrative & key dates",
  "Sources & propaganda",
  "Essay planning templates",
];

const GCSE_SPECIFIC: Record<string, string[]> = {
  mathematics: GCSE_MATH,
  "english language": GCSE_ENG_LANG,
  "english literature": GCSE_ENG_LIT,
  statistics: GCSE_STATS,
  "combined science: trilogy": GCSE_SCI_COMBINED,
  "combined science: synergy": GCSE_SCI_COMBINED,
  biology: GCSE_BIO,
  chemistry: GCSE_CHEM,
  physics: GCSE_PHYS,
  "computer science": GCSE_CS,
  business: GCSE_BUSINESS,
  economics: GCSE_ECON,
  citizenship: GCSE_CIT,
  history: GCSE_HIST,
  geography: GCSE_GEO,
  "religious studies": GCSE_RS,
  "religious education": GCSE_RS,
  psychology: GCSE_PSYC,
  sociology: GCSE_SOC,
  "media studies": GCSE_MEDIA,
  "film studies": GCSE_FILM,
  "information technology": GCSE_IT,
  "art & design": GCSE_ART,
  "fine art": GCSE_ART,
  photography: GCSE_ART,
  textiles: GCSE_ART,
  "design & technology": GCSE_DT,
  "food preparation & nutrition": GCSE_FOOD,
  music: GCSE_MUSIC,
  "music technology": GCSE_MT,
  drama: GCSE_DRAMA,
  dance: GCSE_DANCE,
  "physical education": GCSE_PE,
  "classical civilisation": GCSE_CLASS_CIV,
  latin: GCSE_LATIN,
  "ancient history": GCSE_ANC_HIST,
};

const A_FALLBACK = [
  "Specification objectives & command words",
  "Synoptic links across topics",
  "Past papers — full mocks",
  "Essay plans & counterarguments",
  "Weak-area workbook",
];

const LANG_ALEVEL = [
  "Film / literary study detailed notes",
  "Grammar depth & translation refinement",
  "Essay planning matrix",
  "Speaking stimulus preparation",
  "Listening past papers",
];

const A_MATH = [
  "Pure — proof & algebra fluency",
  "Pure — exponentials, logarithms & radians",
  "Pure — trigonometry & calculus foundations",
  "Pure — numerical methods",
  "Statistics — distributions & hypothesis tests",
  "Mechanics — kinematics & forces",
  "Past paper synthesis weeks",
];

const A_FURTHER = [
  "Core pure techniques consolidation",
  "Further pure — matrices & proof depth",
  "Further mechanics / discrete topics",
  "Examiner-style challenging problems",
];

const A_SCI_COMMON = [
  "Mathematical skills in science",
  "Core principles mastery checklist",
  "Required practical mastery",
  "Long-response exam technique",
];

const A_BIO = [
  ...A_SCI_COMMON,
  "Biological molecules & enzymes",
  "Cells, membranes & division",
  "Exchange & transport systems",
  "DNA, genes & ecosystems depth",
  "Gene tech & evolution",
];

const A_CHEM = [
  ...A_SCI_COMMON,
  "Atomic structure & bonding depth",
  "Energetics & kinetics",
  "Equilibria & acids",
  "Organic pathways & mechanisms",
  "Inorganic patterns & analysis",
];

const A_PHYS = [
  ...A_SCI_COMMON,
  "Measurements & uncertainties",
  "Particles & radiation",
  "Waves & optics",
  "Mechanics & thermal",
  "Electricity & fields",
];

const A_CS = [
  "Algorithms & complexity mindset",
  "Programming paradigms & OOP",
  "Data structures implementations",
  "Databases & SQL depth",
  "Legal & ethical frameworks",
  "NEA planning & iteration logs",
];

const A_DT = GCSE_DT.map((s) => `A Level depth — ${s}`);
const A_PRODUCT = [
  "Iterative design portfolio gates",
  "Manufacturing tolerances & CAD/CAM",
  "Materials science revision",
  "Testing regimes & standards",
];

const A_ENGINEERING = [
  "Mathematics for engineers refresher",
  "Statics & dynamics problems",
  "Materials & failure modes",
  "Electrical fundamentals",
  "Exam maths drill sets",
];

const A_ENG_LIT = [
  "Genre & critical traditions",
  "Close reading craft",
  "Comparison coursework outlines",
  "Historic context revision packs",
];

const A_ENG_LANG = [
  "Language frameworks toolkit",
  "Original writing commentary craft",
  "Child language theory recap",
  "Variation & change essays",
];

const A_ENG_COMBINED = [
  ...A_ENG_LIT.slice(0, 2),
  ...A_ENG_LANG.slice(0, 2),
];

const A_HIST = [
  "Narrative vs thematic essays",
  "Interpretations battle cards",
  "Sources evaluation grids",
  "Breadth study timelines",
];

const A_POL = [
  "Democracy & participation models",
  "Parties & pressure groups",
  "Core ideologies comparison",
  "Global politics strands",
];

const A_GEO = [
  "Physical systems mastery",
  "Human-environment debates",
  "Skills paper timed runs",
  "Independent investigation checkpoints",
];

const A_PSYC = [
  "Approaches & biopsychology",
  "Social psychology classic studies",
  "Attachment & psychopathology",
  "Research methods advanced RM questions",
  "Issues & debates essays",
];

const A_SOC = [
  "Theory perspectives revision grid",
  "Education & differential attainment",
  "Methods in context exam packs",
  "Crime & theory application essays",
];

const A_ECON = [
  "Micro — markets & elasticity depth",
  "Micro — labour & distribution",
  "Macro — objectives & policy conflicts",
  "Macro — global economy links",
  "Evaluation chains practice",
];

const A_BUSINESS = [
  "Functional decision-making models",
  "Strategic positioning tools",
  "Financial ratio revision",
  "Influences on HR operations",
];

const A_ACC = [
  "Financial accounting statements",
  "Management accounting techniques",
  "AQA-style ethical scenarios",
];

const A_LAW = [
  "Judiciary & law-making",
  "Criminal law depth",
  "Tort / contract pathways",
  "Scenario problem technique",
];

const A_RS = GCSE_RS.map((s) => `A Level — ${s}`);
const A_PHIL = [
  "Epistemology foundations",
  "Moral philosophy frameworks",
  "Metaphysics of mind / God packs",
  "Essay objection–reply drills",
];

const A_PE = GCSE_PE.map((s) => `A Level — ${s}`);
const A_MEDIA = GCSE_MEDIA.map((s) => `A Level — ${s}`);
const A_FILM = GCSE_FILM.map((s) => `A Level — ${s}`);
const A_MT = GCSE_MT.map((s) => `A Level — ${s}`);
const A_DRAMA = GCSE_DRAMA.map((s) => `A Level — ${s}`);
const A_CLASS_CIV = GCSE_CLASS_CIV.map((s) => `A Level — ${s}`);
const A_LATIN = GCSE_LATIN.map((s) => `A Level — ${s}`);
const A_ANC_HIST = GCSE_ANC_HIST.map((s) => `A Level — ${s}`);

const A_SPECIFIC: Record<string, string[]> = {
  mathematics: A_MATH,
  "further mathematics": A_FURTHER,
  biology: A_BIO,
  chemistry: A_CHEM,
  physics: A_PHYS,
  "computer science": A_CS,
  "design & technology": A_DT,
  "product design": A_PRODUCT,
  engineering: A_ENGINEERING,
  "english literature": A_ENG_LIT,
  "english language": A_ENG_LANG,
  "english language & literature": A_ENG_COMBINED,
  history: A_HIST,
  politics: A_POL,
  geography: A_GEO,
  psychology: A_PSYC,
  sociology: A_SOC,
  economics: A_ECON,
  business: A_BUSINESS,
  accounting: A_ACC,
  law: A_LAW,
  "religious studies": A_RS,
  philosophy: A_PHIL,
  "classical civilisation": A_CLASS_CIV,
  latin: A_LATIN,
  "ancient history": A_ANC_HIST,
  french: LANG_ALEVEL,
  spanish: LANG_ALEVEL,
  german: LANG_ALEVEL,
  italian: LANG_ALEVEL,
  arabic: LANG_ALEVEL,
  "mandarin chinese": LANG_ALEVEL,
  "art & design": GCSE_ART.map((s) => `A Level — ${s}`),
  "fine art": GCSE_ART.map((s) => `A Level — ${s}`),
  photography: GCSE_ART.map((s) => `A Level — ${s}`),
  textiles: GCSE_ART.map((s) => `A Level — ${s}`),
  music: GCSE_MUSIC.map((s) => `A Level — ${s}`),
  "music technology": A_MT,
  "drama & theatre": A_DRAMA,
  "physical education": A_PE,
  "media studies": A_MEDIA,
  "film studies": A_FILM,
};

const BTEC_FALLBACK = [
  "Assignment brief unpacking",
  "Evidence portfolio indexing",
  "SMART targets per unit",
  "Referencing & reflection logs",
  "Distinction criteria checklist pass",
];

function btecPearsonTopics(stem: string): string[] {
  const core = [
    "Unit criteria mapping spreadsheet",
    "Pass/Merit/Distinction indicator tracker",
    "Primary research / witness statements",
    "Presentation or showcase rehearsal",
  ];
  const pathway: Record<string, string[]> = {
    "applied science": [
      "Lab practical competencies",
      "Biology / chemistry / physics unit packs",
      ...core,
    ],
    business: ["Marketing plan task", "Finance spreadsheets", ...core],
    "enterprise & entrepreneurship": ["Pitch deck milestones", ...core],
    accounting: ["Manual & digital accounts exercises", ...core],
    law: ["Case brief templates", "Statute navigation drills", ...core],
    esports: ["Team roles & strategy analysis", "Events planning", ...core],
    "health & social care": [
      "Care values reflection journals",
      "Case studies — barriers & legislation",
      ...core,
    ],
    "childcare / early years": [
      "Safeguarding scenarios",
      "Observation records",
      ...core,
    ],
    "applied psychology": ["Study replication outline", ...core],
    sport: ["Fitness testing protocols", "Leadership units", ...core],
    "it / computing": ["Build logs & test evidence", ...core],
    "computing (software development)": [
      "Repo hygiene & branching",
      "Test evidence screenshots",
      ...core,
    ],
    "digital development": ["Prototype iterations", ...core],
    "information technology (it)": ["Systems documentation", ...core],
    "cyber security": ["Risk registers & policies pack", ...core],
    "creative media / digital media": ["Production diary", ...core],
    engineering: ["Technical drawings folder", ...core],
    "electrical & electronic engineering": ["Circuit build logs", ...core],
    "motor vehicle / automotive": ["Diagnostics evidence", ...core],
    construction: ["Site safety induction evidence", ...core],
    bricklaying: ["Wall build portfolio photos", ...core],
    "carpentry & joinery": ["Joint competence checklist", ...core],
    plumbing: ["Installation evidence pack", ...core],
    "electrical installation": ["Testing & certification practice", ...core],
    "painting & decorating": ["Finish quality boards", ...core],
    "performing arts": ["Rehearsal logs & reflection", ...core],
    dance: ["Choreography evidence", ...core],
    music: ["Performance recordings schedule", ...core],
    "art & design": ["Sketchbook checkpoints", ...core],
    "travel & tourism": ["Customer service scenarios", ...core],
    "public services": ["Fitness & discipline logs", ...core],
    "uniformed protective services": ["Leadership drills evidence", ...core],
    "hospitality & catering": ["Kitchen competency sheets", ...core],
    "hair & beauty": ["Client consultation records", ...core],
    fashion: ["Portfolio & mood boards", ...core],
    "animal care": ["Animal handling reflections", ...core],
    "agriculture / land-based": ["Machinery safety logs", ...core],
    "legal services": ["Case files practice", ...core],
    retail: ["Merchandising projects", ...core],
    "human resources": ["Policies & procedures tasks", ...core],
    "project management": ["Gantt & stakeholder logs", ...core],
  };
  return pathway[stem] ?? [...core, ...BTEC_FALLBACK.slice(0, 3)];
}

function ncfeTopics(stem: string): string[] {
  const base = [
    "Assignment scaffolding notes",
    "Evidence collation checklist",
    "Reflective evaluation paragraphs",
  ];
  const map: Record<string, string[]> = {
    "computer science (technical pathway)": [
      "Programming competency builds",
      "Systems architecture summaries",
      ...base,
    ],
    "digital skills": ["Productivity badges", "Portfolio artefacts", ...base],
    "cybersecurity awareness": ["Threat modelling worksheet", ...base],
    "graphic design": ["Brand project iterations", ...base],
    sport: ["Fitness testing records", ...base],
    "health & social care": ["Legislation flashcards", ...base],
  };
  return map[stem] ?? base;
}

const UNI_CS_FAMILY = [
  "Programming languages proficiency sprint",
  "Algorithms & data structures problem sets",
  "Systems & architecture modules revision",
  "Databases & backend integration labs",
  "Group project milestones",
  "Exam / coursework deadline horizon scan",
];

const UNI_HEALTH = [
  "Anatomy & physiology integration",
  "Clinical skills practice logs",
  "Evidence-based practice reading",
  "Placement reflections & proficiencies",
  "OSCE / practical prep grids",
];

const UNI_ENG = [
  "Mathematics for engineers drill sets",
  "Statics / dynamics problem banks",
  "Materials & manufacturing labs",
  "Design project gateways",
];

const UNI_BUSINESS = [
  "Core module concept maps",
  "Case study analysis templates",
  "Group presentation rehearsals",
  "Exam essay outlines",
];

const UNI_SOCIAL = [
  "Theory synthesis notes",
  "Methods revision workbook",
  "Essay plan library",
  "Research ethics refresher",
];

const UNI_ARTS = [
  "Reading list chapter trackers",
  "Draft deadlines & peer review",
  "Citation hygiene audit",
];

const UNI_LAW = [
  "Case brief bank",
  "Problem question frameworks",
  "Moot / advocacy prep slots",
];

function uniTopics(stem: string): string[] {
  const stemHealth = new Set([
    "nursing",
    "midwifery",
    "medicine",
    "dentistry",
    "pharmacy",
    "physiotherapy",
    "public health",
    "radiography",
    "occupational therapy",
    "speech & language therapy",
    "paramedic science",
    "biomedical science",
    "healthcare science",
    "healthcare science (respiratory & sleep physiology)",
  ]);
  const stemEng = new Set([
    "electrical & electronic engineering",
    "computer engineering",
    "mechanical engineering",
    "civil engineering",
    "aerospace engineering",
    "biomedical engineering",
    "architecture",
  ]);
  const stemCs = new Set([
    "computer science",
    "software engineering",
    "cyber security",
    "data science",
    "artificial intelligence",
    "information technology",
    "computer networks",
  ]);
  const stemBus = new Set([
    "business management",
    "accounting & finance",
    "economics",
    "marketing",
    "human resource management",
    "international business",
    "project management",
    "entrepreneurship",
    "accounting",
  ]);
  const stemSoc = new Set([
    "psychology",
    "sociology",
    "criminology",
    "politics / international relations",
    "education",
  ]);
  const stemArts = new Set([
    "english literature",
    "history",
    "journalism",
    "media & communications",
    "graphic design",
    "fine art",
    "geography",
  ]);
  const stemSci = new Set([
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "biochemistry",
    "environmental science",
  ]);

  if (stemCs.has(stem)) return UNI_CS_FAMILY;
  if (stemHealth.has(stem)) return UNI_HEALTH;
  if (stemEng.has(stem)) return UNI_ENG;
  if (stemBus.has(stem)) return UNI_BUSINESS;
  if (stemSoc.has(stem)) return UNI_SOCIAL;
  if (stemArts.has(stem)) return UNI_ARTS;
  if (stemSci.has(stem)) return [
    "Foundational theory consolidation",
    "Problem sheets / lab notebooks",
    "Literature review skills",
    "Dissertation / project checkpoint planning",
  ];
  if (stem === "law") return UNI_LAW;
  return [
    "Module learning outcomes checklist",
    "Reading & seminar prep rhythm",
    "Assessment calendar sync",
    "Revision booklet assembly",
  ];
}

const CODING_SUB: Record<string, string[]> = {
  "digital skills & productivity tools": [
    "Accounts & cloud workspace setup",
    "Keyboard shortcuts & file hygiene",
    "Collaboration etiquette & calendars",
  ],
  "html & css": [
    "Semantic structure lab",
    "Layout — flexbox & grid drills",
    "Forms & accessibility checklist page",
  ],
  "accessibility (a11y) basics": [
    "WCAG intro reading",
    "Keyboard-only navigation test pass",
    "Colour contrast audit worksheet",
  ],
  "responsive design": [
    "Mobile-first breakpoints sketch",
    "Fluid typography experiment",
    "DevTools device QA routine",
  ],
  "javascript fundamentals": [
    "Types, coercion & debugging console flows",
    "Functions & scope exercises",
    "DOM manipulation mini-projects",
  ],
  "typescript basics": [
    "Interfaces vs types practice",
    "Generics introductory kata",
    "Strict mode compiler cleanup sprint",
  ],
  "git & github": [
    "Branching model team agreement",
    "Meaningful commits workshop",
    "PR description template adoption",
  ],
  "programming fundamentals": [
    "Pseudo-code → code drills",
    "Complexity intuition exercises",
    "Refactoring smells checklist",
  ],
  debugging: [
    "Breakpoints & watch expressions tour",
    "Reproduce → isolate → fix workbook",
  ],
  "react basics": [
    "Components & props kata",
    "State lift patterns lab",
    "Effects & dependency hygiene",
  ],
  "routing (react router / next.js)": [
    "Nested routes experiment",
    "Route guards / layouts sketch",
  ],
  "state management (basics)": [
    "Local vs lifted state decisions log",
    "Context provider mini exercise",
  ],
  "forms & validation": [
    "Controlled inputs pattern",
    "Schema validation integration",
  ],
  "ui components & design systems": [
    "Storybook-style catalogue stub",
    "Token naming audit",
  ],
  "apis (rest & json)": [
    "HTTP verbs practical sheet",
    "Fetch / axios comparison notes",
    "Error payload handling patterns",
  ],
  "authentication (concepts)": [
    "Sessions vs JWT reading summary",
    "Threat checklist — XSS & CSRF basics",
  ],
  "security basics (owasp intro)": [
    "Top 10 skim & flashcards",
    "Secure headers experiment",
  ],
  "databases (sql basics)": [
    "Schema design exercise",
    "Join practice problem set",
  ],
  "backend basics (node.js)": [
    "Modules & npm scripts familiarity",
    "Simple HTTP server kata",
  ],
  "backend apis (express basics)": [
    "Router organisation pattern",
    "Middleware ordering lab",
  ],
  "error handling & logging": [
    "Structured logging snippet",
    "User-safe error surfaces checklist",
  ],
  "testing basics": [
    "Unit vs integration framing",
    "First automated test written",
  ],
  "code quality (linting, formatting)": [
    "ESLint + Prettier baseline",
    "Pre-commit hook trial",
  ],
  "deployment basics": [
    "Environment variables hygiene",
    "First CI deploy walkthrough",
  ],
  "ci/cd basics": [
    "Pipeline stages diagram",
    "Cache & artefact strategy notes",
  ],
  "agile / scrum": [
    "Stand-up discipline experiment",
    "Backlog refinement simulation",
  ],
  "teamwork (tickets, code reviews)": [
    "Ticket writing template usage",
    "Constructive review checklist",
  ],
  "portfolio & interview prep": [
    "Project README polish pass",
    "STAR stories draft bank",
    "Mock technical interview slot",
  ],
};

function customTopics(norm: string): string[] {
  const SC = (lines: string[]) => lines;
  const map: Record<string, string[]> = {};
  const fill = (title: string, tasks: string[]) => {
    map[normalizeSubjectName(title)] = tasks;
  };

  fill(
    "Short course: First aid",
    SC([
      "Emergency response priorities",
      "CPR & AED awareness practical",
      "Bleeding, burns & shock scenarios",
      "Assessment booking / certificate goal",
    ])
  );
  fill(
    "Short course: Food hygiene / food safety",
    SC([
      "Temperature danger zone revision",
      "Cross-contamination prevention checklist",
      "Cleaning schedules practical",
      "Level 2-style mock questions",
    ])
  );
  fill(
    "Short course: Safeguarding essentials",
    SC([
      "Categories & indicators recognition",
      "Reporting pathways memorised",
      "Scenario practice worksheets",
    ])
  );
  fill(
    "Short course: Mental health awareness",
    SC([
      "Stress vs anxiety frameworks",
      "Signposting resources list",
      "Self-care plan draft",
    ])
  );
  fill(
    "Short course: Digital & IT essentials",
    SC([
      "Cloud storage hygiene",
      "Password manager rollout",
      "Phishing awareness drills",
    ])
  );
  fill(
    "Short course: Employability skills",
    SC([
      "CV iteration sprint",
      "Cover letter templates",
      "Mock interview recording review",
    ])
  );
  fill(
    "Short course: Financial literacy basics",
    SC([
      "Budget spreadsheet model",
      "Interest & debt scenarios",
      "Pension / ISA basics reading",
    ])
  );
  fill(
    "Short course: Online learning / MOOC",
    SC([
      "Weekly rhythm calendar",
      "Note-taking system choice",
      "Capstone submission checklist",
    ])
  );

  fill(
    "UCAS prep: Personal statement",
    SC([
      "Course requirements spreadsheet",
      "Opening hook drafts ×3",
      "Evidence paragraph outline",
      "Proofreading pass with mentor",
    ])
  );
  fill(
    "UCAS prep: Course & university research",
    SC([
      "Shortlist criteria matrix",
      "Module comparison notes",
      "Open day question bank",
    ])
  );
  fill(
    "UCAS prep: Open days & virtual events",
    SC([
      "Register & diary confirmations",
      "Question checklist per uni",
      "Reflection log post-visit",
    ])
  );
  fill(
    "UCAS prep: Application form & choices (up to 5)",
    SC([
      "Choice ordering strategy session",
      "Form draft saved offline",
      "Final submission checklist",
    ])
  );
  fill(
    "UCAS prep: Deadlines & key dates",
    SC([
      "Calendar sync — Oxford/Cambridge deadlines",
      "Equal consideration deadline alarm",
      "Reference request timeline",
    ])
  );
  fill(
    "UCAS prep: Teacher references",
    SC([
      "Brag sheet for referee",
      "Reminder etiquette draft email",
      "Thank-you note queued",
    ])
  );
  fill(
    "UCAS prep: Admissions tests (where required)",
    SC([
      "Past paper schedule",
      "Timed mock attempts ×3",
      "Weak-topic workbook",
    ])
  );
  fill(
    "UCAS prep: Interview preparation (where required)",
    SC([
      "Subject reading beyond syllabus",
      "Mock interviews recorded",
      "Reflective improvement notes",
    ])
  );
  fill(
    "UCAS prep: Offers — firm & insurance",
    SC([
      "Offer comparison grid",
      "Insurance sanity check rules",
      "Results-day plan document",
    ])
  );

  fill(
    "Exam revision (all subjects): Master timetable",
    SC([
      "Weekly overview drafted",
      "Buffer blocks for fatigue",
      "Publish timetable visibly",
    ])
  );
  fill(
    "Exam revision (all subjects): Past papers & mark schemes",
    SC([
      "Paper inventory per subject",
      "Mark scheme annotation ritual",
      "Error pattern spreadsheet",
    ])
  );
  fill(
    "Exam revision (all subjects): Flashcards & spaced repetition",
    SC([
      "Deck structure per subject",
      "Daily review streak goal",
      "Retirement threshold rules",
    ])
  );
  fill(
    "Exam revision (all subjects): Topic checklist — every subject",
    SC([
      "Traffic-light specification audit",
      "Prioritise red topics",
      "Cross-subject energy budgeting",
    ])
  );
  fill(
    "Exam revision (all subjects): Weak areas catch-up",
    SC([
      "Diagnostic test archive",
      "Targeted worksheet batches",
      "Peer tutoring slots booked",
    ])
  );
  fill(
    "Exam revision (all subjects): Mock exams & timed practice",
    SC([
      "Mock calendar synced",
      "Exam conditions rehearsal",
      "Post-mortem reflection sheets",
    ])
  );
  fill(
    "Exam revision (all subjects): Exam technique & command words",
    SC([
      "Command word glossary poster",
      "Paragraph skeleton drills",
      "Time allocation templates",
    ])
  );

  fill(
    "Car theory (cars): Highway Code",
    SC([
      "Chapter summaries checklist",
      "Road signs recognition drills",
      "Rules of the road quizzes",
    ])
  );
  fill(
    "Car theory (cars): Hazard perception",
    SC([
      "Official clip practice quota",
      "Scanning technique notes",
      "Timing calibration drills",
    ])
  );
  fill(
    "Car theory (cars): Theory test — mocks & booking",
    SC([
      "Mock pass streak goal",
      "Booking deadline reminder",
      "Test-day checklist",
    ])
  );
  fill(
    "Car practice (cars): Instructor lessons",
    SC([
      "Lesson objectives journal",
      "Mirror checks habit tracker",
      "Feedback action items",
    ])
  );
  fill(
    "Car practice (cars): Manoeuvres (bay, parallel, pull up on right)",
    SC([
      "Bay parking repetitions log",
      "Parallel reference points diagram",
      "Pull-up-on-right safety checklist",
    ])
  );
  fill(
    "Car practice (cars): Independent driving & varied roads",
    SC([
      "Sat-nav vs directions scenarios",
      "Dual carriageway calm drills",
      "Night driving exposure slots",
    ])
  );
  fill(
    "Car practice (cars): Show me / tell me (vehicle safety)",
    SC([
      "Tell-me verbal summaries recorded",
      "Bonnet checks rehearsal",
      "Fluid levels practical demo",
    ])
  );
  fill(
    "Car practice (cars): Practical driving test preparation",
    SC([
      "Mock tests under nerves management",
      "Independent debrief notes",
      "Route familiarity rides",
    ])
  );

  return map[norm] ?? [];
}

function lookupStem(category: SubjectCategory, subjectName: string): string {
  const qual = qualificationSubjectStem(subjectName);
  if (qual !== null) return qual;
  return normalizeSubjectName(subjectName);
}

export function getConceptTasksForSubject(
  category: SubjectCategory,
  subjectName: string
): readonly string[] {
  const stem = lookupStem(category, subjectName);

  switch (category) {
    case "gcse": {
      if (GCSE_SPECIFIC[stem]) return GCSE_SPECIFIC[stem];
      if (GCSE_LANG_STEMS.has(stem)) return LANG_GCSE;
      return GCSE_FALLBACK;
    }
    case "alevel": {
      if (A_SPECIFIC[stem]) return A_SPECIFIC[stem];
      if (GCSE_LANG_STEMS.has(stem)) return LANG_ALEVEL;
      return A_FALLBACK;
    }
    case "btec": {
      const normFull = normalizeSubjectName(subjectName);
      if (normFull.startsWith("ncfe · vocational"))
        return ncfeTopics(stem);
      return btecPearsonTopics(stem);
    }
    case "university":
      return uniTopics(stem);
    case "codingTraineeship": {
      const sub = CODING_SUB[stem];
      if (sub) return sub;
      return [
        "Learning outcomes checklist",
        "Practice exercises batch",
        "Portfolio evidence capture",
      ];
    }
    case "custom":
      return customTopics(stem);
    default:
      return [];
  }
}

/** Unique checklist lines for UI and counts (normalized dedupe within the pack). */
export function getDedupedConceptTaskTitles(
  category: SubjectCategory,
  subjectName: string
): string[] {
  const rawTitles = getConceptTasksForSubject(category, subjectName);
  const seenInPack = new Set<string>();
  const titles: string[] = [];
  for (const title of rawTitles) {
    const k = normalizeSubjectName(title);
    if (seenInPack.has(k)) continue;
    seenInPack.add(k);
    titles.push(title);
  }
  return titles;
}

export function countConceptTasksForSubject(subject: Subject): number {
  return getDedupedConceptTaskTitles(subject.category, subject.name).length;
}

export type ApplyConceptTaskOptions = {
  /**
   * Shared across one synchronous bulk loop; mutate so later subjects see titles added earlier
   * before React state updates.
   */
  sharedPlannerTitles?: Set<string>;
  /**
   * When true (bulk/template/fill-all), skip if any task in the planner already has that title.
   * When false, only skip if this subject already has that title (same title may exist on other
   * subjects; inserts use `allowDuplicateNormalizedTitle` on `upsertTask`).
   * @default true
   */
  dedupeAcrossPlanner?: boolean;
};

/**
 * Adds checklist tasks for one subject.
 *
 * Default `dedupeAcrossPlanner`: skip titles already used anywhere (bulk fills pass `sharedPlannerTitles`).
 * Set `dedupeAcrossPlanner: false` for Topics / single-subject checklist buttons so each subject row can get a full pack.
 */
export function applyConceptTasksForSubject(
  subject: Pick<Subject, "id" | "category" | "name">,
  existingTasks: Task[],
  upsertTask: (
    t: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string },
    options?: { allowDuplicateNormalizedTitle?: boolean }
  ) => boolean,
  options?: ApplyConceptTaskOptions
): number {
  const dedupeAcrossPlanner = options?.dedupeAcrossPlanner ?? true;
  const sharedPlannerTitles = options?.sharedPlannerTitles;

  const titles = getDedupedConceptTaskTitles(subject.category, subject.name);
  if (titles.length === 0) return 0;

  const plannerTaken =
    dedupeAcrossPlanner
      ? (sharedPlannerTitles ??
        new Set(existingTasks.map((t) => normalizeSubjectName(t.title))))
      : null;

  const existingForSubject = new Set(
    existingTasks
      .filter((t) => t.subjectId === subject.id)
      .map((t) => normalizeSubjectName(t.title))
  );

  let added = 0;
  for (const title of titles) {
    const k = normalizeSubjectName(title);
    if (existingForSubject.has(k)) continue;
    if (plannerTaken?.has(k)) continue;
    existingForSubject.add(k);
    plannerTaken?.add(k);
    const saved = upsertTask(
      {
        title,
        subjectId: subject.id,
        dueDate: null,
        priority: "medium",
        estimateMinutes: null,
        notes: "",
        status: "todo",
        completedAt: null,
      },
      dedupeAcrossPlanner
        ? undefined
        : { allowDuplicateNormalizedTitle: true }
    );
    if (saved) added++;
    else {
      existingForSubject.delete(k);
      plannerTaken?.delete(k);
    }
  }
  return added;
}

export function estimateTopicTasksForSubjects(subjects: Subject[]): number {
  return subjects.reduce((n, s) => n + countConceptTasksForSubject(s), 0);
}

/** Upper bound on tasks if every name became a subject with its topic pack (deduped per pack). */
export function estimateConceptTasksForSubjectNames(
  category: SubjectCategory,
  names: readonly string[]
): number {
  let n = 0;
  for (const name of names) {
    n += getDedupedConceptTaskTitles(category, name).length;
  }
  return n;
}
