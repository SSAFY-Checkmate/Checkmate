from typing import Optional, List
from pydantic import BaseModel

class TranscriptRequest(BaseModel):
    url: str  # 유튜브 링크 또는 직접 영상 ID를 입력해도 됩니다

class FrameRequest(BaseModel):
    url: str
    timestamp: str  # "90"(초 단위) 또는 "01:30"(분:초 단위) 모두 입력 가능

class FrameResponse(BaseModel):
    video_id: str
    title: Optional[str] = None
    author: Optional[str] = None
    image_base64: str
    status: str
    processing_time: Optional[float] = None

class SegmentSchema(BaseModel):
    start_time: float
    text: str

class TranscriptResponse(BaseModel):
    video_id: str
    title: Optional[str] = None
    author: Optional[str] = None
    channel_id: Optional[str] = None
    language: str
    content: str
    segments: List[SegmentSchema] = []
    status: str
    is_whisper: bool
    processing_time: Optional[float] = None

class AnalysisRequest(BaseModel):
    video_id: str
    title: Optional[str] = None
    author: Optional[str] = None
    channel_id: Optional[str] = None
    language: Optional[str] = None
    content: str

class YouTubeInfoSchema(BaseModel):
    channelId: Optional[str] = None
    channelName: Optional[str] = None
    videoId: Optional[str] = None
    videoTitle: Optional[str] = None

class AnalysisResultSchema(BaseModel):
    trustGrade: str
    confidenceScore: int
    summary: str
    modelVersion: str

class ViolationSchema(BaseModel):
    startTime: Optional[int] = None
    violationSentence: str
    reason: str

class AnalysisResponse(BaseModel):
    youtubeInfo: YouTubeInfoSchema
    analysisResult: AnalysisResultSchema
    violations: List[ViolationSchema]

class VisualAnalysisRequest(BaseModel):
    url: str

class VisualSegmentSchema(BaseModel):
    start_time: float
    text: List[str]

class VisualAnalysisResponse(BaseModel):
    video_id: str
    visual_segments: List[VisualSegmentSchema]
    status: str
    processing_time: Optional[float] = None
