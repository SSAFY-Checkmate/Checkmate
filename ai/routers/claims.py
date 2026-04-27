from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from services.claimify.llm_client import LLMClient
from services.claimify.pipeline import ClaimifyPipeline

router = APIRouter(prefix="/claims", tags=["claims"])

class ClaimExtractionRequest(BaseModel):
    text: str
    video_title: str = "Unknown Video"

class ClaimExtractionResponse(BaseModel):
    claims: List[str]

@router.post("/extract", response_model=ClaimExtractionResponse)
async def extract_claims_endpoint(request: ClaimExtractionRequest):
    try:
        # LLMClient \ucd08\uae30\ud654 (\ud658\uacbd \ubcc0\uc218\ub85c OPENAI_API_KEY \ud544\uc694)
        llm_client = LLMClient()
        pipeline = ClaimifyPipeline(llm_client, request.video_title)
        
        # ClaimifyPipeline\uc758 run \uba54\uc11c\ub4dc \ud638\ucd9c
        # \ube44\ub3d9\uae30\uac00 \uc544\ub2cc \ub3d9\uae30 \uba54\uc11c\ub4dc\ub77c\uba74 \uc2a4\ub808\ub4dc \ud480\uc5d0\uc11c \uc2e4\ud589\ud558\uac70\ub098 asyncio.to_thread \uc0ac\uc6a9\uc744 \uace0\ub824
        # pipeline.py\uc5d0 run_async\uac00 \uc5c6\uc73c\ubbc0\ub85c \ub3d9\uae30\ub85c \uc2e4\ud589 (\ub610\ub294 \ud544\uc694\uc2dc \uc218\uc815)
        import asyncio
        claims = await asyncio.to_thread(pipeline.run, request.text)
        
        return ClaimExtractionResponse(claims=claims)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
