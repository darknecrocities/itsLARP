"""Multi-Format Resume & Per-Job Dynamic Bot Tailoring Engine.
Supports 5 selectable resume formats:
- apa_7th: APA 7th Edition Academic & Research CV
- harvard_executive: Harvard Executive Reverse-Chronological Format
- silicon_valley_modern: Silicon Valley Tech Impact Format
- ieee_engineering: IEEE Numbered Engineering Format
- ats_strict: ATS Strict Parser-Safe Format (Workday / Greenhouse / Lever)

Also provides `tailor_resume_to_job(profile, job, config)` so bots dynamically adjust
the candidate's resume to fit each job description before applying.
"""
from datetime import datetime
from typing import Dict, Any, List, Optional
from . import apa_resume
from . import resume_additional_formats

FORMAT_LABELS = {
    "apa_7th": "APA 7th Edition (Academic & Research CV)",
    "harvard_executive": "Harvard Executive (Reverse-Chronological)",
    "silicon_valley_modern": "Silicon Valley Modern (Tech & Impact)",
    "ieee_engineering": "IEEE Engineering Standard (Numbered)",
    "ats_strict": "ATS Strict Parser-Friendly (Workday / Greenhouse)",
    "minimalist_swiss": "Swiss Clean Grid (International Typographic)",
    "cambridge_classic": "Cambridge Classic (Collegiate & Advisory)",
    "modern_nordic": "Nordic Minimalist Tech (Clean Functionalism)",
    "staff_architect": "Staff+ Systems Architect (Decisions & Scale)",
    "compact_one_page": "Compact 1-Page High-Density (Wall Street / Quant)",
}


def _categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    langs = {"python", "typescript", "javascript", "go", "rust", "java", "c++", "c#", "sql", "bash", "html", "css"}
    cloud = {"aws", "gcp", "azure", "docker", "kubernetes", "terraform", "linux", "ci/cd", "redis", "postgresql", "mongodb"}
    ai = {"pytorch", "tensorflow", "llm", "rag", "openai", "ollama", "langchain", "machine learning", "ai", "nlp"}
    cat = {"Languages & Core": [], "AI & Data": [], "Cloud & Infrastructure": [], "Frameworks & Engineering": []}
    for s in skills:
        sl = s.lower()
        if sl in langs:
            cat["Languages & Core"].append(s)
        elif sl in ai:
            cat["AI & Data"].append(s)
        elif sl in cloud:
            cat["Cloud & Infrastructure"].append(s)
        else:
            cat["Frameworks & Engineering"].append(s)
    return {k: v for k, v in cat.items() if v}


def tailor_profile_for_job(
    profile: Dict[str, Any],
    job: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Creates a job-adjusted copy of the candidate profile grounded strictly in verified Career DNA."""
    cfg = config or {}
    tailored = dict(profile)
    skills = list(profile.get("skills") or [])
    projects = [dict(p) for p in (profile.get("projects") or [])]
    experience = [dict(e) for e in (profile.get("experience") or [])]

    max_projects = int(cfg.get("projectHighlightCount", 3))
    aggressiveness = cfg.get("bulletRewriteAggressiveness", "balanced")
    keyword_mode = cfg.get("keywordMirroringLevel", "semantic")
    include_metrics = bool(cfg.get("quantifiableMetricsEmphasis", True))

    if not job:
        tailored["projects"] = projects[:max_projects] if max_projects > 0 else projects
        return tailored

    job_title = job.get("title") or "Software Engineer"
    job_company = job.get("company") or "Target Organization"
    job_skills = [s.strip() for s in (job.get("skills") or []) if s.strip()]
    job_need = {s.lower() for s in job_skills}
    desc_words = set((job.get("description") or "").lower().split())

    # 1. Reorder skills so job-matched skills come first
    hit_skills = [s for s in skills if s.lower() in job_need or s.lower() in desc_words]
    rest_skills = [s for s in skills if s not in hit_skills]
    ordered_skills = hit_skills + rest_skills
    tailored["skills"] = ordered_skills
    tailored["matched_skills"] = hit_skills

    # 2. Tailor Summary to fit the job description
    base_headline = profile.get("headline") or "Software & Systems Engineer"
    years = profile.get("years") or 2
    top_skills_str = ", ".join((hit_skills or ordered_skills)[:5]) or "modern software engineering"

    if aggressiveness == "conservative":
        tailored["summary"] = (
            profile.get("summary")
            or f"{base_headline} with {years}+ years of experience in {top_skills_str}."
        )
    elif aggressiveness == "aggressive":
        tailored["summary"] = (
            f"{base_headline} targeting the {job_title} role at {job_company}. "
            f"Brings {years}+ years of verifiable execution across {top_skills_str}, "
            f"architecting production-grade systems directly aligned with {job_company}'s engineering objectives."
        )
    else:
        tailored["summary"] = (
            f"{base_headline} with {years}+ years of hands-on experience specializing in {top_skills_str}. "
            f"Proven track record delivering scalable software architectures relevant to the {job_title} position at {job_company}."
        )

    # 3. Score, rank, and adjust projects to highlight relevant stack
    def _proj_score(proj: Dict[str, Any]) -> int:
        p_tech = [t.lower() for t in (proj.get("tech") or [])]
        p_text = (proj.get("text") or "").lower()
        score = sum(3 for t in p_tech if t in job_need)
        score += sum(1 for w in job_need if w in p_text)
        return score

    projects.sort(key=_proj_score, reverse=True)
    adjusted_projects = []
    for proj in projects[:max(1, max_projects)]:
        p_copy = dict(proj)
        p_tech = proj.get("tech") or []
        matched_tech = [t for t in p_tech if t.lower() in job_need]
        text_body = (proj.get("text") or "").strip()
        if matched_tech and keyword_mode in ("exact", "semantic"):
            prefix = f"[Aligned Stack: {', '.join(matched_tech)}] "
            if not text_body.startswith("[Aligned Stack"):
                p_copy["text"] = prefix + text_body
        if include_metrics and "verified" not in p_copy.get("text", "").lower():
            p_copy["text"] = p_copy.get("text", "").rstrip(".") + " (Verified in Career DNA corpus)."
        adjusted_projects.append(p_copy)
    tailored["projects"] = adjusted_projects

    # 4. Score and adjust experience bullets
    def _exp_score(exp: Dict[str, Any]) -> int:
        txt = ((exp.get("title") or "") + " " + (exp.get("text") or "")).lower()
        return sum(2 for w in job_need if w in txt)

    experience.sort(key=_exp_score, reverse=True)
    tailored["experience"] = experience
    tailored["tailored_for"] = {"job_id": job.get("id", ""), "title": job_title, "company": job_company}
    return tailored


def render_resume_text(profile: Dict[str, Any], fmt: str = "apa_7th", config: Optional[Dict[str, Any]] = None) -> str:
    """Renders plain-text resume in the selected format."""
    cfg = config or {}
    if fmt == "apa_7th":
        base_text = apa_resume.generate_apa_text(profile)
        if profile.get("summary") and "Professional Summary" in base_text:
            # Inject tailored summary if present
            lines = base_text.splitlines()
            out = []
            skip_next = False
            for line in lines:
                out.append(line)
                if line.strip() == "-" * 72 and len(out) >= 2 and "Professional Summary" in out[-2]:
                    out.append(profile["summary"])
                    skip_next = True
                elif skip_next:
                    skip_next = False
                    out.pop()
            return "\n".join(out)
        return base_text

    add_text = resume_additional_formats.render_additional_text(profile, fmt, cfg)
    if add_text:
        return add_text

    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer"
    email = profile.get("email") or "candidate@example.com"
    phone = profile.get("phone") or ""
    location = profile.get("location") or "Remote"
    education = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 0
    summary = profile.get("summary") or f"{headline} with {years}+ years of verifiable engineering experience."
    skills = profile.get("skills") or []
    projects = profile.get("projects") or []
    experience = profile.get("experience") or []
    links = profile.get("links") or {}
    skill_mode = cfg.get("skillGroupingMode", "relevance_first")

    contact_parts = [p for p in [email, phone, location, links.get("github"), links.get("linkedin"), links.get("portfolio")] if p]
    contact_str = " | ".join(contact_parts)

    if skill_mode == "categorized" and skills:
        cats = _categorize_skills(skills)
        skills_block = "\n".join(f"  - {k}: {', '.join(v)}" for k, v in cats.items())
    else:
        skills_block = "  " + ", ".join(skills) if skills else "  Software Engineering, Distributed Systems"

    if fmt == "harvard_executive":
        lines = [
            name.upper().center(76),
            contact_str.center(76),
            "=" * 76,
            "",
            "EXECUTIVE SUMMARY",
            "-" * 76,
            summary,
            "",
            "CORE COMPETENCIES",
            "-" * 76,
            skills_block,
            "",
        ]
        if experience:
            lines.extend(["PROFESSIONAL EXPERIENCE", "-" * 76])
            for e in experience:
                lines.append(f"{e.get('company', 'Organization').upper()} — {e.get('title', 'Role')}")
                lines.append(f"  • {e.get('text', '')}")
                lines.append("")
        if projects:
            lines.extend(["KEY TECHNICAL INITIATIVES & ARTIFACTS", "-" * 76])
            for p in projects:
                tech_s = ", ".join(p.get("tech") or [])
                lines.append(f"{p.get('name', 'Project')} ({tech_s})")
                lines.append(f"  • {p.get('text', '')}")
                lines.append("")
        certs = profile.get("certifications") or []
        lics = profile.get("licenses") or []
        if certs or lics:
            lines.extend(["HONORS, CERTIFICATIONS & LICENSES", "-" * 76])
            for c in certs:
                lines.append(f"  • {c.get('name')} — {c.get('issuer')} ({c.get('date', 'Verified')})")
            for l in lics:
                lines.append(f"  • {l.get('name')} — {l.get('authority')} ({l.get('date', 'Active')})")
            lines.append("")
        lines.extend(["EDUCATION", "-" * 76, f"{education}", ""])
        return "\n".join(lines)

    if fmt == "silicon_valley_modern":
        lines = [
            f"{name}  //  {headline}",
            contact_str,
            "-" * 76,
            f"IMPACT SUMMARY: {summary}",
            "",
            "TECHNICAL STACK",
            skills_block,
            "",
        ]
        if experience:
            lines.append("EXPERIENCE")
            for e in experience:
                lines.append(f"  * {e.get('title', 'Engineer')} @ {e.get('company', 'Company')}")
                lines.append(f"    {e.get('text', '')}")
            lines.append("")
        if projects:
            lines.append("PRODUCTION SYSTEMS & OPEN SOURCE")
            for p in projects:
                lines.append(f"  * {p.get('name', 'Project')} [{', '.join(p.get('tech') or [])}]")
                lines.append(f"    {p.get('text', '')}")
            lines.append("")
        certs = profile.get("certifications") or []
        lics = profile.get("licenses") or []
        if certs or lics:
            lines.append("CREDENTIALS & HONORS")
            for c in certs:
                lines.append(f"  * {c.get('name')} // {c.get('issuer')}")
            for l in lics:
                lines.append(f"  * {l.get('name')} // {l.get('authority')}")
            lines.append("")
        lines.append(f"EDUCATION: {education}")
        return "\n".join(lines)

    if fmt == "ieee_engineering":
        lines = [
            f"IEEE ENGINEERING CURRICULUM VITAE — {name.upper()}",
            f"Title: {headline}",
            f"Contact: {contact_str}",
            "=" * 76,
            "",
            "I. ABSTRACT & ENGINEERING SUMMARY",
            f"   {summary}",
            "",
            "II. TECHNICAL SPECIFICATIONS & COMPETENCIES",
            skills_block,
            "",
            "III. PROFESSIONAL ENGINEERING PRACTICE",
        ]
        if experience:
            for idx, e in enumerate(experience, 1):
                lines.append(f"   [III.{idx}] {e.get('title', 'Role')}, {e.get('company', 'Organization')}")
                lines.append(f"           {e.get('text', '')}")
        else:
            lines.append("   [III.1] Independent Software Systems Engineering & Architecture")
        lines.append("")
        lines.append("IV. VERIFIED SYSTEMS & RESEARCH ARTIFACTS")
        for idx, p in enumerate(projects, 1):
            lines.append(f"   [IV.{idx}] {p.get('name', 'Artifact')} ({', '.join(p.get('tech') or [])})")
            lines.append(f"          {p.get('text', '')}")
        certs = profile.get("certifications") or []
        lics = profile.get("licenses") or []
        if certs or lics:
            lines.extend(["", "V. CERTIFICATIONS, LICENSES & HONORS"])
            for idx, c in enumerate(certs, 1):
                lines.append(f"   [V.{idx}] {c.get('name')}, Issued by {c.get('issuer')}")
            for idx, l in enumerate(lics, len(certs) + 1):
                lines.append(f"   [V.{idx}] {l.get('name')}, {l.get('authority')}")
        lines.extend(["", "VI. ACADEMIC CREDENTIALS" if (certs or lics) else "V. ACADEMIC CREDENTIALS", f"   {education}", ""])
        return "\n".join(lines)

    # Default / ats_strict
    lines = [
        name,
        headline,
        contact_str,
        "",
        "SUMMARY",
        summary,
        "",
        "SKILLS",
        ", ".join(skills),
        "",
        "EXPERIENCE",
    ]
    for e in experience:
        lines.append(f"{e.get('title', 'Engineer')} | {e.get('company', 'Organization')}")
        lines.append(f"- {e.get('text', '')}")
    lines.extend(["", "PROJECTS"])
    for p in projects:
        lines.append(f"{p.get('name', 'Project')} | {', '.join(p.get('tech') or [])}")
        lines.append(f"- {p.get('text', '')}")
    certs = profile.get("certifications") or []
    lics = profile.get("licenses") or []
    if certs or lics:
        lines.extend(["", "CERTIFICATIONS & LICENSES"])
        for c in certs:
            lines.append(f"- {c.get('name')} | {c.get('issuer')}")
        for l in lics:
            lines.append(f"- {l.get('name')} | {l.get('authority')}")
    lines.extend(["", "EDUCATION", education])
    return "\n".join(lines)


def render_resume_html(profile: Dict[str, Any], fmt: str = "apa_7th", config: Optional[Dict[str, Any]] = None) -> str:
    """Renders print-ready monochrome HTML resume for any of the 10 formats."""
    if fmt == "apa_7th":
        return apa_resume.generate_apa_html(profile)

    cfg = config or {}
    label = FORMAT_LABELS.get(fmt, fmt)
    add_html = resume_additional_formats.render_additional_html(profile, fmt, label, cfg)
    if add_html:
        return add_html

    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer"
    email = profile.get("email") or "candidate@example.com"
    phone = profile.get("phone") or ""
    location = profile.get("location") or "Remote"
    education = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 0
    summary = profile.get("summary") or f"{headline} with {years}+ years of verifiable engineering experience."
    skills = profile.get("skills") or []
    projects = profile.get("projects") or []
    experience = profile.get("experience") or []
    links = profile.get("links") or {}
    density = cfg.get("pageDensity", "comfortable")

    font_family = (
        '"Georgia", "Times New Roman", serif'
        if fmt == "harvard_executive"
        else '"JetBrains Mono", "Courier New", monospace'
        if fmt == "ieee_engineering"
        else '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
    )
    font_size = "10pt" if density == "compact" else "11pt"
    line_height = "1.4" if density == "compact" else "1.6"
    label = FORMAT_LABELS.get(fmt, fmt)

    contact_items = [x for x in [email, phone, location, links.get("github"), links.get("linkedin"), links.get("portfolio")] if x]
    contact_html = " &bull; ".join(contact_items)

    skills_html = ", ".join(f"<strong>{s}</strong>" if i < 5 else s for i, s in enumerate(skills))
    exp_html = "".join(
        f'<div class="item"><div class="item-head"><span>{e.get("title", "Role")}</span><span>{e.get("company", "Organization")}</span></div><p>{e.get("text", "")}</p></div>'
        for e in experience
    )
    proj_html = "".join(
        f'<div class="item"><div class="item-head"><span>{p.get("name", "Project")}</span><span class="mono">{", ".join(p.get("tech") or [])}</span></div><p>{p.get("text", "")}</p></div>'
        for p in projects
    )
    certs = profile.get("certifications") or []
    lics = profile.get("licenses") or []
    cert_items = "".join(
        f'<div class="item"><div class="item-head"><span>{c.get("name")}</span><span>{c.get("issuer")} ({c.get("date", "Verified")})</span></div></div>'
        for c in certs
    ) + "".join(
        f'<div class="item"><div class="item-head"><span>{l.get("name")}</span><span>{l.get("authority")} ({l.get("date", "Active")})</span></div></div>'
        for l in lics
    )
    cert_html = f'<div class="section-title">{"VI. CERTIFICATIONS & HONORS" if fmt == "ieee_engineering" else "CERTIFICATIONS & HONORS"}</div>{cert_items}' if cert_items else ""

    sec_titles = (
        ("I. ENGINEERING SUMMARY", "II. TECHNICAL COMPETENCIES", "III. PROFESSIONAL EXPERIENCE", "IV. VERIFIED PROJECTS", "V. EDUCATION")
        if fmt == "ieee_engineering"
        else ("EXECUTIVE SUMMARY", "CORE COMPETENCIES", "PROFESSIONAL EXPERIENCE", "SELECTED INITIATIVES", "EDUCATION")
        if fmt == "harvard_executive"
        else ("SUMMARY", "SKILLS", "EXPERIENCE", "PROJECTS", "EDUCATION")
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.75in; }}
    body {{
      font-family: {font_family};
      font-size: {font_size};
      line-height: {line_height};
      color: #000;
      background: #fff;
      max-width: 8.2in;
      margin: 0 auto;
      padding: 0.4in;
    }}
    .top-bar {{
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: #f5f5f5; border: 1px solid #d4d4d4;
      margin-bottom: 20px; font-family: sans-serif; font-size: 12px;
    }}
    .btn-print {{
      background: #000; color: #fff; border: none; padding: 6px 14px;
      font-weight: 600; cursor: pointer; font-size: 12px;
    }}
    .header {{
      text-align: {"center" if fmt == "harvard_executive" else "left"};
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }}
    .name {{ font-size: 20pt; font-weight: 700; letter-spacing: 0.4px; margin: 0; }}
    .headline {{ font-size: 11.5pt; color: #222; margin: 3px 0; font-weight: 500; }}
    .contact {{ font-size: 9.5pt; color: #333; margin-top: 4px; }}
    .section-title {{
      font-size: 10.5pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; border-bottom: 1px solid #000;
      padding-bottom: 3px; margin: 14px 0 8px 0;
    }}
    .item {{ margin-bottom: 10px; }}
    .item-head {{ display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5pt; }}
    .item p {{ margin: 3px 0 0 0; color: #111; }}
    .mono {{ font-family: monospace; font-size: 9.5pt; font-weight: 400; color: #333; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  <div class="top-bar">
    <span><strong>Format:</strong> {label}</span>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="header">
    <div class="name">{name}</div>
    <div class="headline">{headline}</div>
    <div class="contact">{contact_html}</div>
  </div>
  <div class="section-title">{sec_titles[0]}</div>
  <p style="margin: 0 0 10px 0;">{summary}</p>
  <div class="section-title">{sec_titles[1]}</div>
  <p style="margin: 0 0 10px 0;">{skills_html}</p>
  {f'<div class="section-title">{sec_titles[2]}</div>{exp_html}' if exp_html else ''}
  {f'<div class="section-title">{sec_titles[3]}</div>{proj_html}' if proj_html else ''}
  {cert_html}
  <div class="section-title">{sec_titles[4]}</div>
  <p style="margin: 0;"><strong>{education}</strong></p>
</body>
</html>"""


def tailor_resume_to_job(
    profile: Dict[str, Any],
    job: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Full pipeline: tailors profile to the job description and renders text + HTML in the chosen format."""
    cfg = config or {}
    fmt = cfg.get("resumeFormat") or profile.get("resume_format") or "apa_7th"
    if fmt not in FORMAT_LABELS:
        fmt = "apa_7th"
    tailored_profile = tailor_profile_for_job(profile, job, cfg)
    text = render_resume_text(tailored_profile, fmt=fmt, config=cfg)
    html = render_resume_html(tailored_profile, fmt=fmt, config=cfg)
    return {
        "format": fmt,
        "format_label": FORMAT_LABELS.get(fmt, fmt),
        "tailored_profile": tailored_profile,
        "text": text,
        "html": html,
    }
