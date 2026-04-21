import asyncio
from fastapi import APIRouter
from api.schemas import TranscriptRequest, TranscriptResponse
from services.youtube_service import extract_video_id, fetch_and_clean_transcript

router = APIRouter()

@router.post("/extract-transcript", response_model=TranscriptResponse)
async def extract_transcript(request: TranscriptRequest):
    """
    FastAPI endpoint to receive Spring Boot's request, fetch YouTube subtitles,
    process the text, and return clean content ready for AI analysis.
    """
    video_id = extract_video_id(request.url)
    result = await asyncio.to_thread(fetch_and_clean_transcript, video_id)
    return result
