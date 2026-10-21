"""Additional Clean & Professional Resume Formats:
1. minimalist_swiss: Swiss Clean Grid (International Typographic Style, timeline gutters)
2. cambridge_classic: Cambridge Classic (Collegiate small-caps, hairline rules, elite leadership)
3. modern_nordic: Nordic Minimalist Tech (Scandinavian functionalism, pill badges, generous whitespace)
4. staff_architect: Staff+ Systems Architect (Decisions, Scale & Throughput benchmarks)
5. compact_one_page: Compact 1-Page High-Density (Wall Street / Quant ATS format)
"""
from typing import Dict, Any, List, Optional


def render_additional_text(profile: Dict[str, Any], fmt: str, config: Optional[Dict[str, Any]] = None) -> Optional[str]:
    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer"
    email = profile.get("email") or ""
    phone = profile.get("phone") or ""
    loc = profile.get("location") or "Remote"
    edu = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 2
    summary = profile.get("summary") or f"{headline} with {years}+ years of verified execution."
    skills = profile.get("skills") or []
    experience = profile.get("experience") or []
    projects = profile.get("projects") or []
    certs = profile.get("certifications") or []
    lics = profile.get("licenses") or []
    links = profile.get("links") or {}

    contact_parts = [x for x in [email, phone, loc, links.get("github"), links.get("linkedin")] if x]
    contact_str = " | ".join(contact_parts)

    if fmt == "minimalist_swiss":
        lines = [
            name.upper(),
            f"{headline}  //  {contact_str}",
            "-" * 72,
            "",
            "OVERVIEW",
            summary,
            "",
            "CORE COMPETENCIES",
            ", ".join(skills),
            "",
            "EXPERIENCE",
        ]
        for e in experience:
            dates = e.get("dates") or "Present"
            lines.append(f"{dates.ljust(16)} {e.get('title', 'Engineer')} — {e.get('company', 'Company')}")
            if e.get("metrics"):
                lines.append(f"{' ' * 16} • Impact: {e.get('metrics')}")
            lines.append(f"{' ' * 16} • {e.get('text', '')}")
            lines.append("")
        if projects:
            lines.append("TECHNICAL ARTIFACTS & SYSTEMS")
            for p in projects:
                tech_str = ", ".join(p.get("tech") or [])
                lines.append(f"  • {p.get('name', 'Project')} ({tech_str})")
                lines.append(f"    {p.get('text', '')}")
            lines.append("")
        if certs or lics:
            lines.append("CREDENTIALS")
            for c in certs:
                lines.append(f"  • {c.get('name')} ({c.get('issuer')})")
            for l in lics:
                lines.append(f"  • {l.get('name')} ({l.get('authority')})")
            lines.append("")
        lines.extend(["EDUCATION", f"  • {edu}"])
        return "\n".join(lines)

    if fmt == "cambridge_classic":
        lines = [
            "=" * 72,
            f"{name.upper()}".center(72),
            f"{headline}".center(72),
            f"{contact_str}".center(72),
            "=" * 72,
            "",
            "CURRICULUM SUMMARY",
            "-" * 72,
            summary,
            "",
            "AREAS OF TECHNICAL EXPERTISE",
            "-" * 72,
            ", ".join(skills),
            "",
            "PROFESSIONAL APPOINTMENTS & EXPERIENCE",
            "-" * 72,
        ]
        for e in experience:
            lines.append(f"{e.get('title', 'Role')}, {e.get('company', 'Institution')}")
            lines.append(f"Term: {e.get('dates', 'Verified')}")
            if e.get("metrics"):
                lines.append(f"Key Result: {e.get('metrics')}")
            lines.append(f"Description: {e.get('text', '')}")
            lines.append("")
        if projects:
            lines.extend(["RESEARCH ARTIFACTS & APPLIED SYSTEMS", "-" * 72])
            for p in projects:
                lines.append(f"{p.get('name', 'Artifact')} [{', '.join(p.get('tech') or [])}]")
                lines.append(f"  {p.get('text', '')}")
            lines.append("")
        if certs or lics:
            lines.extend(["ACADEMIC HONORS, LICENSES & CERTIFICATIONS", "-" * 72])
            for c in certs:
                lines.append(f"  • {c.get('name')} — {c.get('issuer')}")
            for l in lics:
                lines.append(f"  • {l.get('name')} — {l.get('authority')}")
            lines.append("")
        lines.extend(["ACADEMIC BACKGROUND", "-" * 72, edu])
        return "\n".join(lines)

    if fmt == "modern_nordic":
        lines = [
            f"# {name}",
            f"> {headline} · {loc}",
            f"> {contact_str}",
            "",
            "## Summary",
            summary,
            "",
            "## Stack & Tools",
            f"• {', '.join(skills)}",
            "",
            "## Work History",
        ]
        for e in experience:
            lines.append(f"### {e.get('title', 'Engineer')} at {e.get('company', 'Company')} ({e.get('dates', 'Present')})")
            if e.get("metrics"):
                lines.append(f"- Outcome: {e.get('metrics')}")
            lines.append(f"- {e.get('text', '')}")
            lines.append("")
        if projects:
            lines.append("## Featured Projects")
            for p in projects:
                lines.append(f"- {p.get('name', 'Project')} ({', '.join(p.get('tech') or [])}): {p.get('text', '')}")
            lines.append("")
        if certs or lics:
            lines.append("## Verifications & Honors")
            for c in certs:
                lines.append(f"- {c.get('name')} ({c.get('issuer')})")
            for l in lics:
                lines.append(f"- {l.get('name')} ({l.get('authority')})")
            lines.append("")
        lines.extend(["## Education", f"- {edu}"])
        return "\n".join(lines)

    if fmt == "staff_architect":
        lines = [
            "========================================================================",
            f"STAFF+ SYSTEMS ARCHITECTURE DOSSIER // {name.upper()}",
            f"Target Scope: {headline} | Status: Verified Career DNA",
            f"Contact: {contact_str}",
            "========================================================================",
            "",
            "[1.0] EXECUTIVE ARCHITECTURAL SUMMARY",
            summary,
            "",
            "[2.0] SYSTEM ARCHITECTURAL COMPETENCIES & DOMAINS",
            f"Infrastructure, Distributed Runtimes & Languages:\n  {', '.join(skills)}",
            "",
            "[3.0] PRODUCTION SYSTEMS & ARCHITECTURAL INITIATIVES",
        ]
        for idx, e in enumerate(experience, 1):
            lines.append(f"[3.{idx}] {e.get('title', 'Principal Engineer')} @ {e.get('company', 'Company')} ({e.get('dates', 'Present')})")
            if e.get("metrics"):
                lines.append(f"      Scale/Throughput Metric: {e.get('metrics')}")
            lines.append(f"      Architecture Execution:  {e.get('text', '')}")
            lines.append("")
        if projects:
            lines.append("[4.0] DEPLOYED ARCHITECTURES & OPEN SOURCE ARTIFACTS")
            for idx, p in enumerate(projects, 1):
                lines.append(f"[4.{idx}] {p.get('name', 'Architecture')} [{', '.join(p.get('tech') or [])}]")
                lines.append(f"      {p.get('text', '')}")
            lines.append("")
        if certs or lics:
            lines.append("[5.0] FORMAL ACCREDITATIONS & LICENSES")
            for c in certs:
                lines.append(f"  • {c.get('name')} // Issued by {c.get('issuer')}")
            for l in lics:
                lines.append(f"  • {l.get('name')} // {l.get('authority')}")
            lines.append("")
        lines.extend(["[6.0] FORMAL EDUCATION", f"  {edu}"])
        return "\n".join(lines)

    if fmt == "compact_one_page":
        lines = [
            f"{name.upper()} | {headline}",
            contact_str,
            "------------------------------------------------------------------------",
            f"SUMMARY: {summary}",
            f"SKILLS: {', '.join(skills)}",
            "EXPERIENCE",
        ]
        for e in experience:
            dates = e.get("dates") or "Recent"
            lines.append(f"{e.get('title', 'Role')} - {e.get('company', 'Org')} [{dates}]")
            if e.get("metrics"):
                lines.append(f"  * {e.get('metrics')}")
            lines.append(f"  * {e.get('text', '')}")
        if projects:
            lines.append("PROJECTS")
            for p in projects:
                lines.append(f"{p.get('name', 'Project')} ({', '.join(p.get('tech') or [])}): {p.get('text', '')}")
        if certs or lics:
            cert_lic_s = ", ".join([f"{c.get('name')}" for c in certs] + [f"{l.get('name')}" for l in lics])
            lines.append(f"CERTIFICATIONS: {cert_lic_s}")
        lines.append(f"EDUCATION: {edu}")
        return "\n".join(lines)

    return None


def render_additional_html(profile: Dict[str, Any], fmt: str, label: str, config: Optional[Dict[str, Any]] = None) -> Optional[str]:
    name = (profile.get("name") or "Candidate Name").strip()
    headline = profile.get("headline") or "Software Engineer"
    email = profile.get("email") or ""
    phone = profile.get("phone") or ""
    loc = profile.get("location") or "Remote"
    edu = profile.get("education") or "Bachelor of Science in Computer Science"
    years = profile.get("years") or 2
    summary = profile.get("summary") or f"{headline} with {years}+ years of verified execution."
    skills = profile.get("skills") or []
    experience = profile.get("experience") or []
    projects = profile.get("projects") or []
    certs = profile.get("certifications") or []
    lics = profile.get("licenses") or []
    links = profile.get("links") or {}

    contact_items = [x for x in [email, phone, loc, links.get("github"), links.get("linkedin")] if x]
    contact_html = " &bull; ".join(contact_items)

    top_bar = f"""<div class="top-bar">
      <span><strong>Format:</strong> {label}</span>
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
    </div>"""

    if fmt == "minimalist_swiss":
        exp_rows = "".join(
            f"""<div class="swiss-row">
              <div class="swiss-col-left">{e.get("dates", "Present")}<br><span class="swiss-sub">{e.get("company", "")}</span></div>
              <div class="swiss-col-right">
                <div class="swiss-role">{e.get("title", "Engineer")}</div>
                {f'<div class="swiss-impact">Key Metric: {e.get("metrics")}</div>' if e.get("metrics") else ''}
                <p class="swiss-body">{e.get("text", "")}</p>
              </div>
            </div>""" for e in experience
        )
        proj_rows = "".join(
            f"""<div class="swiss-row">
              <div class="swiss-col-left">{', '.join(p.get("tech") or [] [:3])}</div>
              <div class="swiss-col-right">
                <div class="swiss-role">{p.get("name", "Project")}</div>
                <p class="swiss-body">{p.get("text", "")}</p>
              </div>
            </div>""" for p in projects
        )
        skills_pills = "".join(f'<span class="swiss-pill">{s}</span>' for s in skills)
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.6in; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Inter", sans-serif; font-size: 10pt; line-height: 1.45; color: #111; max-width: 8.2in; margin: 0 auto; padding: 0.4in; }}
    .top-bar {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f4f4f5; border: 1px solid #e4e4e7; margin-bottom: 20px; font-size: 11px; }}
    .btn-print {{ background: #000; color: #fff; border: none; padding: 5px 12px; font-weight: 600; cursor: pointer; }}
    .swiss-header {{ border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }}
    .swiss-name {{ font-size: 22pt; font-weight: 800; letter-spacing: -0.02em; margin: 0; }}
    .swiss-headline {{ font-size: 12pt; color: #444; margin-top: 3px; font-weight: 500; }}
    .swiss-contact {{ font-size: 9pt; color: #666; margin-top: 5px; font-family: monospace; }}
    .swiss-sec {{ font-size: 9.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #111; padding-bottom: 3px; margin: 16px 0 10px 0; }}
    .swiss-row {{ display: flex; gap: 16px; margin-bottom: 10px; }}
    .swiss-col-left {{ width: 130px; shrink: 0; font-size: 9pt; color: #555; font-weight: 600; font-family: monospace; }}
    .swiss-col-right {{ flex: 1; }}
    .swiss-role {{ font-weight: 700; font-size: 10pt; color: #000; }}
    .swiss-sub {{ font-weight: 400; color: #777; }}
    .swiss-impact {{ font-size: 9pt; font-weight: 600; color: #047857; margin: 2px 0; }}
    .swiss-body {{ margin: 2px 0 0 0; color: #222; }}
    .swiss-pill {{ display: inline-block; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 3px; padding: 1px 7px; margin: 2px 3px 2px 0; font-size: 9pt; font-family: monospace; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  {top_bar}
  <div class="swiss-header">
    <div class="swiss-name">{name}</div>
    <div class="swiss-headline">{headline}</div>
    <div class="swiss-contact">{contact_html}</div>
  </div>
  <div class="swiss-sec">Professional Profile</div>
  <p style="margin: 0 0 10px 0;">{summary}</p>
  <div class="swiss-sec">Technical Competencies</div>
  <div style="margin-bottom: 12px;">{skills_pills}</div>
  <div class="swiss-sec">Professional Experience</div>
  {exp_rows}
  {f'<div class="swiss-sec">Key Technical Artifacts</div>{proj_rows}' if proj_rows else ''}
  <div class="swiss-sec">Education</div>
  <div class="swiss-row"><div class="swiss-col-left">Degree</div><div class="swiss-col-right"><strong>{edu}</strong></div></div>
</body>
</html>"""

    if fmt == "cambridge_classic":
        exp_blocks = "".join(
            f"""<div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 10.5pt;">
                <span>{e.get("title", "Role")}, <em>{e.get("company", "Institution")}</em></span>
                <span style="font-style: italic;">{e.get("dates", "Term")}</span>
              </div>
              {f'<div style="font-size: 9.5pt; color: #333; font-style: italic;">Result: {e.get("metrics")}</div>' if e.get("metrics") else ''}
              <p style="margin: 3px 0 0 0; text-align: justify;">{e.get("text", "")}</p>
            </div>""" for e in experience
        )
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.75in; }}
    body {{ font-family: "Garamond", "Georgia", "Times New Roman", serif; font-size: 11pt; line-height: 1.5; color: #111; max-width: 8.2in; margin: 0 auto; padding: 0.4in; }}
    .top-bar {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #fdfbf7; border: 1px solid #e7e5e4; margin-bottom: 20px; font-family: sans-serif; font-size: 11px; }}
    .btn-print {{ background: #1c1917; color: #fff; border: none; padding: 5px 12px; font-weight: 600; cursor: pointer; }}
    .camb-header {{ text-align: center; border-bottom: 1px solid #1c1917; border-top: 1px solid #1c1917; padding: 12px 0; margin-bottom: 16px; }}
    .camb-name {{ font-size: 21pt; font-variant: small-caps; letter-spacing: 0.08em; font-weight: 700; margin: 0; }}
    .camb-sub {{ font-size: 11pt; font-style: italic; color: #444; margin-top: 3px; }}
    .camb-contact {{ font-size: 9.5pt; color: #555; margin-top: 4px; }}
    .camb-sec {{ text-align: center; font-variant: small-caps; letter-spacing: 0.12em; font-size: 11pt; font-weight: 700; border-bottom: 0.5px solid #78716c; padding-bottom: 2px; margin: 16px 0 8px 0; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  {top_bar}
  <div class="camb-header">
    <div class="camb-name">{name}</div>
    <div class="camb-sub">{headline}</div>
    <div class="camb-contact">{contact_html}</div>
  </div>
  <div class="camb-sec">Professional Abstract</div>
  <p style="margin: 0 0 10px 0; text-align: justify;">{summary}</p>
  <div class="camb-sec">Areas of Scholarly & Technical Expertise</div>
  <p style="text-align: center; font-size: 10pt; margin: 0 0 10px 0;">{', '.join(skills)}</p>
  <div class="camb-sec">Professional Appointments</div>
  {exp_blocks}
  <div class="camb-sec">Academic Credentials</div>
  <p style="text-align: center; margin: 0;"><strong>{edu}</strong></p>
</body>
</html>"""

    if fmt == "modern_nordic":
        nordic_exp = "".join(
            f"""<div style="margin-bottom: 14px; padding-left: 12px; border-left: 2px solid #0284c7;">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 10.5pt; color: #0f172a;">
                <span>{e.get("title", "Engineer")} · {e.get("company", "Company")}</span>
                <span style="color: #64748b; font-size: 9pt;">{e.get("dates", "Present")}</span>
              </div>
              {f'<div style="font-size: 9pt; color: #0369a1; font-weight: 500; margin-top: 2px;">{e.get("metrics")}</div>' if e.get("metrics") else ''}
              <p style="margin: 3px 0 0 0; color: #334155; font-size: 9.5pt;">{e.get("text", "")}</p>
            </div>""" for e in experience
        )
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.65in; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10pt; line-height: 1.55; color: #0f172a; max-width: 8.2in; margin: 0 auto; padding: 0.4in; }}
    .top-bar {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 11px; }}
    .btn-print {{ background: #0f172a; color: #fff; border: none; padding: 5px 12px; font-weight: 600; cursor: pointer; }}
    .nord-header {{ margin-bottom: 20px; }}
    .nord-name {{ font-size: 24pt; font-weight: 700; color: #0f172a; margin: 0; }}
    .nord-tag {{ display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 9.5pt; font-weight: 600; margin-top: 4px; }}
    .nord-contact {{ font-size: 9pt; color: #64748b; margin-top: 6px; }}
    .nord-sec {{ font-size: 11pt; font-weight: 700; color: #0f172a; margin: 18px 0 10px 0; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  {top_bar}
  <div class="nord-header">
    <div class="nord-name">{name}</div>
    <div class="nord-tag">{headline}</div>
    <div class="nord-contact">{contact_html}</div>
  </div>
  <div class="nord-sec">About</div>
  <p style="margin: 0 0 14px 0; color: #334155;">{summary}</p>
  <div class="nord-sec">Technology Stack</div>
  <p style="margin: 0 0 14px 0; font-family: monospace; font-size: 9.5pt; color: #1e293b;">{', '.join(skills)}</p>
  <div class="nord-sec">Experience</div>
  {nordic_exp}
  <div class="nord-sec">Education</div>
  <p style="margin: 0; font-weight: 600;">{edu}</p>
</body>
</html>"""

    if fmt == "staff_architect":
        arch_exp = "".join(
            f"""<div style="margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 12px; background: #fafafa;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 10pt;">
                <span>{e.get("title", "Principal Architect")} · {e.get("company", "Company")}</span>
                <span style="font-family: monospace; font-size: 9pt;">{e.get("dates", "Present")}</span>
              </div>
              {f'<div style="font-size: 9pt; color: #b45309; font-weight: 600; margin: 3px 0;">[Scale Benchmark] {e.get("metrics")}</div>' if e.get("metrics") else ''}
              <div style="font-size: 9.5pt; color: #1f2937; margin-top: 3px;"><strong>Architecture Execution:</strong> {e.get("text", "")}</div>
            </div>""" for e in experience
        )
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.6in; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 10pt; line-height: 1.45; color: #111; max-width: 8.2in; margin: 0 auto; padding: 0.4in; }}
    .top-bar {{ display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #0f172a; color: #fff; margin-bottom: 16px; font-size: 11px; }}
    .btn-print {{ background: #38bdf8; color: #000; border: none; padding: 5px 12px; font-weight: 700; cursor: pointer; }}
    .arch-header {{ border-left: 4px solid #0f172a; padding-left: 14px; margin-bottom: 16px; }}
    .arch-title {{ font-size: 20pt; font-weight: 800; margin: 0; }}
    .arch-sub {{ font-size: 11pt; color: #374151; font-weight: 600; }}
    .arch-contact {{ font-size: 9pt; color: #6b7280; font-family: monospace; margin-top: 4px; }}
    .arch-sec {{ font-size: 9pt; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; background: #f3f4f6; padding: 3px 8px; margin: 14px 0 8px 0; border-left: 3px solid #111; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  {top_bar}
  <div class="arch-header">
    <div class="arch-title">{name}</div>
    <div class="arch-sub">Staff+ Systems Architect & Engineering Lead</div>
    <div class="arch-contact">{contact_html}</div>
  </div>
  <div class="arch-sec">[1.0] EXECUTIVE ARCHITECTURAL SUMMARY</div>
  <p style="margin: 0 0 8px 0;">{summary}</p>
  <div class="arch-sec">[2.0] SYSTEM ARCHITECTURAL COMPETENCIES</div>
  <p style="margin: 0 0 8px 0; font-family: monospace; font-size: 9pt;">{', '.join(skills)}</p>
  <div class="arch-sec">[3.0] PRODUCTION SYSTEMS & ARCHITECTURAL INITIATIVES</div>
  {arch_exp}
  <div class="arch-sec">[4.0] ACADEMIC CREDENTIALS</div>
  <p style="margin: 0;"><strong>{edu}</strong></p>
</body>
</html>"""

    if fmt == "compact_one_page":
        dense_exp = "".join(
            f"""<div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 9.5pt;">
                <span>{e.get("title", "Engineer")}, {e.get("company", "Org")}</span>
                <span style="font-family: monospace; font-size: 8.5pt;">{e.get("dates", "Recent")}</span>
              </div>
              {f'<div style="font-size: 8.5pt; font-weight: 600; color: #047857;">&bull; {e.get("metrics")}</div>' if e.get("metrics") else ''}
              <div style="font-size: 8.5pt; color: #111; line-height: 1.3;">&bull; {e.get("text", "")}</div>
            </div>""" for e in experience
        )
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{name} - {label}</title>
  <style>
    @page {{ size: letter; margin: 0.35in; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 9pt; line-height: 1.35; color: #000; max-width: 8.2in; margin: 0 auto; padding: 0.25in; }}
    .top-bar {{ display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f4f4f5; border: 1px solid #d4d4d8; margin-bottom: 12px; font-size: 10px; }}
    .btn-print {{ background: #000; color: #fff; border: none; padding: 4px 10px; font-weight: 600; cursor: pointer; }}
    .compact-header {{ text-align: center; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }}
    .compact-name {{ font-size: 16pt; font-weight: 800; letter-spacing: 0.5px; margin: 0; }}
    .compact-sub {{ font-size: 9.5pt; font-weight: 600; color: #222; }}
    .compact-contact {{ font-size: 8.5pt; color: #333; }}
    .compact-sec {{ font-size: 9pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #000; margin: 8px 0 4px 0; padding-bottom: 1px; }}
    @media print {{ .top-bar {{ display: none !important; }} body {{ padding: 0; }} }}
  </style>
</head>
<body>
  {top_bar}
  <div class="compact-header">
    <div class="compact-name">{name.upper()}</div>
    <div class="compact-sub">{headline}</div>
    <div class="compact-contact">{contact_html}</div>
  </div>
  <div class="compact-sec">Professional Profile</div>
  <p style="margin: 0 0 6px 0; font-size: 8.5pt;">{summary}</p>
  <div class="compact-sec">Technical Skills</div>
  <p style="margin: 0 0 6px 0; font-size: 8.5pt;"><strong>Languages & Platforms:</strong> {', '.join(skills)}</p>
  <div class="compact-sec">Work Experience</div>
  {dense_exp}
  <div class="compact-sec">Education</div>
  <p style="margin: 0; font-size: 8.5pt;"><strong>{edu}</strong></p>
</body>
</html>"""

    return None
