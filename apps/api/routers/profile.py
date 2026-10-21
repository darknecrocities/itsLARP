from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from services import resume_parser, apa_resume, profile_crawler, resume_formats
from services.database import SessionLocal, ProfileRecord

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("/parse-resume")
async def parse_resume_upload(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or "uploaded_resume"
    if filename.lower().endswith(".pdf"):
        try:
            text = resume_parser.extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(400, f"Could not read PDF resume: {str(e)}")
    else:
        try:
            text = content.decode("utf-8", errors="ignore")
        except Exception:
            text = str(content)
    if not text.strip():
        raise HTTPException(400, "The uploaded file contains no readable text.")
    parsed = resume_parser.parse_resume_content(text, filename)
    return parsed


class ExtractCandidateIn(BaseModel):
    resume_text: str = ""
    github_info: str = ""
    linkedin_text: str = ""


@router.post("/extract-candidate-llm")
async def profile_extract_candidate_llm(b: ExtractCandidateIn):
    return await resume_parser.extract_candidate_with_llm(
        resume_text=b.resume_text,
        github_info=b.github_info,
        linkedin_text=b.linkedin_text
    )


class CrawlAndConstructIn(BaseModel):
    github_url: str = ""
    linkedin_url: str = ""
    linkedin_text: str = ""
    portfolio_url: str = ""
    resume_text: str = ""
    custom_instructions: str = ""
    notes: str = ""
    full_name: str = ""
    headline: str = ""
    profile: Optional[dict] = None


class SyncLinkedInIn(BaseModel):
    linkedin_url: str = ""
    linkedin_text: str = ""


@router.post("/sync-linkedin")
async def profile_sync_linkedin(b: SyncLinkedInIn):
    from services import linkedin_crawler
    return await linkedin_crawler.crawl_linkedin_profile(b.linkedin_url, b.linkedin_text)


@router.post("/crawl-and-construct")
async def profile_crawl_and_construct(b: CrawlAndConstructIn):
    inst = (b.custom_instructions or b.notes or "").strip()
    current_p = dict(b.profile or {})
    if b.full_name:
        current_p["name"] = b.full_name
    if b.headline:
        current_p["headline"] = b.headline
    return await profile_crawler.construct_dna_with_llm(
        current_profile=current_p or None,
        github_url=b.github_url,
        linkedin_url=b.linkedin_url,
        linkedin_text=b.linkedin_text,
        portfolio_url=b.portfolio_url,
        resume_text=b.resume_text,
        custom_instructions=inst,
    )


class RefineSectionIn(BaseModel):
    section: str
    current_value: str = ""
    instruction: str = "Improve clarity, technical precision, and measurable engineering impact."
    profile_context: Optional[dict] = None


@router.post("/refine-section")
async def profile_refine_section(b: RefineSectionIn):
    return await profile_crawler.refine_section_with_llm(
        section=b.section,
        current_value=b.current_value,
        instruction=b.instruction,
        profile_context=b.profile_context or {},
    )


class RenderResumeIn(BaseModel):
    profile: dict
    format: str = "apa_7th"
    job: Optional[dict] = None
    config: Optional[dict] = None


@router.post("/render-resume")
def profile_render_resume(b: RenderResumeIn):
    cfg = dict(b.config or {})
    cfg["resumeFormat"] = b.format or cfg.get("resumeFormat", "apa_7th")
    return resume_formats.tailor_resume_to_job(b.profile, b.job, cfg)


class APAResumeIn(BaseModel):
    profile: dict
    format: str = "apa_7th"
    job: Optional[dict] = None
    config: Optional[dict] = None


@router.post("/apa-resume")
def profile_apa_resume(b: APAResumeIn):
    cfg = dict(b.config or {})
    fmt = b.format or cfg.get("resumeFormat", "apa_7th")
    cfg["resumeFormat"] = fmt
    res = resume_formats.tailor_resume_to_job(b.profile, b.job, cfg)
    return {
        "text": res["text"],
        "html": res["html"],
        "format": res["format_label"],
        "format_key": res["format"],
        "tailored_profile": res["tailored_profile"],
    }


@router.get("/apa-resume/download")
def profile_apa_resume_download(format: str = "html", style: str = "apa_7th"):
    if format in resume_formats.FORMAT_LABELS:
        style = format
        format = "html"
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        p = {
            "name": rec.name if rec else "Candidate Name",
            "headline": rec.headline if rec else "Software Engineer",
            "email": rec.email if rec else "",
            "phone": (rec.phone or "") if rec else "",
            "location": rec.location if rec else "Remote",
            "years": rec.years if rec else 2,
            "education": rec.education if rec else "Bachelor of Science in Computer Science",
            "summary": (rec.summary or "") if rec else "",
            "skills": (rec.skills or []) if rec else [],
            "experience": (rec.experience or []) if rec else [],
            "projects": (rec.projects or []) if rec else [],
            "certifications": (getattr(rec, "certifications", []) or []) if rec else [],
            "licenses": (getattr(rec, "licenses", []) or []) if rec else [],
            "github_metrics": (getattr(rec, "github_metrics", {}) or {}) if rec else {},
            "links": (rec.links or {}) if rec else {},
            "evidence": (rec.evidence or []) if rec else [],
        }
        rendered = resume_formats.tailor_resume_to_job(p, None, {"resumeFormat": style})
        if format == "txt":
            return Response(
                content=rendered["text"],
                media_type="text/plain",
                headers={"Content-Disposition": f'attachment; filename="Resume_{style}.txt"'}
            )
        return HTMLResponse(content=rendered["html"])
    finally:
        db.close()


class ProfileIn(BaseModel):
    profile: dict


@router.post("/save")
def profile_save(b: ProfileIn):
    p = b.profile
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if not rec:
            rec = ProfileRecord(id="default")
            db.add(rec)
        rec.name = p.get("name", "")
        rec.headline = p.get("headline", "")
        rec.email = p.get("email", "")
        rec.phone = p.get("phone", "")
        rec.location = p.get("location", "")
        rec.years = p.get("years", 0)
        rec.education = p.get("education", "")
        rec.summary = p.get("summary", "")
        rec.target_roles = p.get("target_roles", ["all"])
        rec.target_companies = p.get("target_companies", ["all"])
        rec.work_types = p.get("work_types", ["fulltime", "remote"])
        rec.skills = p.get("skills", [])
        rec.experience = p.get("experience", [])
        rec.projects = p.get("projects", [])
        rec.certifications = p.get("certifications", [])
        rec.licenses = p.get("licenses", [])
        rec.github_metrics = p.get("github_metrics", {})
        rec.links = p.get("links", {})
        rec.evidence = p.get("evidence", [])
        db.commit()
        return {"ok": True}
    finally:
        db.close()


@router.get("")
@router.post("")
def profile_get():
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if not rec:
            return {"profile": None}
        return {
            "profile": {
                "name": rec.name,
                "headline": rec.headline,
                "email": rec.email,
                "phone": rec.phone or "",
                "location": rec.location,
                "years": rec.years or 0,
                "education": rec.education or "",
                "summary": rec.summary or "",
                "target_roles": rec.target_roles or ["all"],
                "target_companies": rec.target_companies or ["all"],
                "work_types": rec.work_types or ["fulltime", "remote"],
                "skills": rec.skills or [],
                "experience": rec.experience or [],
                "projects": rec.projects or [],
                "certifications": getattr(rec, "certifications", []) or [],
                "licenses": getattr(rec, "licenses", []) or [],
                "github_metrics": getattr(rec, "github_metrics", {}) or {},
                "links": rec.links or {},
                "evidence": rec.evidence or [],
            }
        }
    finally:
        db.close()
