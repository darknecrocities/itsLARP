from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from services import resume_parser, apa_resume
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


class APAResumeIn(BaseModel):
    profile: dict


@router.post("/apa-resume")
def profile_apa_resume(b: APAResumeIn):
    text = apa_resume.generate_apa_text(b.profile)
    html = apa_resume.generate_apa_html(b.profile)
    return {
        "text": text,
        "html": html,
        "format": "APA 7th Edition"
    }


@router.get("/apa-resume/download")
def profile_apa_resume_download(format: str = "html"):
    db = SessionLocal()
    try:
        rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        p = {
            "name": rec.name if rec else "Candidate Name",
            "headline": rec.headline if rec else "Software Engineer",
            "email": rec.email if rec else "",
            "location": rec.location if rec else "Remote",
            "years": rec.years if rec else 2,
            "education": rec.education if rec else "Bachelor of Science in Computer Science",
            "skills": (rec.skills or []) if rec else [],
            "experience": (rec.experience or []) if rec else [],
            "projects": (rec.projects or []) if rec else [],
            "links": (rec.links or {}) if rec else {},
            "evidence": (rec.evidence or []) if rec else [],
        }
        if format == "txt":
            return Response(
                content=apa_resume.generate_apa_text(p),
                media_type="text/plain",
                headers={"Content-Disposition": 'attachment; filename="Resume_APA_Format.txt"'}
            )
        return HTMLResponse(content=apa_resume.generate_apa_html(p))
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
                "links": rec.links or {},
                "evidence": rec.evidence or [],
            }
        }
    finally:
        db.close()
