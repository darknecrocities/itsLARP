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
