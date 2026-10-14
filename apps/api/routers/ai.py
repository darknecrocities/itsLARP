from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.ai_gateway import ai_gateway

router = APIRouter(prefix="/ai", tags=["ai"])


class AIConfigIn(BaseModel):
    provider: str
    model: str
    api_key: Optional[str] = None


@router.get("/status")
async def ai_status():
    return await ai_gateway.get_status()


@router.post("/configure")
def ai_configure(b: AIConfigIn):
    ai_gateway.set_config(b.provider, b.model, b.api_key)
    return {"ok": True, "provider": ai_gateway.provider, "model": ai_gateway.model}


# --- LLM Recommendations ---

class RecIn(BaseModel):
    profile: dict = {}


@router.post("/recommendations")
def ai_recommendations(b: RecIn):
    from services import recommendations
    from services.database import SessionLocal, ProfileRecord

    p = b.profile
    if not p.get("name") and not p.get("skills"):
        db = SessionLocal()
        try:
            rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
            if rec:
                p = {
                    "name": rec.name,
                    "headline": rec.headline,
                    "skills": rec.skills or [],
                    "projects": rec.projects or [],
                    "years": rec.years or 2,
                    "target_roles": rec.target_roles or ["all"],
                    "work_types": rec.work_types or ["fulltime", "remote"],
                    "evidence": rec.evidence or []
                }
        finally:
            db.close()
    return recommendations.generate_recommendations(p)


class ApplyRecIn(BaseModel):
    rec_changes: dict
    profile: dict = {}


@router.post("/recommendations/apply")
def ai_recommendations_apply(b: ApplyRecIn):
    from services import recommendations
    from services.database import SessionLocal, ProfileRecord

    p = b.profile
    if not p.get("name") and not p.get("skills"):
        db = SessionLocal()
        try:
            rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
            if rec:
                p = {
                    "name": rec.name,
                    "headline": rec.headline,
                    "email": rec.email,
                    "location": rec.location,
                    "skills": rec.skills or [],
                    "projects": rec.projects or [],
                    "experience": rec.experience or [],
                    "years": rec.years or 2,
                    "target_roles": rec.target_roles or ["all"],
                    "target_companies": rec.target_companies or ["all"],
                    "work_types": rec.work_types or ["fulltime", "remote"],
                    "evidence": rec.evidence or []
                }
        finally:
            db.close()
    updated = recommendations.apply_recommendation_to_profile(b.rec_changes, p)
    return {"ok": True, "profile": updated}
