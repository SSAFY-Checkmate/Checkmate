import time
import asyncio
from fastapi import APIRouter
from api.schemas import TranscriptRequest, TranscriptResponse, FrameRequest, FrameResponse
from services.youtube_service import extract_video_id, fetch_and_clean_transcript

router = APIRouter()

@router.post("/extract-transcript", response_model=TranscriptResponse)
async def extract_transcript(request: TranscriptRequest):
    """
    FastAPI endpoint to receive Spring Boot's request, fetch YouTube subtitles,
    process the text, and return clean content ready for AI analysis.
    """
    start_time = time.time()
    
    video_id = extract_video_id(request.url)
    result = await asyncio.to_thread(fetch_and_clean_transcript, video_id)
    
    end_time = time.time()
    result["processing_time"] = round(end_time - start_time, 2)
    
    return result

@router.post("/extract-frame", response_model=FrameResponse)
async def extract_frame(request: FrameRequest):
    """
    지정된 타임스탬프(초)의 유튜브 영상 프레임을 추출하여 Base64 JSON 형식으로 반환합니다.
    """
    from services.image_extractor import extract_frame_base64
    
    start_time = time.time()
    
    result = await asyncio.to_thread(extract_frame_base64, request.url, request.timestamp)
    
    end_time = time.time()
    
    result["status"] = "SUCCESS"
    result["processing_time"] = round(end_time - start_time, 2)
    
    return result
