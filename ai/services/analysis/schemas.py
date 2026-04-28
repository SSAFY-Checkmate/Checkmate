from pydantic import BaseModel
from typing import List, Dict, Any

class AnalyzeRequest(BaseModel):
    video_title: str
    text: str

class AnalyzeResponse(BaseModel):
    summary: str
    fact_check_results: List[Dict[str, Any]]
