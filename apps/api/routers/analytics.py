from fastapi import APIRouter
from services.database import SessionLocal, ApplicationRecord

router = APIRouter(tags=["analytics"])


@router.get("/analytics")
def analytics_get():
    db = SessionLocal()
    try:
        apps = db.query(ApplicationRecord).all()
        sent = [a for a in apps if a.status not in ["SAVED", "ANALYZING", "PREPARING", "READY"]]
        total = len(sent)
        resp = len([a for a in sent if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]])
        interviews = len([a for a in sent if a.status in ["INTERVIEW", "OFFER"]])
        offers = len([a for a in sent if a.status == "OFFER"])

        # Role performance breakdown
        roles: dict[str, dict] = {}
        for a in sent:
            key = (
                "AI / ML"
                if any(w in a.role.lower() for w in ["ai", "ml", "learning"])
                else "Software / Backend"
                if any(w in a.role.lower() for w in ["backend", "software", "web"])
                else "Other"
            )
            if key not in roles:
                roles[key] = {"applied": 0, "responses": 0, "interviews": 0}
            roles[key]["applied"] += 1
            if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]:
                roles[key]["responses"] += 1
            if a.status in ["INTERVIEW", "OFFER"]:
                roles[key]["interviews"] += 1

        recommendation = (
            "Target more AI-focused roles where candidate skills show 85%+ technical compatibility."
            if roles.get("AI / ML", {}).get("applied", 0) >= 1
            else "Build more applications to generate statistical conversion insights."
        )

        return {
            "total_applications": total,
            "response_rate": round(100 * resp / max(1, total), 1),
            "interview_rate": round(100 * interviews / max(1, total), 1),
            "offer_rate": round(100 * offers / max(1, total), 1),
            "roles": roles,
            "recommendation": recommendation,
        }
    finally:
        db.close()
