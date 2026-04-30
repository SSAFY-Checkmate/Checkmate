from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class Segment(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    start_time: float
    text: str

class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
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
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    start_time: float
    violation_sentence: str
    reason: str

class AnalyzeData(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    video_id: str
    video_title: Optional[str] = None
    channel_name: Optional[str] = None
    channel_id: Optional[str] = None
    trust_grade: str
    confidence_score: int
    summary: str
    violations: Optional[List[Violation]] = None
    elapsed_ms: Optional[int] = None

class AnalyzeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    status: int
    message: str
    data: Optional[AnalyzeData] = None
