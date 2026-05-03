/**
 * Builds docs/STUDY_PLANNER_DOCUMENTATION.html from the Markdown source.
 * Open the HTML in a browser → Print → Save as PDF (or use Edge headless via npm run docs:pdf).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "docs", "STUDY_PLANNER_DOCUMENTATION.md");
const outPath = join(root, "docs", "STUDY_PLANNER_DOCUMENTATION.html");

marked.use({ gfm: true });

const md = readFileSync(mdPath, "utf8");
const body = marked.parse(md);

const css = `
:root {
  color-scheme: light dark;
  --text: #1a1a1a;
  --muted: #555;
  --border: #ccc;
  --bg: #fff;
  --code-bg: #f4f4f5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --text: #f4f4f5;
    --muted: #a1a1aa;
    --border: #3f3f46;
    --bg: #18181b;
    --code-bg: #27272a;
  }
}
* { box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.55;
  color: var(--text);
  background: var(--bg);
  margin: 0;
  padding: 2rem 1.5rem 4rem;
  max-width: 52rem;
  margin-left: auto;
  margin-right: auto;
}
.doc h1 {
  font-size: 1.75rem;
  font-weight: 700;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.35rem;
  margin-top: 0;
}
.doc h2 {
  font-size: 1.25rem;
  margin-top: 2rem;
  page-break-after: avoid;
}
.doc h3 { font-size: 1.05rem; margin-top: 1.25rem; page-break-after: avoid; }
.doc p { margin: 0.65rem 0; }
.doc ul, .doc ol { margin: 0.5rem 0 0.75rem 1.25rem; }
.doc li { margin: 0.25rem 0; }
.doc table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
  margin: 1rem 0;
  page-break-inside: avoid;
}
.doc th, .doc td {
  border: 1px solid var(--border);
  padding: 0.45rem 0.6rem;
  text-align: left;
  vertical-align: top;
}
.doc th { background: var(--code-bg); font-weight: 600; }
.doc hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}
.doc code {
  font-family: ui-monospace, "Cascadia Code", "Segoe UI Mono", Consolas, monospace;
  font-size: 0.9em;
  background: var(--code-bg);
  padding: 0.12em 0.35em;
  border-radius: 4px;
}
.doc pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  overflow-x: auto;
  font-size: 9pt;
  page-break-inside: avoid;
}
.doc pre code { background: none; padding: 0; }
.doc blockquote {
  margin: 0.75rem 0;
  padding-left: 1rem;
  border-left: 3px solid var(--border);
  color: var(--muted);
}
.print-hint {
  margin-top: 2.5rem;
  padding: 0.75rem 1rem;
  font-size: 10pt;
  color: var(--muted);
  border: 1px dashed var(--border);
  border-radius: 6px;
}
@media print {
  body { padding: 0; max-width: none; }
  .print-hint { border: none; padding: 0; margin-top: 1rem; font-size: 9pt; }
}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Study Planner — Technical &amp; Product Documentation</title>
<style>${css}</style>
</head>
<body>
<article class="doc">
${body}
</article>
<p class="print-hint"><strong>PDF:</strong> Use <kbd>Ctrl+P</kbd> (Windows) or <kbd>Cmd+P</kbd> (Mac), choose <strong>Save as PDF</strong> or <strong>Microsoft Print to PDF</strong>. Or run <code>npm run docs:pdf</code> if Microsoft Edge is installed.</p>
</body>
</html>`;

writeFileSync(outPath, html, "utf8");
console.log("Wrote", outPath);
