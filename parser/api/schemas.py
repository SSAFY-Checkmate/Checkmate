from typing import Optional
from pydantic import BaseModel

class TranscriptRequest(BaseModel):
    url: str  # 유튜브 링크 또는 직접 영상 ID를 입력해도 됩니다

class TranscriptResponse(BaseModel):
    video_id: str
    title: Optional[str] = None
    author: Optional[str] = None
    language: str
    content: str
    status: str
