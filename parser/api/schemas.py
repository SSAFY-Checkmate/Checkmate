from typing import Optional, List

from pydantic import BaseModel


class TranscriptRequest(BaseModel):
    url: str  # YouTube link or direct video id

    # Optional time slicing controls (seconds).
    # When omitted, parser returns the full transcript.
    start_seconds: Optional[float] = None
    end_seconds: Optional[float] = None
    at_seconds: Optional[float] = None
    window_seconds: Optional[float] = None


class FrameRequest(BaseModel):
    url: str
    timestamp: str  # "90"(seconds) or "01:30"(mm:ss)


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
