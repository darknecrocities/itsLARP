"""Live Profile Crawler & LLM Career DNA Constructor.
Searches and extracts candidate information from GitHub profiles/repositories,
Portfolio websites, LinkedIn inputs, and uploaded resumes, then constructs
or refines an accurate, evidence-grounded Career DNA profile with LLM assistance.
"""
import asyncio
import html
import json
import re
from typing import Dict, Any, List, Optional
import httpx
from . import resume_parser
from . import linkedin_crawler
from .ai_gateway import ai_gateway

HTTP_TIMEOUT = httpx.Timeout(4.5, connect=2.0)
USER_AGENT = "Mozilla/5.0 (compatible; HowToLarpedCareerDNA/2.0)"


def _extract_github_username(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        return ""
    s = re.sub(r"^https?://(?:www\.)?github\.com/", "", s, flags=re.I)
    s = s.lstrip("@").split("/")[0].split("?")[0].strip()
    return s if re.match(r"^[a-zA-Z0-9-]{1,39}$", s) else ""


async def crawl_github_user(github_input: str) -> Dict[str, Any]:
    """Crawls public GitHub user profile and top repositories for real engineering evidence."""
    username = _extract_github_username(github_input)
    if not username:
        return {"ok": False, "source": "github", "error": "No valid GitHub username provided."}

    headers = {"Accept": "application/vnd.github+json", "User-Agent": USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers=headers, follow_redirects=True) as c:
            u_resp, r_resp = await asyncio.gather(
                c.get(f"https://api.github.com/users/{username}"),
                c.get(f"https://api.github.com/users/{username}/repos", params={"sort": "updated", "per_page": 15}),
                return_exceptions=True
            )

        user_data = u_resp.json() if isinstance(u_resp, httpx.Response) and u_resp.status_code == 200 else {}
        repos_data = r_resp.json() if isinstance(r_resp, httpx.Response) and r_resp.status_code == 200 and isinstance(r_resp.json(), list) else []

        projects: List[Dict[str, Any]] = []
        skills_set: List[str] = []
        evidence: List[Dict[str, str]] = []

        if user_data.get("bio"):
            evidence.append({
                "source": f"GitHub Profile (@{username})",
                "text": f"Bio: {user_data.get('bio')} | Public Repos: {user_data.get('public_repos', 0)} | Followers: {user_data.get('followers', 0)}"
            })

        for repo in repos_data:
            if repo.get("fork"):
                continue
            r_name = repo.get("name", "")
            r_desc = repo.get("description") or f"Open-source repository {r_name} maintained by @{username}."
            lang = repo.get("language")
            topics = repo.get("topics") or []
            stars = repo.get("stargazers_count", 0)
            tech = []
            if lang:
                tech.append(lang)
                if lang.lower() not in [x.lower() for x in skills_set]:
                    skills_set.append(lang.lower())
            for t in topics[:5]:
                tech.append(t)
                if t.lower() in resume_parser.KNOWN_SKILLS and t.lower() not in [x.lower() for x in skills_set]:
                    skills_set.append(t.lower())

            # Detect skills inside description
            for ks in resume_parser.KNOWN_SKILLS:
                if re.search(r"(?<![a-z0-9])" + re.escape(ks) + r"(?![a-z0-9])", f"{r_name} {r_desc}".lower()):
                    if ks not in skills_set:
                        skills_set.append(ks)
                    if ks not in [x.lower() for x in tech]:
                        tech.append(ks)

            star_note = f" ({stars} stars)" if stars > 0 else ""
            projects.append({
                "name": r_name,
                "tech": tech[:6] or ["Software Engineering"],
                "text": f"{r_desc}{star_note}",
                "url": repo.get("html_url", f"https://github.com/{username}/{r_name}")
            })
            evidence.append({
                "source": f"GitHub Repo: {username}/{r_name}",
                "text": f"{r_name} ({', '.join(tech[:4]) or 'Code'}): {r_desc}{star_note}"
            })

        total_stars = sum(r.get("stargazers_count", 0) for r in repos_data)
        top_langs = list(dict.fromkeys([r.get("language") for r in repos_data if r.get("language")]))[:5]
        pub_repos = user_data.get("public_repos", len(repos_data))
        contrib_note = f"{pub_repos} public repositories · {total_stars} stars"
        gh_metrics = {
            "username": username,
            "public_repos": pub_repos,
            "followers": user_data.get("followers", 0),
            "total_stars": total_stars,
            "contributions_note": contrib_note,
            "top_languages": top_langs,
        }
        evidence.append({
            "source": f"GitHub Impact Metrics (@{username})",
            "text": f"Repositories: {pub_repos} | Total Stars: {total_stars} | {contrib_note} | Languages: {', '.join(top_langs)}"
        })

        return {
            "ok": True,
            "source": "github",
            "username": username,
            "name": user_data.get("name") or "",
            "headline": user_data.get("bio") or "",
            "location": user_data.get("location") or "",
            "email": user_data.get("email") or "",
            "blog": user_data.get("blog") or "",
            "company": user_data.get("company") or "",
            "github_url": f"https://github.com/{username}",
            "skills": skills_set,
            "projects": projects[:8],
            "github_metrics": gh_metrics,
            "evidence": evidence[:18],
        }
    except Exception as e:
        return {"ok": False, "source": "github", "username": username, "error": str(e)}


async def crawl_portfolio_site(url: str) -> Dict[str, Any]:
    """Fetches and parses a candidate's live portfolio website or personal link."""
    clean_url = (url or "").strip()
    if not clean_url:
        return {"ok": False, "source": "portfolio", "error": "Empty portfolio URL."}
    if not clean_url.startswith(("http://", "https://")):
        clean_url = f"https://{clean_url}"

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT, headers={"User-Agent": USER_AGENT}, follow_redirects=True) as c:
            resp = await c.get(clean_url)
            resp.raise_for_status()
            raw_html = resp.text[:150000]

        title_m = re.search(r"<title[^>]*>(.*?)</title>", raw_html, flags=re.S | re.I)
        page_title = html.unescape(title_m.group(1)).strip() if title_m else ""

        meta_desc = ""
        for pat in [
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
            r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']',
            r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']',
        ]:
            m = re.search(pat, raw_html, flags=re.S | re.I)
            if m:
                meta_desc = html.unescape(m.group(1)).strip()
                break

        headings = [
            html.unescape(re.sub(r"<[^>]+>", " ", h)).strip()
            for h in re.findall(r"<h[1-3][^>]*>(.*?)</h[1-3]>", raw_html, flags=re.S | re.I)
        ]
        headings = [re.sub(r"\s+", " ", h) for h in headings if 2 < len(h) < 120][:15]

        # Strip scripts/styles and extract clean body text
        body = re.sub(r"<(script|style|noscript|svg).*?</\1>", " ", raw_html, flags=re.S | re.I)
        body_text = html.unescape(re.sub(r"<[^>]+>", " ", body))
        body_text = re.sub(r"\s+", " ", body_text).strip()[:6000]

        parsed = resume_parser.parse_resume_content(f"{page_title}\n{meta_desc}\n" + "\n".join(headings) + f"\n{body_text}", f"Portfolio ({clean_url})")
        evidence = [
            {"source": f"Portfolio ({clean_url})", "text": f"Title: {page_title}. {meta_desc}".strip()}
        ]
        for h in headings[:6]:
            evidence.append({"source": f"Portfolio Heading ({clean_url})", "text": h})

        return {
            "ok": True,
            "source": "portfolio",
            "url": clean_url,
            "title": page_title,
            "description": meta_desc,
            "headings": headings,
            "skills": parsed.get("skills", []),
            "projects": parsed.get("projects", []),
            "evidence": evidence + parsed.get("evidence", [])[:8],
            "raw_text": body_text[:3000],
        }
    except Exception as e:
        return {"ok": False, "source": "portfolio", "url": clean_url, "error": str(e)}


def parse_linkedin_input(linkedin_url: str, linkedin_text: str) -> Dict[str, Any]:
    """Extracts structured career attributes from LinkedIn URL and/or pasted profile content."""
    handle = linkedin_crawler.extract_linkedin_handle(linkedin_url)
    clean_url = f"https://www.linkedin.com/in/{handle}/" if handle else (linkedin_url or "").strip()
    parsed_content = linkedin_crawler.parse_linkedin_text_content(linkedin_text) if linkedin_text.strip() else {}

    evidence = []
    if handle:
        evidence.append({"source": "LinkedIn Profile", "text": f"Verified profile link: {clean_url}"})
    if parsed_content.get("experience"):
        evidence.append({"source": "LinkedIn Experience", "text": f"Extracted {len(parsed_content['experience'])} experience roles."})
    if parsed_content.get("certifications"):
        evidence.append({"source": "LinkedIn Certifications", "text": f"Extracted {len(parsed_content['certifications'])} certifications."})

    return {
        "ok": bool(handle or linkedin_text.strip()),
        "handle": handle,
        "linkedin_url": clean_url,
        "name": parsed_content.get("name", ""),
        "headline": parsed_content.get("headline", ""),
        "location": parsed_content.get("location", ""),
        "summary": parsed_content.get("summary", ""),
        "skills": parsed_content.get("skills", []),
        "experience": parsed_content.get("experience", []),
        "education": parsed_content.get("education", ""),
        "certifications": parsed_content.get("certifications", []),
        "licenses": parsed_content.get("licenses", []),
        "evidence": evidence,
    }


async def construct_dna_with_llm(
    current_profile: Optional[Dict[str, Any]] = None,
    github_url: str = "",
    linkedin_url: str = "",
    linkedin_text: str = "",
    portfolio_url: str = "",
    resume_text: str = "",
    instructions: str = "",
    custom_instructions: str = "",
) -> Dict[str, Any]:
    """Crawls provided links in parallel and constructs an accurate, editable Career DNA profile."""
    current_profile = current_profile or {}
    final_instructions = custom_instructions or instructions
    gh_task = crawl_github_user(github_url or current_profile.get("links", {}).get("github", ""))
    pf_task = crawl_portfolio_site(portfolio_url or current_profile.get("links", {}).get("portfolio", ""))
    li_task = linkedin_crawler.crawl_linkedin_profile(linkedin_url or current_profile.get("links", {}).get("linkedin", ""), linkedin_text)
    gh_res, pf_res, li_res = await asyncio.gather(gh_task, pf_task, li_task)

    corpus_parts = []
    if final_instructions:
        corpus_parts.append(f"USER INSTRUCTIONS / GOAL:\n{final_instructions}")
    if resume_text:
        corpus_parts.append(f"RESUME TEXT:\n{resume_text[:4000]}")
    if gh_res.get("ok"):
        corpus_parts.append(
            f"GITHUB PROFILE (@{gh_res.get('username')}):\n"
            f"Name: {gh_res.get('name')} | Bio: {gh_res.get('headline')} | Location: {gh_res.get('location')}\n"
            f"Skills: {', '.join(gh_res.get('skills', []))}\n"
            f"Repositories: {json.dumps(gh_res.get('projects', [])[:6])}"
        )
    if pf_res.get("ok"):
        corpus_parts.append(
            f"PORTFOLIO WEBSITE ({pf_res.get('url')}):\n"
            f"Title: {pf_res.get('title')}\nDescription: {pf_res.get('description')}\n"
            f"Headings: {', '.join(pf_res.get('headings', [])[:8])}\n"
            f"Excerpt: {pf_res.get('raw_text', '')[:1500]}"
        )
    if li_res.get("ok"):
        corpus_parts.append(f"LINKEDIN DATA ({li_res.get('linkedin_url')}):\n{linkedin_text[:2500]}")
    if current_profile.get("name") or current_profile.get("skills"):
        corpus_parts.append(f"EXISTING PROFILE STATE:\n{json.dumps({k: v for k, v in current_profile.items() if k != 'evidence'})[:2000]}")

    full_corpus = "\n\n".join(corpus_parts)
    # Personal info & deterministic parsing strictly comes from Resume or LinkedIn (never Portfolio or GitHub)
    resume_candidate_text = (resume_text or "").strip() or (linkedin_text or "").strip()
    det_parsed = resume_parser.parse_resume_content(
        resume_candidate_text,
        "Uploaded Resume" if resume_text.strip() else "LinkedIn Profile"
    ) if resume_candidate_text else {}

    merged_skills = list(dict.fromkeys(
        (current_profile.get("skills") or [])
        + (gh_res.get("skills") or [])
        + (pf_res.get("skills") or [])
        + (li_res.get("skills") or [])
        + (det_parsed.get("skills") or [])
    ))
    merged_projects = (gh_res.get("projects") or []) + (current_profile.get("projects") or []) + (det_parsed.get("projects") or [])
    seen_p = set()
    unique_projects = []
    for pr in merged_projects:
        pname = (pr.get("name") or "").strip()
        if pname and pname.lower() not in seen_p:
            seen_p.add(pname.lower())
            unique_projects.append(pr)

    merged_exp = (current_profile.get("experience") or []) + (li_res.get("experience") or []) + (det_parsed.get("experience") or [])
    merged_certs = list(current_profile.get("certifications") or []) + (li_res.get("certifications") or [])
    merged_lics = list(current_profile.get("licenses") or []) + (li_res.get("licenses") or [])
    gh_metrics = gh_res.get("github_metrics") or current_profile.get("github_metrics") or {}

    merged_ev = (
        (gh_res.get("evidence") or [])
        + (pf_res.get("evidence") or [])
        + (li_res.get("evidence") or [])
        + (current_profile.get("evidence") or [])
        + (det_parsed.get("evidence") or [])
    )
    if final_instructions.strip():
        merged_ev.insert(0, {"source": "Candidate Direct Specification", "text": final_instructions.strip()[:400]})

    links = {
        **(current_profile.get("links") or {}),
        **(det_parsed.get("links") or {}),
    }
    if gh_res.get("github_url"):
        links["github"] = gh_res["github_url"]
    elif github_url:
        links["github"] = github_url
    if li_res.get("linkedin_url"):
        links["linkedin"] = li_res["linkedin_url"]
    elif linkedin_url:
        links["linkedin"] = linkedin_url
    if pf_res.get("url"):
        links["portfolio"] = pf_res["url"]
    elif gh_res.get("blog"):
        links["portfolio"] = gh_res["blog"]
    elif portfolio_url:
        links["portfolio"] = portfolio_url

    # Source Priority: User edits -> Resume -> LinkedIn ONLY.
    # Never extract personal identity, contacts, or executive summary from GitHub or Portfolio.
    cand_name = (current_profile.get("name") or det_parsed.get("name") or li_res.get("name") or "").strip()
    cand_headline = (current_profile.get("headline") or det_parsed.get("headline") or li_res.get("headline") or "").strip()
    cand_email = (current_profile.get("email") or det_parsed.get("email") or "").strip()
    cand_phone = (current_profile.get("phone") or det_parsed.get("phone") or "").strip()
    cand_location = (current_profile.get("location") or det_parsed.get("location") or li_res.get("location") or "Remote").strip()
    cand_edu = (current_profile.get("education") or det_parsed.get("education") or li_res.get("education") or "").strip()
    cand_summary = (current_profile.get("summary") or det_parsed.get("summary") or li_res.get("summary") or "").strip()

    if not cand_summary:
        sk_preview = ", ".join(merged_skills[:6]) if merged_skills else "software engineering"
        yrs = current_profile.get("years") or det_parsed.get("years") or 2
        cand_summary = f"{cand_headline or 'Software Engineer'} with {yrs}+ years of experience building software systems utilizing {sk_preview}."

    base_profile = {
        "name": cand_name,
        "headline": cand_headline,
        "email": cand_email,
        "phone": cand_phone,
        "location": cand_location,
        "years": current_profile.get("years") or det_parsed.get("years") or 2,
        "education": cand_edu,
        "summary": cand_summary,
        "target_roles": current_profile.get("target_roles") or ["Software Engineer", "Full Stack Engineer"],
        "target_companies": current_profile.get("target_companies") or ["all"],
        "work_types": current_profile.get("work_types") or ["fulltime", "remote"],
        "skills": merged_skills or ["python", "typescript", "react", "docker"],
        "experience": merged_exp[:8],
        "projects": unique_projects[:8],
        "certifications": merged_certs[:8],
        "licenses": merged_lics[:6],
        "github_metrics": gh_metrics,
        "links": links,
        "evidence": merged_ev[:30],
    }

    system_prompt = (
        "You are an elite Career DNA Architect. "
        "MANDATORY RULE: Candidate personal info (name, headline, email, phone, location, education) "
        "and executive summary MUST strictly come from the RESUME or LINKEDIN sources ONLY. "
        "NEVER use GitHub bio/handles or Portfolio meta tags for personal info or executive summary. "
        "GitHub and Portfolio sources must ONLY be used for extracting repositories, projects, code metrics, and technical skills. "
        "Never invent unverified employers. Return ONLY valid JSON."
    )
    user_prompt = f"""Construct the candidate's accurate Career DNA JSON from these sources:
{full_corpus[:4500]}

Return ONLY a JSON object with keys:
"name", "headline", "email", "phone", "location", "years", "education", "summary",
"target_roles" (array of strings), "skills" (array of strings),
"experience" (array of {{"company", "title", "dates", "text", "metrics"}}),
"projects" (array of {{"name", "tech", "text", "url"}})
"""
    extracted_by = "Deterministic Multi-Source Crawler"
    engine = "deterministic_fallback"
    try:
        raw_llm = await ai_gateway.generate(user_prompt, system=system_prompt, max_tokens=1400, temperature=0.2)
        if raw_llm:
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_llm.strip(), flags=re.I)
            llm_data = json.loads(cleaned)
            if isinstance(llm_data, dict):
                gh_u = (gh_res.get("username") or "").lower()
                gh_bio = (gh_res.get("headline") or "").strip().lower()
                pf_d = (pf_res.get("description") or "").strip().lower()

                if llm_data.get("name") and isinstance(llm_data["name"], str) and not cand_name:
                    if llm_data["name"].strip().lower() != gh_u:
                        cand_name = llm_data["name"].strip()
                if llm_data.get("headline") and isinstance(llm_data["headline"], str) and not cand_headline:
                    hl = llm_data["headline"].strip()
                    if hl.lower() not in [gh_bio, pf_d]:
                        cand_headline = hl
                if llm_data.get("email") and isinstance(llm_data["email"], str) and not cand_email:
                    if "@" in llm_data["email"] and not llm_data["email"].endswith("users.noreply.github.com"):
                        cand_email = llm_data["email"].strip()
                if llm_data.get("location") and isinstance(llm_data["location"], str) and cand_location == "Remote":
                    cand_location = llm_data["location"].strip()
                if llm_data.get("education") and isinstance(llm_data["education"], str) and not cand_edu:
                    cand_edu = llm_data["education"].strip()
                if llm_data.get("summary") and isinstance(llm_data["summary"], str):
                    sm = llm_data["summary"].strip()
                    if sm.lower() not in [gh_bio, pf_d] and (not cand_summary or len(cand_summary) < 20):
                        cand_summary = sm

                if isinstance(llm_data.get("years"), (int, float)):
                    base_profile["years"] = int(llm_data["years"])
                if isinstance(llm_data.get("skills"), list) and llm_data["skills"]:
                    base_profile["skills"] = list(dict.fromkeys([str(s).strip() for s in llm_data["skills"] if s] + merged_skills))
                if isinstance(llm_data.get("target_roles"), list) and llm_data["target_roles"]:
                    base_profile["target_roles"] = [str(r).strip() for r in llm_data["target_roles"] if r]
                if isinstance(llm_data.get("experience"), list) and llm_data["experience"]:
                    base_profile["experience"] = llm_data["experience"][:8]
                if isinstance(llm_data.get("projects"), list) and llm_data["projects"]:
                    base_profile["projects"] = llm_data["projects"][:8]
                extracted_by = f"Live Crawler + LLM ({ai_gateway.model})"
                engine = "llm"
    except Exception:
        pass

    base_profile.update({
        "name": cand_name,
        "headline": cand_headline,
        "email": cand_email,
        "phone": cand_phone,
        "location": cand_location,
        "education": cand_edu,
        "summary": cand_summary,
    })

    return {
        "ok": True,
        "engine": engine,
        "extracted_by": extracted_by,
        "crawl_summary": {
            "github_found": bool(gh_res.get("ok", False)),
            "portfolio_found": bool(pf_res.get("ok", False)),
            "linkedin_found": bool(li_res.get("ok", False)),
        },
        "crawled_sources": {
            "github": {"ok": gh_res.get("ok", False), "username": gh_res.get("username", ""), "repos_found": len(gh_res.get("projects", []))},
            "portfolio": {"ok": pf_res.get("ok", False), "url": pf_res.get("url", ""), "title": pf_res.get("title", "")},
            "linkedin": {"ok": li_res.get("ok", False), "url": li_res.get("linkedin_url", "")},
        },
        "profile": base_profile,
    }


async def refine_section_with_llm(
    section: str,
    current_value: str,
    instruction: str = "Improve clarity and technical impact.",
    profile_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Refines a specific Career DNA section (Summary, Headline, Experience) using LLM or deterministic synthesis."""
    ctx = profile_context or {}
    skills_str = ", ".join((ctx.get("skills") or [])[:8]) or "software architecture and distributed systems"
    years = ctx.get("years") or 3
    headline = ctx.get("headline") or "Software & Systems Engineer"

    prompt = (
        f"Section: {section}\n"
        f"Current Text: {current_value}\n"
        f"Instruction: {instruction}\n"
        f"Candidate Context: {headline}, {years} years experience, skills: {skills_str}\n\n"
        f"Write ONLY the refined text for {section} (2-3 concise sentences, factual, zero markdown wrappers)."
    )
    try:
        res = await ai_gateway.generate(prompt, max_tokens=250, temperature=0.25)
        if res and len(res.strip()) > 15:
            return {"ok": True, "section": section, "refined_text": res.strip(), "engine": "llm"}
    except Exception:
        pass

    fallback = (
        f"{headline} with {years}+ years of hands-on engineering experience across {skills_str}. "
        f"Grounded in {instruction.strip().rstrip('.')}. "
        f"{current_value.strip() if current_value.strip() else 'Focused on delivering high-reliability production architectures.'}"
    ).strip()
    return {"ok": True, "section": section, "refined_text": fallback, "engine": "deterministic"}

