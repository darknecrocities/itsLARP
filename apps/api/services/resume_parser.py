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

    # Name extraction heuristic: first non-empty line that isn't email/link
    name = ""
    for line in clean_lines[:5]:
        if len(line) < 45 and not re.search(r"[@/\\:|]", line) and not any(k in line.lower() for k in ["curriculum", "resume", "cv", "page"]):
            name = line
            break

    # Email
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    email = email_match.group(0) if email_match else ""

    # Location heuristic (e.g. "Manila, Philippines", "San Francisco, CA", "Remote")
    location = ""
    for loc_match in re.finditer(r"\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2,}|Remote|[A-Za-z\s]+Philippines|[A-Za-z\s]+Singapore|[A-Za-z\s]+USA|[A-Za-z\s]+Canada)\b", text):
        candidate_loc = loc_match.group(0).strip()
        if len(candidate_loc) < 40 and not any(w in candidate_loc.lower() for w in ["university", "college", "experience", "education"]):
            location = candidate_loc
            break

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
        "location": location or "Remote",
        "years": years,
        "education": "Bachelor of Science in Computer Science" if "computer science" in full_lower else "Relevant Degree / Technical Background",
        "skills": list(dict.fromkeys(skills_found)),
        "projects": projects[:6],
        "links": links,
        "evidence": evidence[:25],
        "raw_text": text[:5000],
    }
