from fastapi import APIRouter
from pydantic import BaseModel
from dataclasses import asdict
from services import scoring, verification

router = APIRouter(tags=["scoring"])


class MatchIn(BaseModel):
    candidate: dict
    job: dict
    embedding_sim: float = 0.0


@router.post("/match")
def match_endpoint(body: MatchIn):
    return asdict(scoring.score_match(body.candidate, body.job, body.embedding_sim))


class VerifyIn(BaseModel):
    text: str
    evidence: list[dict]


@router.post("/verify")
def verify_endpoint(body: VerifyIn):
    return verification.verify(body.text, body.evidence)
