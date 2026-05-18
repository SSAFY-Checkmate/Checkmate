from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from services.claimify.llm_client import LLMClient
from services.claimify.pipeline import ClaimifyPipeline
from services.analysis.pipeline import AnalysisPipelineService
from services.analysis.oneshot_parser import OneShotAnalysisService
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter()

class ClaimExtractionRequest(BaseModel):
    text: str
    video_title: str = "Unknown Video"

class ClaimExtractionResponse(BaseModel):
    claims: List[str]

@router.post("/extract", response_model=ClaimExtractionResponse)
async def extract_claims_endpoint(request: ClaimExtractionRequest):
    try:
        llm_client = LLMClient()
        pipeline = ClaimifyPipeline(llm_client, request.video_title)
        
        import asyncio
        claims = await asyncio.to_thread(pipeline.run, request.text)
        
        return ClaimExtractionResponse(claims=claims)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/ver1", response_model=AnalyzeResponse)
async def analyze_run_endpoint(request: AnalyzeRequest):
    try:
        pipeline_service = AnalysisPipelineService()
        result = await pipeline_service.run(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/run", response_model=AnalyzeResponse)
async def analyze_oneshot_endpoint(request: AnalyzeRequest):
    try:
        pipeline_service = OneShotAnalysisService()
        result = await pipeline_service.run(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
