/**
 * Attempts PDF export via Microsoft Edge (Chromium) headless — no Puppeteer download.
 * Requires: Edge installed, and docs/STUDY_PLANNER_DOCUMENTATION.html (run docs:html first).
 */
import { existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "docs", "STUDY_PLANNER_DOCUMENTATION.html");
const pdfPath = join(root, "docs", "STUDY_PLANNER_DOCUMENTATION.pdf");

if (!existsSync(htmlPath)) {
  console.error("Missing HTML. Run: node scripts/export-documentation-html.mjs");
  process.exit(1);
}

const edgeCandidates = [
  join(process.env["ProgramFiles(x86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe"),
  join(process.env.ProgramFiles || "", "Microsoft", "Edge", "Application", "msedge.exe"),
];

const edge = edgeCandidates.find((p) => p && existsSync(p));
if (!edge) {
  console.error(
    "Microsoft Edge not found. Open docs/STUDY_PLANNER_DOCUMENTATION.html and print to PDF instead."
  );
  process.exit(1);
}

const fileUrl = pathToFileURL(htmlPath).href;
if (existsSync(pdfPath)) {
  try {
    unlinkSync(pdfPath);
  } catch {
    /* may be open in viewer */
  }
}

const r = spawnSync(
  edge,
  ["--headless", "--disable-gpu", `--print-to-pdf=${pdfPath}`, fileUrl],
  { encoding: "utf-8", shell: false }
);

if (r.error) console.error(r.error);

if (r.status !== 0 || !existsSync(pdfPath)) {
  console.error(r.stderr || r.stdout || "Edge print failed.");
  console.error("Fallback: open docs/STUDY_PLANNER_DOCUMENTATION.html → Ctrl+P → Save as PDF.");
  process.exit(1);
}

console.log("Wrote", pdfPath);
