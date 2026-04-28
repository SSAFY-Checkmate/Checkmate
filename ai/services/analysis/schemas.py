from pydantic import BaseModel
from typing import List, Optional

class Segment(BaseModel):
    start_time: float
    text: str

class AnalyzeRequest(BaseModel):
    video_id: str
    title: str
    author: str
    channel_id: str
    language: str
    content: str
    segments: List[Segment]
    status: str
    is_whisper: bool
    processing_time: float

class Violation(BaseModel):
    start_time: float
    violation_sentence: str
    reason: str

class AnalyzeResponseData(BaseModel):
    video_id: str
    video_title: str
    channel_name: str
    trust_grade: str
    confidence_score: int
    summary: str
    violations: List[Violation]

class AnalyzeResponse(BaseModel):
    status: int
    message: str
    data: AnalyzeResponseData
