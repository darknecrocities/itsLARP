from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import swarm
from services.database import SessionLocal, ProfileRecord, AgentQuestionRecord

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/questions")
def get_pending_questions():
    db = SessionLocal()
    try:
        recs = db.query(AgentQuestionRecord).filter(
            AgentQuestionRecord.status == "pending"
        ).order_by(AgentQuestionRecord.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "run_id": r.run_id,
                "bot_id": r.bot_id,
                "job_id": r.job_id,
                "company": r.company,
                "role": r.role,
                "question": r.question,
                "context": r.context,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else ""
            }
            for r in recs
        ]
    finally:
        db.close()


class AnswerQuestionIn(BaseModel):
    answer: str


@router.post("/questions/{question_id}/answer")
def answer_question(question_id: str, b: AnswerQuestionIn):
    db = SessionLocal()
    try:
        q_rec = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == question_id).first()
        if not q_rec:
            raise HTTPException(404, "Question not found")
        q_rec.status = "answered"
        q_rec.answer = b.answer
        q_rec.answered_at = datetime.utcnow()

        p_rec = db.query(ProfileRecord).filter(ProfileRecord.id == "default").first()
        if p_rec:
            evs = list(p_rec.evidence or [])
            evs.append({
                "source": f"Candidate Clarification ({q_rec.company})",
                "text": f"Question: {q_rec.question} | Candidate Response: {b.answer}"
            })
            p_rec.evidence = evs

        db.commit()

        for run in swarm.RUNS.values():
            if q_rec.bot_id in run.bots:
                bot = run.bots[q_rec.bot_id]
                bot.status = "completed"
                bot.current_task = f"Answer received: '{b.answer[:30]}...'. Application ready for review."
            run.pending_questions = [q for q in run.pending_questions if q.get("id") != question_id]

        return {"ok": True, "question_id": question_id, "evidence_added": True}
    finally:
        db.close()


@router.post("/questions/{question_id}/dismiss")
def dismiss_question(question_id: str):
    db = SessionLocal()
    try:
        q_rec = db.query(AgentQuestionRecord).filter(AgentQuestionRecord.id == question_id).first()
        if q_rec:
            q_rec.status = "dismissed"
            db.commit()
        for run in swarm.RUNS.values():
            run.pending_questions = [q for q in run.pending_questions if q.get("id") != question_id]
        return {"ok": True}
    finally:
        db.close()
