from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Segment(BaseModel):
    start_time: float
    text: str

class AnalyzeRequest(BaseModel):
    video_id: str
    title: Optional[str] = None
    author: Optional[str] = None
    channel_id: Optional[str] = None
    language: str
    content: str
    segments: Optional[List[Segment]] = None
    status: str
    is_whisper: bool
    processing_time: Optional[float] = None

class Violation(BaseModel):
    start_time: float
    violation_sentence: str
    reason: str

class AnalyzeData(BaseModel):
    video_id: str
    video_title: Optional[str] = None
    channel_name: Optional[str] = None
    trust_grade: str
    confidence_score: int
    summary: str
    violations: Optional[List[Violation]] = None

class AnalyzeResponse(BaseModel):
    status: int
    message: str
    data: Optional[AnalyzeData] = None
