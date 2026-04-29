from typing import Optional, Dict, Any
from pydantic import BaseModel

class AnalysisRequestedPayload(BaseModel):
    jobId: str
    youtubeUrl: str
    transcriptArtifactKey: str

class AnalysisFailedPayload(BaseModel):
    jobId: str
    errorCode: str = "ANALYSIS_FAILED"
    message: str

class EventEnvelope(BaseModel):
    eventId: str
    eventType: str
    eventVersion: int = 1
    occurredAt: str
    traceId: Optional[str] = None
    aggregateId: str
    payload: Dict[str, Any]
