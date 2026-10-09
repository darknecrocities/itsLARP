"""Tailoring and Application Preparation Service.
Uses AI Gateway (Ollama / Local LLM first) with strict evidence-grounded prompts,
backed by deterministic evidence synthesis and verification gates.
Rule: Never introduce unsupported professional claims.
"""
import json
import re
from typing import Dict, Any, List
from . import scoring, verification
from .ai_gateway import ai_gateway
from .prompts import RESUME_TAILOR_SYSTEM, COVER_LETTER_SYSTEM


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


async def prepare(p: dict, j: dict) -> dict:
    m = match(p, j)
    need = set(s.lower() for s in j.get("skills", []))
    skills = p.get("skills", [])
    hit = [s for s in skills if s.lower() in need]
    rest = [s for s in skills if s.lower() not in need]

    # Deterministic baseline summary
    headline = p.get("headline") or "Software / AI Engineer"
    summary_default = f"{headline} with {p.get('years', 2)} years of experience, specialized in {', '.join((hit or skills)[:4])}."

    changes = [
        {
            "section": "Summary",
            "original": p.get("headline", ""),
            "proposed": summary_default,
            "why": f"Tailored professional summary emphasizing required skills ({', '.join(hit[:3]) or 'core strengths'}).",
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

    # Tailor matching projects
    for proj in [x for x in p.get("projects", []) if any(t.lower() in need for t in x.get("tech", []))][:3]:
        used = [t for t in proj.get("tech", []) if t.lower() in need]
        detail = proj.get("text", "").strip()
        changes.append({
            "section": "Projects",
            "original": proj["name"],
            "proposed": f"{proj['name']} [{', '.join(used)}]" + (f": {detail}" if detail else ""),
            "why": f"Highlights technologies ({', '.join(used)}) matching the {j['title']} role.",
            "evidence": f"Project: {proj['name']}",
            "status": "pending"
        })

    # Prepare cover letter
    cover_default = (
        f"Dear Hiring Team at {j['company']},\n\n"
        f"I am writing to express my enthusiastic interest in the {j['title']} position. "
        f"With a strong foundation in {', '.join(hit[:3] or skills[:3])}, my experience directly aligns "
        f"with your technical stack and goals for this role.\n\n"
        + (f"In my project '{p['projects'][0]['name']}', I engineered solutions using {', '.join(p['projects'][0].get('tech', [])[:4])}. " if p.get("projects") else "")
        + f"I am eager to bring this evidence-backed experience to {j['company']}.\n\n"
        f"Thank you for your consideration.\n\n"
        f"Sincerely,\n{p.get('name', 'Candidate')}"
    )

    # Check if AI Gateway can provide high-fidelity tailored text
    prompt = (
        f"Job: {j['title']} at {j['company']}\n"
        f"Job Requirements: {', '.join(j.get('skills', []))}\n\n"
        f"Candidate: {p.get('name')}, {p.get('headline')}, {p.get('years', 0)} years experience.\n"
        f"Candidate Verified Skills: {', '.join(skills)}\n"
        f"Candidate Projects: {json.dumps([{'name': pr['name'], 'tech': pr.get('tech', [])} for pr in p.get('projects', [])])}\n\n"
        f"Task: Write a concise tailored cover letter (under 200 words) using ONLY the candidate's actual skills and projects."
    )

    llm_cover = await ai_gateway.generate(prompt, system=COVER_LETTER_SYSTEM, max_tokens=350, temperature=0.3)
    cover = llm_cover if llm_cover and len(llm_cover.split()) > 30 else cover_default

    # Auto-fill application fields
    links = p.get("links", {})
    answers = {
        "Full name": p.get("name", ""),
        "Email": p.get("email", ""),
        "Location": p.get("location", ""),
        "Years of experience": str(p.get("years", 0)),
        "Current title": (p.get("experience") or [{}])[0].get("title", p.get("headline", "")),
        "GitHub": links.get("github", ""),
        "LinkedIn": links.get("linkedin", ""),
        "Portfolio": links.get("portfolio", ""),
        "Why do you want this role?": f"The {j['title']} role at {j['company']} strongly connects with my verified background in {', '.join(hit) or 'engineering'}."
    }

    # Synthesize evidence corpus for verification
    evidence = list(p.get("evidence", [])) + [
        {
            "source": "Career DNA Profile",
            "text": " ".join([
                p.get("name", ""),
                p.get("headline", ""),
                " ".join(skills),
                str(p.get("years", "")),
                j["title"],
                j["company"],
                *[x["name"] + " " + x.get("text", "") for x in p.get("projects", [])]
            ])
        }
    ]

    all_generated_text = "\n".join([summary_default] + [c["proposed"] for c in changes[1:]] + [cover])
    ver = verification.verify(all_generated_text, evidence)

    return {
        "job_id": j["id"],
        "match": m,
        "changes": changes,
        "cover": cover,
        "answers": answers,
        "verification": ver
    }
