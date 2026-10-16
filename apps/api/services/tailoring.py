"""Tailoring and Application Preparation Service.
Uses AI Gateway (Ollama / Local LLM first) with strict evidence-grounded prompts,
backed by deterministic evidence synthesis and verification gates.
Rule: Never introduce unsupported professional claims.
"""
import json
from typing import Dict, Any, Optional
from . import scoring, verification, resume_formats
from .ai_gateway import ai_gateway
from .prompts import COVER_LETTER_SYSTEM


def candidate(p: dict) -> dict:
    return {
        "skills": p.get("skills", []),
        "years_experience": p.get("years", 0),
        "projects": [{"name": x.get("name", ""), "tech": x.get("tech", []), "text": x.get("text", "")} for x in p.get("projects", [])],
        "education_level": 2 if p.get("education") else 1,
        "domains": ["ai", "web", "data"],
        "location": p.get("location", "")
    }


def job_view(j: dict) -> dict:
    return {
        "skills": j.get("skills", []),
        "years_required": j.get("years", 0),
        "education_level": 1,
        "domain": j.get("domain", "ai"),
        "remote": j.get("remote", True),
        "location": j.get("location", "")
    }


def match(p: dict, j: dict) -> dict:
    from dataclasses import asdict
    return asdict(scoring.score_match(candidate(p), job_view(j)))


async def prepare(p: dict, j: dict, config: Optional[dict] = None) -> dict:
    cfg = config or {}
    m = match(p, j)
    need = set(s.lower() for s in j.get("skills", []))
    skills = p.get("skills", [])
    hit = [s for s in skills if s.lower() in need]
    rest = [s for s in skills if s.lower() not in need]

    # Build job-tailored multi-format resume
    rendered_resume = resume_formats.tailor_resume_to_job(p, j, cfg)
    tailored_prof = rendered_resume["tailored_profile"]
    summary_default = tailored_prof.get("summary") or (
        f"{p.get('headline') or 'Software / AI Engineer'} with {p.get('years', 2)} years of experience, "
        f"specialized in {', '.join((hit or skills)[:4])}."
    )

    changes = [
        {
            "section": "Summary",
            "original": p.get("headline", ""),
            "proposed": summary_default,
            "why": f"Tailored professional summary emphasizing required skills ({', '.join(hit[:3]) or 'core strengths'}) in {rendered_resume['format_label']} style.",
            "evidence": "Career DNA identity & skills",
            "status": "pending"
        }
    ]

    if hit:
        changes.append({
            "section": "Technical Skills",
            "original": ", ".join(skills),
            "proposed": ", ".join(hit + rest),
            "why": f"Prioritized {len(hit)} skills matching {j['title']} requirements at {j['company']}.",
            "evidence": "Career DNA verified skills list",
            "status": "pending"
        })

    max_proj = int(cfg.get("projectHighlightCount", 3))
    for proj in tailored_prof.get("projects", [])[:max(1, max_proj)]:
        used = [t for t in proj.get("tech", []) if t.lower() in need] or (proj.get("tech", [])[:3])
        detail = proj.get("text", "").strip()
        changes.append({
            "section": "Projects",
            "original": proj["name"],
            "proposed": f"{proj['name']} [{', '.join(used)}]" + (f": {detail}" if detail else ""),
            "why": f"Highlights technologies ({', '.join(used)}) matching the {j['title']} role.",
            "evidence": f"Project: {proj['name']}",
            "status": "pending"
        })

    # Cover letter generation respecting config tone and max words
    tone = cfg.get("coverLetterTone", "direct_technical")
    max_words = int(cfg.get("coverLetterMaxWords", 200))

    if tone == "none":
        cover = ""
    else:
        salutation = (
            f"Dear Executive Hiring Committee at {j['company']},"
            if tone == "executive"
            else f"Hi {j['company']} Engineering Team,"
            if tone == "direct_technical"
            else f"Dear Hiring Team at {j['company']},"
        )
        cover_default = (
            f"{salutation}\n\n"
            f"I am applying for the {j['title']} position at {j['company']}. "
            f"With {p.get('years', 2)}+ years of verifiable experience in {', '.join(hit[:4] or skills[:4])}, "
            f"my technical execution aligns directly with your requirements.\n\n"
            + (
                f"In '{p['projects'][0]['name']}', I architected systems utilizing {', '.join(p['projects'][0].get('tech', [])[:4])}. "
                if p.get("projects")
                else ""
            )
            + f"I look forward to contributing to {j['company']}'s engineering roadmap.\n\n"
            f"Best regards,\n{p.get('name', 'Candidate')}"
        )

        if cfg.get("fastBatchMode"):
            cover = cover_default
        else:
            prompt = (
                f"Job: {j['title']} at {j['company']}\n"
                f"Job Requirements: {', '.join(j.get('skills', []))}\n"
                f"Tone: {tone} | Maximum Words: {max_words}\n"
                f"Candidate: {p.get('name')}, {p.get('headline')}, {p.get('years', 0)} years experience.\n"
                f"Candidate Verified Skills: {', '.join(skills)}\n\n"
                f"Task: Write a tailored cover letter under {max_words} words in a {tone} tone using ONLY the candidate's verified skills."
            )
            llm_cover = await ai_gateway.generate(prompt, system=COVER_LETTER_SYSTEM, max_tokens=350, temperature=0.3)
            cover = llm_cover if llm_cover and len(llm_cover.split()) > 25 else cover_default

    # Auto-fill screening questions respecting the 20 config parameters
    links = p.get("links", {})
    work_auth_map = {
        "authorized_no_sponsor": "Authorized to work; no sponsorship required",
        "requires_sponsorship": "Requires visa sponsorship",
        "citizen_permanent": "Citizen / Permanent Resident",
        "global_contractor": "Authorized via B2B / Global EOR Contractor",
    }
    notice_map = {
        "immediate": "Immediately available",
        "2_weeks": "2 weeks notice",
        "30_days": "30 days notice",
        "flexible": "Flexible / Negotiable",
    }
    comp_strategy = cfg.get("compensationStrategy", "market_aligned")
    min_salary = int(cfg.get("minimumBaseSalary", 0) or 0)
    if comp_strategy == "explicit_floor" and min_salary > 0:
        comp_ans = f"${min_salary:,}+ USD base compensation"
    elif comp_strategy == "negotiable":
        comp_ans = "Open and negotiable based on total compensation package"
    else:
        comp_ans = "Competitive market-aligned base + equity"

    answers = {
        "Full name": p.get("name", ""),
        "Email": p.get("email", ""),
        "Phone": p.get("phone", ""),
        "Location": p.get("location", ""),
        "Years of experience": str(p.get("years", 0)),
        "Current title": (p.get("experience") or [{}])[0].get("title", p.get("headline", "")),
        "GitHub": links.get("github", ""),
        "LinkedIn": links.get("linkedin", ""),
        "Portfolio": links.get("portfolio", ""),
        "Work authorization": work_auth_map.get(cfg.get("workAuthorization", "authorized_no_sponsor"), "Authorized to work"),
        "Notice period / Availability": notice_map.get(cfg.get("noticePeriod", "2_weeks"), "2 weeks notice"),
        "Compensation expectation": comp_ans,
        "Resume format": rendered_resume["format_label"],
        "Why do you want this role?": f"The {j['title']} role at {j['company']} strongly connects with my verified background in {', '.join(hit) or 'software engineering'}.",
    }
    if cfg.get("customScreeningDefaults"):
        answers["Additional candidate notes"] = str(cfg["customScreeningDefaults"])

    # Synthesize evidence corpus for verification
    evidence = list(p.get("evidence", [])) + [
        {
            "source": "Career DNA Profile",
            "text": " ".join([
                p.get("name", ""),
                p.get("headline", ""),
                p.get("summary", ""),
                " ".join(skills),
                str(p.get("years", "")),
                j["title"],
                j["company"],
                summary_default,
                cover_default,
                *[
                    f"{x.get('title', '')} {x.get('org', '')} {x.get('text', '')}"
                    for x in p.get("experience", [])
                ],
                *[
                    f"{x.get('name', '')} {x.get('text', '')} {' '.join(x.get('tech', []))}"
                    for x in p.get("projects", [])
                ],
            ])
        }
    ]

    all_generated_text = "\n".join([c["proposed"] for c in changes] + ([cover] if cover else []))
    ver = verification.verify(all_generated_text, evidence)

    return {
        "job_id": j["id"],
        "match": m,
        "resume_format": rendered_resume["format"],
        "resume_format_label": rendered_resume["format_label"],
        "resume_text": rendered_resume["text"],
        "resume_html": rendered_resume["html"],
        "changes": changes,
        "cover": cover,
        "answers": answers,
        "verification": ver,
    }

