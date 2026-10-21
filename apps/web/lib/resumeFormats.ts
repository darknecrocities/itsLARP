import { type ResumeFormatKey, type Profile } from "./store";

export interface ResumeFormatDefinition {
  key: ResumeFormatKey;
  label: string;
  category: "academic" | "executive" | "tech" | "systems" | "dense";
  categoryLabel: string;
  tag: string;
  desc: string;
}

export const RESUME_FORMATS: ResumeFormatDefinition[] = [
  // 1-5 Core Standards
  {
    key: "apa_7th",
    label: "APA 7th Edition",
    category: "academic",
    categoryLabel: "Academic & Research",
    tag: "APA Standard",
    desc: "Academic & research CV with running head, abstract, and formal software artifact citations.",
  },
  {
    key: "harvard_executive",
    label: "Harvard Executive",
    category: "executive",
    categoryLabel: "Executive & Leadership",
    tag: "Executive Serif",
    desc: "Reverse-chronological leadership format with small-caps headings and quantifiable outcomes.",
  },
  {
    key: "silicon_valley_modern",
    label: "Silicon Valley Modern",
    category: "tech",
    categoryLabel: "Tech & Impact",
    tag: "High-Growth Tech",
    desc: "Impact-first engineering format highlighting tech stack, systems metrics, and GitHub repos.",
  },
  {
    key: "ieee_engineering",
    label: "IEEE Engineering",
    category: "systems",
    categoryLabel: "Engineering Standard",
    tag: "Numbered I-VI",
    desc: "Formal engineering specification format with Roman numeral sections and system specifications.",
  },
  {
    key: "ats_strict",
    label: "ATS Strict Parser-Safe",
    category: "dense",
    categoryLabel: "ATS Optimized",
    tag: "Workday / Lever",
    desc: "Standard ASCII hierarchy without complex tables for 100% parse score on enterprise ATS.",
  },
  // 6-10 Clean & Professional Additions
  {
    key: "minimalist_swiss",
    label: "Swiss Clean Grid",
    category: "systems",
    categoryLabel: "Clean Typography",
    tag: "Helvetica Style",
    desc: "International typographic style with timeline gutters, high contrast, and crisp rhythm.",
  },
  {
    key: "cambridge_classic",
    label: "Cambridge Classic",
    category: "academic",
    categoryLabel: "Collegiate & Advisory",
    tag: "Cambridge Small-Caps",
    desc: "Prestigious collegiate layout with small-caps section titles framed by hairline rules.",
  },
  {
    key: "modern_nordic",
    label: "Nordic Minimalist Tech",
    category: "tech",
    categoryLabel: "Scandinavian Tech",
    tag: "Generous Whitespace",
    desc: "Clean Scandinavian aesthetic with generous whitespace, subtle accents, and competency pills.",
  },
  {
    key: "staff_architect",
    label: "Staff+ Systems Architect",
    category: "executive",
    categoryLabel: "Staff+ Architecture",
    tag: "ADR & Scale Metrics",
    desc: "Tailored for Staff, Principal, and Architect roles emphasizing ADRs and scale benchmarks.",
  },
  {
    key: "compact_one_page",
    label: "Compact 1-Page High-Density",
    category: "dense",
    categoryLabel: "Wall Street / Quant",
    tag: "Dense 1-Page",
    desc: "High-density single-page format for finance and top-tier tech with compact vertical spacing.",
  },
];

export function getFormatLabel(key: ResumeFormatKey): string {
  const found = RESUME_FORMATS.find((f) => f.key === key);
  return found ? found.label : key;
}

export function generateClientFallback(
  p: Profile,
  fmt: ResumeFormatKey,
  density: string = "comfortable"
): { text: string; html: string; format_label: string } {
  const name = p.name || "Candidate Name";
  const headline = p.headline || "Software / AI Systems Engineer";
  const surname = (name.trim().split(" ").pop() || "CANDIDATE").toUpperCase();
  const year = new Date().getFullYear();
  const skillsList = p.skills?.length ? p.skills.join(", ") : "Python, TypeScript, React, Docker";
  const label = getFormatLabel(fmt);

  const lines: string[] = [];
  if (fmt === "apa_7th") {
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1`);
    lines.push("=".repeat(72));
    lines.push(name.padStart(36 + name.length / 2));
    lines.push(headline.padStart(36 + headline.length / 2));
    lines.push(`${p.email || ""} | ${p.location || "Remote"} | ${p.links?.github || ""}`.padStart(50));
    lines.push("=".repeat(72));
    lines.push("\nProfessional Abstract\n" + "-".repeat(72));
    lines.push(p.summary || `Technical practitioner with ${p.years || 2}+ years delivering verified systems.`);
    lines.push("\nAcademic Credentials\n" + "-".repeat(72));
    lines.push(p.education || "Bachelor of Science in Computer Science");
    lines.push("\nTechnical Competencies\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nSoftware Artifacts & Contributions (APA 7th Format)\n" + "-".repeat(72));
    (p.projects || []).forEach((proj) => {
      lines.push(`${name}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ") || "Full Stack"}].`);
      lines.push(`    Description: ${proj.text}`);
    });
  } else if (fmt === "staff_architect") {
    lines.push("=".repeat(72));
    lines.push(`STAFF+ SYSTEMS ARCHITECT DOSSIER // ${name.toUpperCase()}`);
    lines.push(`Target Scope: ${headline} | ${p.location || "Remote"}`);
    lines.push("=".repeat(72));
    lines.push("\n[1.0] EXECUTIVE ARCHITECTURAL SUMMARY\n" + "-".repeat(72));
    lines.push(p.summary || `Staff-level engineer with ${p.years || 6}+ years architecting mission-critical platforms.`);
    lines.push("\n[2.0] SYSTEM ARCHITECTURAL COMPETENCIES\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\n[3.0] PRODUCTION SYSTEMS & ARCHITECTURAL INITIATIVES\n" + "-".repeat(72));
    (p.experience || []).forEach((exp, i) => {
      lines.push(`[3.${i + 1}] ${exp.role || exp.title || "Architect"} @ ${exp.company} (${exp.dates || "Recent"})`);
      if (exp.metrics) lines.push(`      Scale Metric: ${exp.metrics}`);
      lines.push(`      Execution:    ${exp.text || (exp.bullets ? exp.bullets.join(" ") : "")}`);
    });
  } else if (fmt === "minimalist_swiss") {
    lines.push(name.toUpperCase());
    lines.push(`${headline}  //  ${p.email || ""}  //  ${p.location || "Remote"}`);
    lines.push("-".repeat(72));
    lines.push("\nOVERVIEW");
    lines.push(p.summary || `Practitioner with ${p.years || 2}+ years delivering verified systems.`);
    lines.push("\nCORE COMPETENCIES");
    lines.push(skillsList);
    lines.push("\nEXPERIENCE");
    (p.experience || []).forEach((exp) => {
      lines.push(`${(exp.dates || "Present").padEnd(16)} ${exp.role || exp.title || "Engineer"} — ${exp.company}`);
      if (exp.metrics) lines.push(`${" ".repeat(16)} • Impact: ${exp.metrics}`);
      lines.push(`${" ".repeat(16)} • ${exp.text || (exp.bullets ? exp.bullets.join(" ") : "")}`);
    });
  } else {
    lines.push(name.toUpperCase());
    lines.push(headline);
    lines.push(`${p.email || ""} | ${p.phone || ""} | ${p.location || "Remote"}`);
    lines.push("=".repeat(72));
    lines.push("\nEXECUTIVE SUMMARY\n" + "-".repeat(72));
    lines.push(p.summary || `Experienced engineering leader specializing in ${skillsList}.`);
    lines.push("\nCORE COMPETENCIES\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nPROFESSIONAL EXPERIENCE\n" + "-".repeat(72));
    (p.experience || []).forEach((exp) => {
      lines.push(`${exp.role || exp.title || "Engineer"} | ${exp.company} (${exp.dates || "Recent"})`);
      if (exp.metrics) lines.push(`Impact: ${exp.metrics}`);
      (exp.bullets || (exp.text ? [exp.text] : [])).forEach((b) => lines.push(`  - ${b}`));
    });
    lines.push("\nEDUCATION\n" + "-".repeat(72));
    lines.push(p.education || "B.S. in Computer Science");
  }

  const rawText = lines.join("\n");
  const isSerif = fmt === "harvard_executive" || fmt === "cambridge_classic" || fmt === "apa_7th";
  const fontFamily = isSerif
    ? "Georgia, 'Times New Roman', serif"
    : fmt === "ieee_engineering" || fmt === "staff_architect"
    ? "'JetBrains Mono', monospace"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} - Resume (${label})</title>
  <style>
    body { font-family: ${fontFamily}; font-size: ${density === "compact" ? "9.5pt" : "11pt"}; line-height: ${density === "compact" ? "1.35" : "1.55"}; color: #111; background: #fff; margin: 0 auto; max-width: 8.2in; padding: 0.4in; }
    .header { text-align: ${fmt === "harvard_executive" || fmt === "cambridge_classic" ? "center" : "left"}; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    h1 { font-size: 18pt; margin: 0; font-weight: 700; ${fmt === "cambridge_classic" ? "font-variant: small-caps; letter-spacing: 0.05em;" : ""} }
    .headline { font-size: 11pt; color: #333; margin: 2px 0; font-style: ${fmt === "apa_7th" ? "italic" : "normal"}; }
    .contact { font-size: 9pt; color: #555; font-family: monospace; }
    .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 2px; margin: 12px 0 6px 0; letter-spacing: 0.5px; }
    .item { margin-bottom: 8px; }
    .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 10pt; }
    p { margin: 2px 0 6px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="headline">${headline}</div>
    <div class="contact">${p.email || ""} | ${p.location || "Remote"} ${p.links?.github ? `| ${p.links.github}` : ""}</div>
  </div>
  <div class="section-title">Summary</div>
  <p>${p.summary || `Technical practitioner with ${p.years || 2}+ years delivering verified systems.`}</p>
  <div class="section-title">Core Competencies</div>
  <p>${skillsList}</p>
  ${
    p.experience?.length
      ? `<div class="section-title">Experience</div>` +
        p.experience
          .map(
            (e) => `<div class="item">
              <div class="item-header"><span>${e.role || e.title || "Engineer"} &mdash; ${e.company}</span><span>${e.dates || "Recent"}</span></div>
              ${e.metrics ? `<p style="font-size: 9pt; font-style: italic; color: #047857;">Verified Metric: ${e.metrics}</p>` : ""}
              <p>${e.text || (e.bullets ? e.bullets.join(" ") : "")}</p>
            </div>`
          )
          .join("")
      : ""
  }
  ${
    p.projects?.length
      ? `<div class="section-title">Projects & Software Artifacts</div>` +
        p.projects
          .map(
            (proj) => `<div class="item">
              <div class="item-header"><span>${proj.name}</span><span>${proj.tech?.join(", ") || ""}</span></div>
              <p>${proj.text}</p>
            </div>`
          )
          .join("")
      : ""
  }
  ${
    p.certifications?.length
      ? `<div class="section-title">Certifications & Honors</div>` +
        p.certifications
          .map(
            (c) => `<div class="item">
              <div class="item-header"><span>${c.name}</span><span>${c.date || "Verified"}</span></div>
              <p style="font-size: 9pt; color: #555;">Issuer: ${c.issuer}${c.credential_id ? ` &bull; ID: ${c.credential_id}` : ""}</p>
            </div>`
          )
          .join("")
      : ""
  }
  ${
    p.licenses?.length
      ? `<div class="section-title">Licenses & Accreditations</div>` +
        p.licenses
          .map(
            (l) => `<div class="item">
              <div class="item-header"><span>${l.name}</span><span>${l.date || "Active"}</span></div>
              <p style="font-size: 9pt; color: #555;">Authority: ${l.authority}${l.number ? ` &bull; #: ${l.number}` : ""}</p>
            </div>`
          )
          .join("")
      : ""
  }
  <div class="section-title">Education</div>
  <p>${p.education || "Bachelor of Science in Computer Science"}</p>
</body>
</html>`;

  return { text: rawText, html, format_label: label };
}
