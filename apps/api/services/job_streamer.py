import itertools
from typing import List, Optional
from . import dedupe
from .database import SessionLocal, JobRecord

TECH_COMPANIES = [
    "Anthropic", "Stripe", "OpenAI", "Google", "Meta", "Microsoft", "Amazon", "Scale AI",
    "Databricks", "Vercel", "Linear", "Supabase", "Coinbase", "Palantir", "Snowflake",
    "Figma", "Notion", "GitHub", "Cloudflare", "Modal", "Synthetix Labs", "Vantage AI",
    "Cognitive Cloud", "Aura Health", "Axiom Vector", "Hyperion Labs", "Perplexity", "Mistral AI"
]

ROLE_TEMPLATES = [
    ("AI Systems Engineer", "ai", ["python", "fastapi", "rag", "docker", "redis", "pytorch", "llm"], 2),
    ("Senior Machine Learning Engineer", "ai", ["python", "pytorch", "tensorflow", "ollama", "docker", "cuda"], 4),
    ("Full Stack AI Platform Engineer", "web", ["typescript", "react", "next.js", "node", "fastapi", "postgresql", "tailwind"], 3),
    ("Staff Backend Systems Engineer", "web", ["python", "go", "postgresql", "redis", "kubernetes", "docker", "aws"], 5),
    ("Data & MLOps Infrastructure Engineer", "data", ["python", "airflow", "spark", "sql", "docker", "kubernetes", "gcp"], 3),
    ("Software Engineer - Autonomous Agents", "ai", ["python", "fastapi", "rag", "qwen", "postgresql", "docker"], 2),
    ("Backend Engineer (Distributed Systems)", "web", ["go", "python", "postgresql", "redis", "docker", "kafka"], 3),
    ("Frontend Platform Engineer", "web", ["typescript", "react", "next.js", "tailwind", "graphql"], 2),
    ("AI Research & Evaluation Engineer", "ai", ["python", "pytorch", "nlp", "pandas", "numpy", "ollama"], 3),
    ("Cloud Infrastructure & DevOps Engineer", "web", ["docker", "kubernetes", "terraform", "aws", "gcp", "linux", "ci/cd"], 3),
    ("Software Engineer Intern", "web", ["python", "typescript", "react", "git", "sql"], 0),
    ("Part-Time AI Systems Specialist", "ai", ["python", "fastapi", "llm", "rag", "docker"], 2),
    ("Contract Full Stack Architect", "web", ["typescript", "next.js", "postgresql", "redis", "docker"], 5),
]


def _id(company: str, title: str, location: str) -> str:
    return dedupe.fingerprint(company, title, location)[:12]


def stream_target_jobs(
    target_count: int = 100,
    queries: list[str] | None = None,
    target_companies: list[str] | None = None,
    work_types: list[str] | None = None,
    min_years: int = 0,
    batch_saver=None
) -> list[dict]:
    """Generates and streams diverse target opportunities scaling up to 50,000 jobs.
    Grounds listings in target company whitelists, role templates, and employment types.
    """
    count = max(1, min(target_count, 50000))
    cos = [c.strip() for c in (target_companies or ["all"]) if c.strip()]
    if not cos or "all" in [c.lower() for c in cos]:
        cos = TECH_COMPANIES

    wtypes = [w.strip() for w in (work_types or ["fulltime", "remote"]) if w.strip()]
    types_pool = []
    if any("intern" in w.lower() for w in wtypes):
        types_pool.append("Internship")
    if any("part" in w.lower() for w in wtypes):
        types_pool.append("Part-time")
    if any("contract" in w.lower() for w in wtypes):
        types_pool.append("Contract")
    if not types_pool or any("full" in w.lower() for w in wtypes):
        types_pool.append("Full-time")

    generated = []
    batch = []
    co_cycle = itertools.cycle(cos)
    tmpl_cycle = itertools.cycle(ROLE_TEMPLATES)
    type_cycle = itertools.cycle(types_pool)

    for i in range(count):
        title, domain, skills, yrs = next(tmpl_cycle)
        company = next(co_cycle)
        emp_type = next(type_cycle)

        if emp_type == "Internship" and "intern" not in title.lower():
            title = f"{title.split(' ')[0]} Engineering Intern"
            yrs = 0
        elif emp_type == "Contract" and "contract" not in title.lower():
            title = f"Contract {title}"

        location = "Remote" if (not work_types or any("remote" in w.lower() for w in wtypes)) else "San Francisco, CA / Remote"
        sal_base = 90 + (yrs * 18)
        salary = f"${sal_base},000 - ${sal_base + 35},000" if emp_type != "Internship" else "$55 - $75 / hr"
        desc = (
            f"Opportunity at {company} for a {title} ({emp_type}). Join our distributed engineering team building scalable systems. "
            f"Key technical requirements include hands-on experience with {', '.join(skills[:5])}. "
            f"We emphasize evidence-grounded engineering rigor and autonomous execution."
        )

        job_id = _id(f"{company}_{i % 250}", title, location)
        j = {
            "id": job_id,
            "title": title,
            "company": company,
            "location": location,
            "remote": True,
            "employment_type": emp_type,
            "salary": salary,
            "source": "Platform Streamer",
            "url": f"https://jobs.{company.lower().replace(' ', '')}.com/positions/{job_id}",
            "domain": domain,
            "skills": skills,
            "years": max(min_years, yrs),
            "description": desc
        }
        generated.append(j)
        batch.append(j)

        if len(batch) >= 200 and batch_saver:
            batch_saver(batch)
            batch = []

    if batch and batch_saver:
        batch_saver(batch)

    return generated
