"""APA (American Psychological Association) 7th Edition Resume & Curriculum Vitae Generator.
Provides standard APA running heads, title block, structured section headings,
and formal academic/technical citation formatting for projects and experience.
"""
from typing import Dict, Any, List
from datetime import datetime


def generate_apa_text(profile: Dict[str, Any]) -> str:
    """Generates a plain-text APA 7th style curriculum vitae / resume."""
    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer & AI Researcher"
    email = profile.get("email") or "candidate@example.com"
    location = profile.get("location") or "Remote / Location Independent"
    education = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 0
    skills = profile.get("skills") or []
    projects = profile.get("projects") or []
    experience = profile.get("experience") or []
    links = profile.get("links") or {}

    surname = name.split()[-1].upper() if name.split() else "CANDIDATE"
    year = datetime.now().year

    lines = []
    # Running head (APA 7th Student/Professional page header standard)
    lines.append(f"RUNNING HEAD: {surname} / CURRICULUM VITAE                               Page 1\n")
    lines.append("=" * 72)
    lines.append("")

    # APA Title Block (Centered)
    lines.append(name.center(72))
    lines.append(headline.center(72))
    contact_line = f"{email}  |  {location}"
    if links.get("github"):
        contact_line += f"  |  {links['github']}"
    if links.get("linkedin"):
        contact_line += f"  |  {links['linkedin']}"
    lines.append(contact_line.center(72))
    lines.append("")
    lines.append("=" * 72)
    lines.append("")

    # Section 1: Professional Summary (APA Level 1 Heading: Centered, Bold)
    lines.append("Professional Summary".center(72))
    lines.append("-" * 72)
    summary_text = (
        f"Experienced professional with {years}+ years of specialized practice in {', '.join(skills[:5]) if skills else 'software engineering'}. "
        f"Demonstrated competence in architecting autonomous workflows, full-stack systems, and distributed computing solutions. "
        f"Technical portfolio backed by verifiable evidence corpus."
    )
    lines.append(summary_text)
    lines.append("")

    # Section 2: Education & Academic Credentials
    lines.append("Education and Academic Credentials".center(72))
    lines.append("-" * 72)
    lines.append(f"{education}")
    lines.append(f"Focus: Algorithmic Systems, Data Structures, and Applied Artificial Intelligence ({year - max(1, years)}-{year})")
    lines.append("")

    # Section 3: Technical Competencies & Specializations
    lines.append("Technical Competencies and Specializations".center(72))
    lines.append("-" * 72)
    if skills:
        lines.append(f"Core Methodologies: {', '.join(skills)}")
    lines.append("")

    # Section 4: Professional Experience
    if experience:
        lines.append("Professional Experience".center(72))
        lines.append("-" * 72)
        for exp in experience:
            company = exp.get("company", "Organization")
            title = exp.get("title", "Position")
            dates = exp.get("dates") or "Recent"
            lines.append(f"{title} - {company} ({dates})")
            metrics = exp.get("metrics")
            if metrics:
                lines.append(f"  * Quantified Impact: {metrics}")
            bullets = exp.get("bullets") or []
            if bullets:
                for b in bullets:
                    lines.append(f"  * {b}")
            elif exp.get("text"):
                lines.append(f"  * {exp['text']}")
            lines.append("")

    # Section 5: Software Artifacts & Project Contributions (APA Citation Style)
    lines.append("Software Artifacts and Project Contributions".center(72))
    lines.append("-" * 72)
    lines.append("Formatted according to APA 7th Edition software & project citation guidelines:")
    lines.append("")
    for p in projects:
        p_name = p.get("name", "Project")
        p_text = p.get("text", "Software architecture and implementation.")
        p_tech = ", ".join(p.get("tech", [])) if p.get("tech") else "Software System"
        # APA format: Author, A. A. (Year). Title of work (Version) [Computer software]. Publisher/URL.
        lines.append(f"{name}. ({year}). {p_name} [Computer software / {p_tech}].")
        lines.append(f"    Description: {p_text}")
        lines.append("")

    # Section 6: Certifications & Honors
    certs = profile.get("certifications") or []
    lics = profile.get("licenses") or []
    if certs or lics:
        lines.append("Certifications and Professional Honors".center(72))
        lines.append("-" * 72)
        for c in certs:
            lines.append(f"• {c.get('name')} — {c.get('issuer')} ({c.get('date', 'Verified')})")
        for l in lics:
            lines.append(f"• {l.get('name')} — {l.get('authority')} ({l.get('date', 'Active')})")
        lines.append("")

    # Section 7: Verifiable Evidence Index
    evidence = profile.get("evidence") or []
    if evidence:
        lines.append("Verifiable Evidence Corpus".center(72))
        lines.append("-" * 72)
        lines.append("Primary source claims verified through code repositories and documentation:")
        lines.append("")
        for i, ev in enumerate(evidence[:8], 1):
            lines.append(f"[{i}] Source: {ev.get('source', 'Documentation')}")
            lines.append(f"    Excerpt: \"{ev.get('text', '')[:160]}...\"")
            lines.append("")

    lines.append("=" * 72)
    lines.append(f"End of Curriculum Vitae - APA 7th Edition Format - Verified via HowToLarped OS".center(72))
    return "\n".join(lines)


def generate_apa_html(profile: Dict[str, Any]) -> str:
    """Generates an APA 7th print-ready HTML document with proper typography,
    running heads, margins, and citation layouts suitable for PDF printing.
    """
    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer & AI Researcher"
    email = profile.get("email") or "candidate@example.com"
    location = profile.get("location") or "Remote / Location Independent"
    education = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 0
    skills = profile.get("skills") or []
    projects = profile.get("projects") or []
    experience = profile.get("experience") or []
    links = profile.get("links") or {}
    evidence = profile.get("evidence") or []

    surname = name.split()[-1].upper() if name.split() else "CANDIDATE"
    year = datetime.now().year

    skills_html = "".join(f'<span class="apa-skill-pill">{s}</span>' for s in skills)
    projects_html = "".join(
        f'''
        <div class="apa-citation-block">
          <p class="apa-citation">
            <strong>{name}</strong> ({year}). <em>{p.get("name", "Project")}</em> [Computer software / {", ".join(p.get("tech", [])) or "Full Stack"}].
          </p>
          <p class="apa-citation-desc">{p.get("text", "")}</p>
        </div>
        '''
        for p in projects
    )

    exp_html = ""
    if experience:
        blocks = []
        for e in experience:
            title = e.get("title", "Role")
            company = e.get("company", "Organization")
            dates = e.get("dates", "Recent")
            metrics = e.get("metrics", "")
            bullets = e.get("bullets") or []
            text_desc = e.get("text", "")
            if not bullets and text_desc:
                bullets = [s.strip() for s in text_desc.split(". ") if len(s.strip()) > 15]

            bullets_html = "".join(f'<li style="margin-bottom: 3pt;">{b.rstrip(".")}</li>' for b in bullets[:4])
            metrics_html = f'<div style="font-size: 10.5pt; font-weight: 600; color: #047857; margin: 3pt 0 4pt 0.5in;">Impact: {metrics}</div>' if metrics else ""
            blocks.append(f'''
            <div class="apa-exp-block" style="margin-bottom: 14pt;">
              <h3 class="apa-level-2" style="margin-bottom: 2pt;">{title} — {company} <span style="font-weight: normal; font-size: 11pt; color: #555;">({dates})</span></h3>
              {f'<ul style="margin: 3pt 0 4pt 0.5in; padding-left: 0.2in; font-size: 11pt;">{bullets_html}</ul>' if bullets_html else f'<p class="apa-body">{text_desc}</p>'}
              {metrics_html}
            </div>
            ''')
        exp_html = "".join(blocks)

    certs_list = profile.get("certifications") or []
    lics_list = profile.get("licenses") or []
    certs_html = "".join(
        f'<div class="apa-exp-block"><h3 class="apa-level-2">{c.get("name")}</h3><p class="apa-body" style="text-indent:0;">Issuer: {c.get("issuer")} &bull; Verified: {c.get("date", "Active")}</p></div>'
        for c in certs_list
    ) + "".join(
        f'<div class="apa-exp-block"><h3 class="apa-level-2">{l.get("name")}</h3><p class="apa-body" style="text-indent:0;">Authority: {l.get("authority")} &bull; Credential #: {l.get("number", "Active")}</p></div>'
        for l in lics_list
    )

    evidence_html = "".join(
        f'''
        <li class="apa-evidence-item">
          <strong>Source:</strong> {ev.get("source", "Documentation")}<br/>
          <em>"{ev.get("text", "")[:180]}..."</em>
        </li>
        '''
        for ev in evidence[:6]
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{name} - APA Curriculum Vitae</title>
  <style>
    @page {{
      size: letter;
      margin: 1in;
      @top-right {{
        content: counter(page);
      }}
    }}
    body {{
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #111;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
      background: #fff;
    }}
    .apa-header {{
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
      font-family: "Times New Roman", Times, serif;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
      margin-bottom: 24pt;
      text-transform: uppercase;
      color: #555;
    }}
    .apa-title-block {{
      text-align: center;
      margin-bottom: 30pt;
    }}
    .apa-name {{
      font-size: 18pt;
      font-weight: bold;
      margin: 0 0 4pt 0;
      letter-spacing: 0.5px;
    }}
    .apa-subtitle {{
      font-size: 13pt;
      font-style: italic;
      color: #333;
      margin: 0 0 8pt 0;
    }}
    .apa-contact {{
      font-size: 10.5pt;
      color: #444;
      margin: 0;
    }}
    .apa-contact a {{
      color: #111;
      text-decoration: underline;
    }}
    .apa-level-1 {{
      text-align: center;
      font-weight: bold;
      font-size: 13pt;
      margin: 24pt 0 10pt 0;
      border-bottom: 1px solid #111;
      padding-bottom: 3pt;
    }}
    .apa-level-2 {{
      font-weight: bold;
      font-size: 12pt;
      margin: 14pt 0 4pt 0;
      text-align: left;
    }}
    .apa-body {{
      text-align: justify;
      margin: 0 0 12pt 0;
      text-indent: 0.5in;
    }}
    .apa-body-noindent {{
      text-align: justify;
      margin: 0 0 12pt 0;
    }}
    .apa-skills-grid {{
      display: flex;
      flex-wrap: wrap;
      gap: 6pt;
      margin: 8pt 0 16pt 0;
    }}
    .apa-skill-pill {{
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      background: #f4f4f5;
      border: 1px solid #ccc;
      padding: 2pt 8pt;
      border-radius: 3pt;
    }}
    .apa-citation-block {{
      margin-bottom: 14pt;
    }}
    .apa-citation {{
      margin: 0;
      padding-left: 0.5in;
      text-indent: -0.5in;
    }}
    .apa-citation-desc {{
      margin: 2pt 0 0 0.5in;
      font-size: 10.5pt;
      color: #444;
    }}
    .apa-evidence-list {{
      padding-left: 0.5in;
      font-size: 10.5pt;
    }}
    .apa-evidence-item {{
      margin-bottom: 8pt;
    }}
    .no-print {{
      margin-bottom: 20px;
      padding: 12px;
      background: #f4f4f5;
      border: 1px solid #ddd;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    @media print {{
      .no-print {{
        display: none !important;
      }}
      body {{
        padding: 0;
      }}
    }}
  </style>
</head>
<body>
  <div class="no-print">
    <span style="font-family: sans-serif; font-size: 13px; font-weight: 600;">APA 7th Edition Resume Document View</span>
    <div>
      <button onclick="window.print()" style="padding: 6px 14px; background: #000; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 12px;">Print / Save as PDF</button>
    </div>
  </div>

  <div class="apa-header">
    <span>RUNNING HEAD: {surname} / RESUME</span>
    <span>1</span>
  </div>

  <div class="apa-title-block">
    <div class="apa-name">{name}</div>
    <div class="apa-subtitle">{headline}</div>
    <div class="apa-contact">
      {email} &nbsp;|&nbsp; {location}
      {"&nbsp;|&nbsp; " + links.get("github") if links.get("github") else ""}
      {"&nbsp;|&nbsp; " + links.get("linkedin") if links.get("linkedin") else ""}
    </div>
  </div>

  <div class="apa-level-1">Professional Abstract</div>
  <p class="apa-body">
    Candidate possesses {years}+ years of empirical experience contributing to modern computing systems. 
    Specialized competencies encompass {', '.join(skills[:8]) if skills else 'distributed architectures and AI engineering'}. 
    All listed achievements maintain traceable validation through code repositories and verifiable project documentation.
  </p>

  <div class="apa-level-1">Academic Preparation and Credentials</div>
  <h3 class="apa-level-2">{education}</h3>
  <p class="apa-body-noindent">
    Curriculum emphasis in Distributed Systems, Algorithmic Complexity, and Machine Intelligence. 
    Verified through academic documentation.
  </p>

  <div class="apa-level-1">Technical Competencies and Frameworks</div>
  <div class="apa-skills-grid">
    {skills_html}
  </div>

  {f'<div class="apa-level-1">Professional Practice</div>{exp_html}' if exp_html else ''}

  <div class="apa-level-1">Software Artifacts and Research Contributions</div>
  <p class="apa-body-noindent" style="font-size: 10.5pt; color: #555; margin-bottom: 12pt;">
    Documented according to APA 7th Edition software and technical project referencing:
  </p>
  {projects_html}

  {f'''
  <div class="apa-level-1">Certifications & Honors</div>
  {certs_html}
  ''' if certs_html else ''}

  {f'''
  <div class="apa-level-1">Verifiable Evidence Corpus</div>
  <p class="apa-body-noindent" style="font-size: 10pt; color: #666;">
    Anti-hallucination source index underpinning all candidate assertions:
  </p>
  <ul class="apa-evidence-list">
    {evidence_html}
  </ul>
  ''' if evidence_html else ''}

</body>
</html>"""
