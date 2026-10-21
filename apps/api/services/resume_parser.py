import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader

KNOWN_SKILLS = [
    "python", "typescript", "javascript", "react", "next.js", "vue", "angular", "node", "node.js",
    "fastapi", "django", "flask", "pytorch", "tensorflow", "scikit-learn", "keras", "sql", "postgresql",
    "mysql", "sqlite", "redis", "mongodb", "docker", "kubernetes", "aws", "gcp", "azure", "llm", "rag",
    "langchain", "llamaindex", "airflow", "go", "golang", "rust", "java", "c++", "c#", "php", "ruby",
    "swift", "kotlin", "spark", "kafka", "terraform", "linux", "git", "graphql", "tailwind", "css", "html",
    "ci/cd", "pandas", "numpy", "opencv", "nlp", "machine learning", "deep learning", "ollama", "qwen"
]


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text content from PDF bytes using pypdf."""
    reader = PdfReader(io.BytesIO(file_bytes))
    pages_text = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            pages_text.append(t)
    return "\n\n".join(pages_text)


def parse_resume_content(text: str, filename: str = "Resume") -> Dict[str, Any]:
    """Parses raw text into structured Career DNA attributes and evidence items."""
    clean_lines = [line.strip() for line in text.splitlines() if line.strip()]
    full_lower = text.lower()

    DISQUALIFIED_NAME_WORDS = [
        "curriculum", "resume", "cv", "page", "website", "websites", "portfolio", "portfolios",
        "profile", "profiles", "contact", "contacts", "summary", "about", "experience", "education",
        "skills", "projects", "links", "phone", "email", "address", "github", "linkedin", "social",
        "references", "work", "history", "objective", "technical", "engine"
    ]

    # Email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else ""

    # Phone
    phone_match = re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", text)
    phone = phone_match.group(0).strip() if phone_match else ""

    # Name extraction heuristic: find actual personal name, skipping section titles and comma lists
    name = ""
    for line in clean_lines[:10]:
        line_clean = line.strip()
        lower_line = line_clean.lower()
        if re.search(r"[@/\\:|0-9]", line_clean) or line_clean.count(",") > 0:
            continue
        if 2 < len(line_clean) < 40 and not any(k in lower_line for k in DISQUALIFIED_NAME_WORDS):
            words = line_clean.split()
            if 1 <= len(words) <= 4:
                name = line_clean
                break

    # Location heuristic (e.g. "Manila, Philippines", "San Francisco, CA", "Remote")
    location = ""
    loc_pattern = re.compile(r"\b([A-Z][a-zA-Z\s]{1,30},\s*(?:[A-Z]{2,}|[A-Z][a-zA-Z]+)|Remote)\b")
    for loc_match in loc_pattern.finditer(text):
        candidate_loc = loc_match.group(0).strip()
        if "\n" in candidate_loc:
            continue
        lower_loc = candidate_loc.lower()
        if len(candidate_loc) < 40 and not any(w in lower_loc for w in ["university", "college", "school", "experience", "education", "dynamic", "systems", "ai", "llm", "engineer", "developer", "sql", "python", "pytorch", "react", "fastapi", "docker", "skills", "projects", "frameworks"]):
            location = candidate_loc
            break
    if not location:
        if "philippines" in full_lower:
            location = "Manila, Philippines"
        elif "singapore" in full_lower:
            location = "Singapore"
        else:
            location = "Remote"

    # Headline
    headline = ""
    for line in clean_lines[1:6]:
        if any(role in line.lower() for role in ["engineer", "developer", "scientist", "architect", "designer", "manager", "lead", "specialist"]):
            headline = line
            break
    if not headline:
        headline = "Software Engineer" if "software" in full_lower else "AI Engineer" if "ai" in full_lower else "Developer"

    # Years of experience
    year_matches = [int(m.group(1)) for m in re.finditer(r"(\d{1,2})\+?\s*(?:years|yrs)", text, re.IGNORECASE) if int(m.group(1)) < 30]
    years = max(year_matches) if year_matches else 2

    # Skills detection
    skills_found = []
    for skill in KNOWN_SKILLS:
        pattern = r"(?<![a-zA-Z0-9+#.-])" + re.escape(skill) + r"(?![a-zA-Z0-9+#.-])"
        if re.search(pattern, full_lower):
            skills_found.append(skill)

    # Links
    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
    portfolio_match = re.search(r"(?:https?://)?([a-zA-Z0-9_-]+\.(?:dev|io|me|com|app))", text, re.IGNORECASE)

    links = {}
    if github_match:
        links["github"] = f"github.com/{github_match.group(1)}"
    if linkedin_match:
        links["linkedin"] = f"linkedin.com/in/{linkedin_match.group(1)}"
    if portfolio_match and not any(x in portfolio_match.group(0) for x in ["github.com", "linkedin.com", "gmail.com"]):
        links["portfolio"] = portfolio_match.group(0)

    # Education extraction heuristic
    education = ""
    deg_pattern = re.compile(r"\b(bachelor|master|doctor|b\.?s\.?|b\.?sc\.?|m\.?s\.?|m\.?sc\.?|ph\.?d\.?|associate|degree|diploma|polytechnic|university|college|institute)\b", re.I)
    for line in clean_lines:
        lower_l = line.lower().strip()
        if lower_l in ["education", "education:", "academic preparation", "credentials"]:
            continue
        if deg_pattern.search(line):
            if 4 < len(line) < 100 and not any(skip in lower_l for skip in ["experience", "projects", "skills", "summary"]):
                education = line
                break
    if not education:
        education = "Bachelor of Science in Computer Science" if "computer science" in full_lower else "Relevant Degree / Technical Background"

    # Work experience extraction heuristic
    experience = []
    exp_section = False
    for line in clean_lines:
        lower_l = line.lower()
        if any(h == lower_l or lower_l.startswith(h) for h in ["experience", "work experience", "employment history", "professional experience", "work history"]) and len(line) < 35:
            exp_section = True
            continue
        if exp_section:
            if any(h in lower_l for h in ["education", "projects", "certifications", "skills", "languages", "awards", "publications", "interests", "websites"]) and len(line) < 35 and not line.startswith("•") and not line.startswith("-"):
                break
            if 3 < len(line) < 80 and not line.startswith("•") and not line.startswith("-") and not line.startswith("*"):
                # Potential title / company line
                parts = re.split(r"\s*[|–—\-•]\s*", line)
                if len(parts) >= 2:
                    experience.append({"title": parts[0].strip(), "company": parts[1].strip(), "text": ""})
                else:
                    experience.append({"title": line.strip(), "company": "", "text": ""})
            elif experience and (line.startswith("•") or line.startswith("-") or line.startswith("*") or len(line) > 10):
                clean_bullet = line.lstrip("•-* ").strip()
                if experience[-1]["text"]:
                    experience[-1]["text"] += " " + clean_bullet
                else:
                    experience[-1]["text"] = clean_bullet

    # Projects extraction heuristic
    projects = []
    proj_section = False
    for line in clean_lines:
        lower_l = line.lower()
        if any(h in lower_l for h in ["projects", "personal projects", "key projects", "notable projects"]):
            proj_section = True
            continue
        if proj_section:
            if any(h in lower_l for h in ["education", "experience", "work history", "certifications", "skills"]):
                break
            if len(line) > 5 and len(line) < 60 and not line.startswith("•") and not line.startswith("-"):
                # Potential project title
                proj_tech = [s for s in skills_found if s in lower_l]
                projects.append({"name": line, "tech": proj_tech, "text": ""})
            elif projects and (line.startswith("•") or line.startswith("-")):
                projects[-1]["text"] += (" " + line.lstrip("•- ")).strip()

    if not projects and skills_found:
        projects = [
            {"name": "Production AI & LLM Systems", "tech": [s for s in skills_found if s in ["python", "fastapi", "rag", "llm", "docker"]], "text": "End-to-end applications with retrieval augmentation and multi-agent coordination."},
            {"name": "Full Stack Platform", "tech": [s for s in skills_found if s in ["typescript", "react", "next.js", "postgresql", "node"]], "text": "Responsive modern web applications with realtime updates."}
        ]

    # Summary / Executive Summary extraction heuristic
    summary = ""
    sum_section = False
    sum_lines = []
    for line in clean_lines:
        lower_l = line.lower().strip()
        if any(lower_l == h or lower_l.startswith(h + ":") for h in [
            "summary", "professional summary", "executive summary", "career summary",
            "profile", "personal profile", "about me", "about", "career objective", "objective"
        ]) and len(line) < 40:
            sum_section = True
            continue
        if sum_section:
            if any(lower_l == h or lower_l.startswith(h + ":") for h in [
                "experience", "work experience", "employment history", "professional experience",
                "education", "academic background", "projects", "skills", "technical skills",
                "certifications", "licenses", "awards", "publications", "languages"
            ]) and len(line) < 40 and not line.startswith("•") and not line.startswith("-"):
                break
            if len(line) > 5 and not line.startswith("•") and not line.startswith("-"):
                sum_lines.append(line)
            elif line.startswith("•") or line.startswith("-"):
                sum_lines.append(line.lstrip("•- ").strip())
            if len(" ".join(sum_lines)) > 600:
                break
    if sum_lines:
        summary = " ".join(sum_lines).strip()

    # Chunk text into evidence items
    evidence = []
    paragraphs = re.split(r"\n\s*\n", text)
    for p in paragraphs:
        cleaned = re.sub(r"\s+", " ", p).strip()
        if len(cleaned.split()) >= 4:
            evidence.append({"source": f"{filename}", "text": cleaned[:400]})

    return {
        "name": name,
        "headline": headline,
        "email": email,
        "phone": phone,
        "location": location or "Remote",
        "years": years,
        "education": education,
        "summary": summary,
        "skills": list(dict.fromkeys(skills_found)),
        "experience": experience[:6],
        "projects": projects[:6],
        "links": links,
        "evidence": evidence[:25],
        "raw_text": text[:5000],
    }


async def extract_candidate_with_llm(
    resume_text: str = "",
    github_info: str = "",
    linkedin_text: str = ""
) -> Dict[str, Any]:
    """Uses local LLM (Ollama / AI Gateway) to extract comprehensive candidate information.
    Falls back gracefully to deterministic parsing if LLM is unavailable.
    """
    from .ai_gateway import ai_gateway
    import json

    # Combine input sources
    combined_corpus = []
    if resume_text:
        combined_corpus.append(f"--- RESUME ---\n{resume_text[:4000]}")
    if github_info:
        combined_corpus.append(f"--- GITHUB PROFILE & REPOSITORIES ---\n{github_info[:2000]}")
    if linkedin_text:
        combined_corpus.append(f"--- LINKEDIN EXPERIENCE ---\n{linkedin_text[:2000]}")

    full_text = "\n\n".join(combined_corpus)
    base_parsed = parse_resume_content(full_text or resume_text or "Software Engineer Candidate", "Uploaded Career Data")

    system_prompt = (
        "You are an expert technical recruiter and resume intelligence parser. "
        "Extract candidate details from the provided resume/career text. "
        "Respond ONLY with a valid JSON object without markdown formatting or code blocks."
    )

    user_prompt = f"""Extract the candidate's profile into this EXACT JSON structure:
{{
  "name": "Full Name",
  "headline": "Professional Title / Headline",
  "email": "Email address",
  "location": "City, Country or Remote",
  "years": 3,
  "education": "Degree and University",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    {{"company": "Company", "title": "Role", "text": "Key achievements and responsibilities"}}
  ],
  "projects": [
    {{"name": "Project Name", "tech": ["Tech1", "Tech2"], "text": "What was built and key metrics"}}
  ],
  "target_roles": ["Desired Role 1", "Desired Role 2"],
  "summary": "Professional summary statement"
}}

CAREER CORPUS:
{full_text[:3500]}
"""

    try:
        response_text = await ai_gateway.generate(user_prompt, system=system_prompt, max_tokens=1200, temperature=0.1)
        if response_text:
            # Clean possible markdown ticks
            cleaned = re.sub(r"^```json\s*", "", response_text.strip(), flags=re.I)
            cleaned = re.sub(r"^```\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            data = json.loads(cleaned)

            # Merge with verifiable parsed info
            merged_skills = list(dict.fromkeys(
                [s.lower() for s in data.get("skills", []) if isinstance(s, str)] +
                base_parsed.get("skills", [])
            ))

            return {
                "name": data.get("name") or base_parsed.get("name"),
                "headline": data.get("headline") or base_parsed.get("headline"),
                "email": data.get("email") or base_parsed.get("email"),
                "location": data.get("location") or base_parsed.get("location"),
                "years": data.get("years") if isinstance(data.get("years"), (int, float)) else base_parsed.get("years"),
                "education": data.get("education") or base_parsed.get("education"),
                "skills": merged_skills,
                "experience": data.get("experience") or base_parsed.get("experience", []),
                "projects": data.get("projects") or base_parsed.get("projects", []),
                "target_roles": data.get("target_roles", ["AI Engineer", "Software Engineer"]),
                "summary": data.get("summary", ""),
                "links": base_parsed.get("links", {}),
                "evidence": base_parsed.get("evidence", []),
                "extracted_by": f"Local LLM ({ai_gateway.model})"
            }
    except Exception as e:
        # Graceful fallback to deterministic parsing
        pass

    base_parsed["extracted_by"] = "Deterministic Heuristic Engine"
    return base_parsed

