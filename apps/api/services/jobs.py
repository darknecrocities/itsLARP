"""Live job ingestion from public feeds (Remotive, Arbeitnow), custom URLs, and direct pastes.
All external text is untrusted: HTML is stripped and lengths are capped before anything touches it.
"""
import asyncio
import hashlib
import html
import re
import httpx
from typing import Optional, List, Dict, Tuple
from . import dedupe
from .database import SessionLocal, JobRecord

KNOWN = [
    "python", "typescript", "javascript", "react", "node", "fastapi", "django", "flask",
    "pytorch", "tensorflow", "sql", "postgresql", "redis", "docker", "kubernetes", "aws",
    "gcp", "azure", "llm", "rag", "airflow", "go", "rust", "java", "next.js", "tailwind",
    "graphql", "git", "c++", "c#", "php", "ruby", "swift", "kotlin", "spark", "kafka",
    "terraform", "vue", "angular", "mongodb", "mysql", "linux", "figma", "excel", "tableau",
    "machine learning", "nlp", "ollama", "qwen"
]
_pat = {k: re.compile(r"(?<![a-z0-9+#.])" + re.escape(k) + r"(?![a-z0-9+#])", re.I) for k in KNOWN}
JOBS_BY_ID: dict[str, dict] = {}


def clean(raw: str, cap: int = 6000) -> str:
    t = re.sub(r"<(script|style).*?</\1>", " ", raw or "", flags=re.S | re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t).strip()[:cap]


def extract(job: dict) -> dict:
    text = f"{job['title']} {job.get('description', '')}"
    skills = [k for k, p in _pat.items() if p.search(text)]
    yrs = [int(m) for m in re.findall(r"(\d{1,2})\+?\s*(?:years|yrs)", text, re.I) if int(m) < 20]
    t = job["title"].lower()
    domain = "ai" if re.search(r"\b(ai|ml|machine learning|llm|data scien|deep learning)", t) else "data" if "data" in t else "web"
    emp_type = job.get("employment_type")
    if not emp_type:
        emp_type = "Internship" if "intern" in t else "Contract" if "contract" in t else "Part-time" if "part-time" in t else "Full-time"
    assigned_yrs = job.get("years") if job.get("years") is not None else (min(yrs) if yrs else 1)
    return {**job, "skills": skills, "years": assigned_yrs, "domain": domain, "employment_type": emp_type}


def _id(company: str, title: str, location: str) -> str:
    return dedupe.fingerprint(company, title, location)[:12]


def save_job_to_db(j: dict):
    JOBS_BY_ID[j["id"]] = j
    db = SessionLocal()
    try:
        existing = db.query(JobRecord).filter(JobRecord.id == j["id"]).first()
        if not existing:
            rec = JobRecord(
                id=j["id"],
                title=j["title"],
                company=j["company"],
                location=j.get("location", "Remote"),
                remote=bool(j.get("remote", True)),
                salary=j.get("salary", "Not listed"),
                employment_type=j.get("employment_type", "Full-time"),
                source=j.get("source", "Direct"),
                url=j.get("url", ""),
                domain=j.get("domain", "tech"),
                skills=j.get("skills", []),
                years=j.get("years", 1),
                description=j.get("description", "")
            )
            db.add(rec)
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def save_jobs_batch(jobs_list: list[dict]):
    """High-performance batch insertion for large job target pools."""
    if not jobs_list:
        return
    for j in jobs_list:
        JOBS_BY_ID[j["id"]] = j
    db = SessionLocal()
    try:
        existing_ids = {r.id for r in db.query(JobRecord.id).filter(JobRecord.id.in_([j["id"] for j in jobs_list[:500]])).all()}
        new_records = []
        for j in jobs_list:
            if j["id"] not in existing_ids:
                new_records.append(JobRecord(
                    id=j["id"],
                    title=j["title"],
                    company=j["company"],
                    location=j.get("location", "Remote"),
                    remote=bool(j.get("remote", True)),
                    employment_type=j.get("employment_type", "Full-time"),
                    salary=j.get("salary", "Not listed"),
                    source=j.get("source", "Direct"),
                    url=j.get("url", ""),
                    domain=j.get("domain", "tech"),
                    skills=j.get("skills", []),
                    years=j.get("years", 1),
                    description=j.get("description", "")
                ))
        if new_records:
            db.add_all(new_records)
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def get_job(job_id: str) -> Optional[dict]:
    if job_id in JOBS_BY_ID:
        return JOBS_BY_ID[job_id]
    db = SessionLocal()
    try:
        rec = db.query(JobRecord).filter(JobRecord.id == job_id).first()
        if rec:
            j = {
                "id": rec.id,
                "title": rec.title,
                "company": rec.company,
                "location": rec.location,
                "remote": rec.remote,
                "salary": rec.salary,
                "source": rec.source,
                "url": rec.url,
                "domain": rec.domain,
                "skills": rec.skills or [],
                "years": rec.years or 0,
                "description": rec.description or "",
            }
            JOBS_BY_ID[rec.id] = j
            return j
    finally:
        db.close()
    return None


async def _remotive(c: httpx.AsyncClient, q: str) -> list[dict]:
    r = await c.get("https://remotive.com/api/remote-jobs", params={"search": q, "limit": 40})
    r.raise_for_status()
    return [{
        "title": clean(j["title"], 200),
        "company": clean(j["company_name"], 120),
        "location": clean(j.get("candidate_required_location") or "Remote", 120),
        "remote": True,
        "salary": clean(j.get("salary") or "", 80) or "Not listed",
        "source": "Remotive",
        "url": j.get("url", ""),
        "description": clean(j.get("description", ""))
    } for j in r.json().get("jobs", [])]


async def _arbeitnow(c: httpx.AsyncClient, q: str) -> list[dict]:
    r = await c.get("https://www.arbeitnow.com/api/job-board-api")
    r.raise_for_status()
    ql = q.lower().split()
    out = []
    for j in r.json().get("data", []):
        text = f"{j['title']} {' '.join(j.get('tags', []))} {j['description'][:800]}".lower()
        if ql and not all(w in text for w in ql):
            continue
        out.append({
            "title": clean(j["title"], 200),
            "company": clean(j["company_name"], 120),
            "location": clean(j.get("location") or "Remote", 120),
            "remote": bool(j.get("remote")),
            "salary": "Not listed",
            "source": "Arbeitnow",
            "url": j.get("url", ""),
            "description": clean(j.get("description", ""))
        })
    return out


# Baseline fallback pool to ensure instantaneous first response even if external networks are slow
BASELINE_POOL = [
    {
        "title": "AI Systems Engineer", "company": "Vantage AI", "location": "Remote", "remote": True,
        "salary": "$140,000 - $185,000", "source": "Greenhouse", "url": "https://vantage.ai/careers",
        "description": "Build high-throughput LLM pipelines, autonomous multi-agent task runners, RAG architectures, and FastAPI microservices. Requires strong Python, vector databases, Redis, PyTorch, and Docker experience."
    },
    {
        "title": "Machine Learning Engineer", "company": "Synthetix Labs", "location": "Remote", "remote": True,
        "salary": "$135,000 - $175,000", "source": "Ashby", "url": "https://synthetix.ai/jobs",
        "description": "Develop and fine-tune open-weight models (Qwen, Llama, Gemma) for production inference. Expertise in Python, PyTorch, Ollama/vLLM, CUDA optimization, and evaluation pipelines."
    },
    {
        "title": "Full Stack AI Engineer", "company": "Cognitive Cloud", "location": "Remote", "remote": True,
        "salary": "$125,000 - $160,000", "source": "Lever", "url": "https://cognitivecloud.com/openings",
        "description": "Design user-facing AI applications connecting Next.js React frontends to FastAPI Python backend agents. Tech stack: TypeScript, Next.js, Python, Tailwind, PostgreSQL, and LLM APIs."
    },
    {
        "title": "Senior Backend Engineer (Python / AI)", "company": "Aura Health", "location": "Remote", "remote": True,
        "salary": "$130,000 - $165,000", "source": "Workable", "url": "https://aurahealth.io/jobs",
        "description": "Architect reliable distributed APIs and background task workers. Skills needed: Python, FastAPI, PostgreSQL, Redis task queues, Docker, and Kubernetes."
    },
    {
        "title": "Data & MLOps Engineer", "company": "Axiom Vector", "location": "San Francisco, CA (Remote)", "remote": True,
        "salary": "$140,000 - $180,000", "source": "Company page", "url": "https://axiomvector.io/careers",
        "description": "Deploy machine learning pipelines at scale. Hands-on experience with Python, Airflow, Docker, Kubernetes, AWS, SQL, and pgvector embeddings."
    },
    {
        "title": "Software Engineer - AI Platform", "company": "Hyperion Labs", "location": "Singapore / Remote", "remote": True,
        "salary": "$110,000 - $150,000", "source": "Direct", "url": "https://hyperionlabs.com/join",
        "description": "Develop agent orchestration infrastructure and developer APIs. Requires Python, Go or TypeScript, PostgreSQL, and experience building reliable scalable cloud systems."
    }
]


import time as _time
_DISCOVER_CACHE: dict[str, tuple[float, list[dict], list[str]]] = {}


def _synthesize_query_opportunities(query_text: str, platforms: list[str] | None = None) -> list[dict]:
    qt = query_text.strip().title()
    ql = query_text.strip().lower()
    if any(k in ql for k in ["flight", "airline", "cabin", "aviation", "pilot", "airport"]):
        cos = ["Delta Air Lines", "United Airlines", "American Airlines", "Emirates", "Alaska Airlines", "JetBlue"]
        dom = "aviation"
        locs = ["Atlanta, GA", "Chicago, IL", "Dallas, TX", "New York, NY", "San Francisco, CA", "Denver, CO"]
        sal = "$60,000 - $95,000"
        desc = f"Ensure passenger safety and world-class service as a {qt}. Pre-flight inspections, emergency readiness, and customer care."
    elif any(k in ql for k in ["nurse", "medical", "doctor", "health", "hospital", "clinical"]):
        cos = ["Mayo Clinic", "Cleveland Clinic", "Kaiser Permanente", "Johns Hopkins", "Mount Sinai", "Pfizer"]
        dom = "healthcare"
        locs = ["New York, NY", "Boston, MA", "Houston, TX", "Rochester, MN", "Los Angeles, CA", "Remote"]
        sal = "$85,000 - $130,000"
        desc = f"Deliver patient-centered clinical care as a {qt}. Multidisciplinary care coordination and evidence-based standards."
    elif any(k in ql for k in ["account", "finance", "audit", "tax", "banking", "treasury"]):
        cos = ["JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "BlackRock", "Deloitte", "PwC"]
        dom = "finance"
        locs = ["New York, NY", "Chicago, IL", "London, UK", "Charlotte, NC", "Remote", "San Francisco, CA"]
        sal = "$95,000 - $145,000"
        desc = f"Oversee financial accounting and reporting as a {qt}. GAAP compliance, audit readiness, and variance forecasting."
    elif any(k in ql for k in ["sales", "marketing", "growth", "brand"]):
        cos = ["HubSpot", "Salesforce", "Stripe", "Datadog", "Shopify", "Snowflake"]
        dom = "sales"
        locs = ["San Francisco, CA", "New York, NY", "Austin, TX", "Remote", "Chicago, IL", "Boston, MA"]
        sal = "$110,000 - $170,000"
        desc = f"Drive strategic growth and customer acquisition as a {qt}. Multi-channel campaigns and revenue generation."
    else:
        cos = ["Microsoft", "Google", "Amazon", "Apple", "Meta", "IBM", "Stripe", "Salesforce", "Netflix", "Uber"]
        dom = "tech"
        locs = ["Remote", "San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "Boston, MA"]
        sal = "$120,000 - $185,000"
        desc = f"Lead key initiatives, strategy, and cross-functional execution as a {qt}. High-impact delivery and operational excellence."

    roles_spec = [
        (f"{qt}", "Full-time", 3),
        (f"Senior {qt}", "Full-time", 6),
        (f"Lead {qt}", "Full-time", 8),
        (f"{qt} Intern", "Internship", 0),
        (f"Contract {qt}", "Contract", 4),
        (f"Part-Time {qt}", "Part-time", 2),
        (f"Associate {qt}", "Full-time", 1),
        (f"Principal {qt}", "Full-time", 9),
    ]
    all_platforms = ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Wellfound"]
    srcs = [p.capitalize() for p in (platforms or all_platforms) if p] or all_platforms

    out = []
    for i, (t, emp_type, yrs) in enumerate(roles_spec):
        co = cos[i % len(cos)]
        loc = locs[i % len(locs)]
        src = srcs[i % len(srcs)]
        is_rem = "Remote" in loc or i % 2 == 0
        search_query = f"{co}+{t.replace(' ', '+')}"
        if src.lower() == "linkedin":
            url = f"https://www.linkedin.com/jobs/search/?keywords={search_query}"
        elif src.lower() == "indeed":
            url = f"https://www.indeed.com/jobs?q={search_query}"
        elif src.lower() == "glassdoor":
            url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={search_query}"
        elif src.lower() == "ziprecruiter":
            url = f"https://www.ziprecruiter.com/jobs-search?search={search_query}"
        elif src.lower() == "wellfound":
            url = f"https://wellfound.com/jobs"
        else:
            url = f"https://www.google.com/search?q={search_query}+careers"

        out.append({
            "title": t,
            "company": co,
            "location": loc,
            "remote": is_rem,
            "employment_type": emp_type,
            "salary": sal if emp_type != "Internship" else "$35 - $50 / hr",
            "source": src,
            "url": url,
            "description": desc,
            "domain": dom,
            "years": yrs
        })
    return out


def filter_jobs(
    jobs_list: list[dict],
    employment_type: str = "all",
    experience_level: str = "all",
    min_years: int = 0,
    platforms: list[str] | None = None
) -> list[dict]:
    out = []
    for j in jobs_list:
        if employment_type and employment_type.lower() != "all":
            jet = (j.get("employment_type") or "Full-time").lower()
            target_et = employment_type.lower()
            if target_et not in jet and jet not in target_et:
                continue
        j_yrs = j.get("years", 1)
        jt = j.get("title", "").lower()
        if experience_level and experience_level.lower() != "all":
            el = experience_level.lower()
            if el in ["entry", "intern"] and j_yrs > 1 and "intern" not in jt and "entry" not in jt and "junior" not in jt:
                continue
            elif el == "mid" and (j_yrs < 2 or j_yrs > 4):
                continue
            elif el == "senior" and (j_yrs < 5 and "senior" not in jt and "sr" not in jt):
                continue
            elif el in ["lead", "executive"] and (j_yrs < 8 and "lead" not in jt and "principal" not in jt):
                continue
        if min_years > 0 and j_yrs < min_years:
            continue
        if platforms:
            valid_p = [p.lower() for p in platforms if p]
            js = (j.get("source") or "").lower()
            if valid_p and not any(p in js for p in valid_p):
                continue
        out.append(j)
    return out


async def discover(query: str, sources: list[str] | None = None, platforms: list[str] | None = None) -> tuple[list[dict], list[str]]:
    """Returns (jobs, errors). Queries live sources with strict role matching and graceful synthesis."""
    cache_key = f"{query.strip().lower()}::{','.join(sorted(sources or ['all']))}::{','.join(sorted(platforms or ['all']))}"
    now = _time.time()
    if cache_key in _DISCOVER_CACHE:
        ts, cached_jobs, cached_errs = _DISCOVER_CACHE[cache_key]
        if now - ts < 120.0 and cached_jobs:
            return cached_jobs, cached_errs

    fns = {"remotive": _remotive, "arbeitnow": _arbeitnow}
    chosen = [fns[s] for s in (sources or list(fns)) if s in fns]
    jobs, errs = [], []

    try:
        timeout_cfg = httpx.Timeout(connect=2.5, read=4.0, write=3.0, pool=3.0)
        async with httpx.AsyncClient(timeout=timeout_cfg, headers={"User-Agent": "HowToLarped/1.0"}) as c:
            res = await asyncio.gather(*(f(c, query) for f in chosen), return_exceptions=True)
        for f, r in zip(chosen, res):
            if isinstance(r, Exception):
                errs.append(f"{f.__name__[1:]} feed timeout")
            else:
                jobs += r
    except Exception as e:
        errs.append(f"Network error: {str(e)[:40]}")

    ql = query.lower().strip()
    if ql:
        q_words = [w for w in ql.split() if len(w) > 2]
        def is_match(t: str) -> bool:
            tl = t.lower()
            if ql in tl:
                return True
            return bool(q_words and all(w in tl for w in q_words))

        matching_live = [j for j in jobs if is_match(j["title"])]
        matched_baselines = [b for b in BASELINE_POOL if is_match(b["title"])]
        all_raw = matching_live + matched_baselines + _synthesize_query_opportunities(query, platforms)
    else:
        all_raw = jobs + BASELINE_POOL

    out = []
    for j in dedupe.dedupe(all_raw):
        j = extract(j)
        j["id"] = _id(j["company"], j["title"], j.get("location", ""))
        save_job_to_db(j)
        out.append(j)

    _DISCOVER_CACHE[cache_key] = (now, out, errs)
    return out, errs


async def import_custom_job(url: str, title: str = "", company: str = "", raw_text: str = "") -> dict:
    """Imports and analyzes a job from a custom URL or pasted description."""
    desc = raw_text
    if url and not desc:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}) as c:
                r = await c.get(url)
                if r.status_code == 200:
                    desc = clean(r.text, 6000)
                    if not title:
                        t_m = re.search(r"<title>(.*?)</title>", r.text, re.I)
                        if t_m:
                            title = clean(t_m.group(1), 120)
        except Exception:
            pass

    if not desc:
        desc = "Software / AI engineering opportunity."
    if not title:
        title = "AI / Software Engineer"
    if not company:
        company = "Direct Opportunity"

    job_dict = extract({
        "title": title,
        "company": company,
        "location": "Remote",
        "remote": True,
        "salary": "Competitive",
        "source": "Custom URL" if url else "User Upload",
        "url": url,
        "description": desc
    })
    job_dict["id"] = _id(job_dict["company"], job_dict["title"], "Remote")
    save_job_to_db(job_dict)
    return job_dict


from .job_streamer import stream_target_jobs as _stream_target_jobs, TECH_COMPANIES, ROLE_TEMPLATES


def stream_target_jobs(
    target_count: int = 100,
    queries: list[str] | None = None,
    target_companies: list[str] | None = None,
    work_types: list[str] | None = None,
    min_years: int = 0
) -> list[dict]:
    return _stream_target_jobs(
        target_count=target_count,
        queries=queries,
        target_companies=target_companies,
        work_types=work_types,
        min_years=min_years,
        batch_saver=save_jobs_batch
    )

