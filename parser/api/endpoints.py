import time
import asyncio
from fastapi import APIRouter
from api.schemas import (
    TranscriptRequest, TranscriptResponse, 
    FrameRequest, FrameResponse, 
    AnalysisRequest, AnalysisResponse,
    VisualAnalysisRequest, VisualAnalysisResponse
)
from services.llm_engine import analyze_transcript_with_llm
from services.youtube_service import extract_video_id, fetch_and_clean_transcript
from services.visual_engine import analyze_visual_content

router = APIRouter()

@router.post("/extract-transcript", response_model=TranscriptResponse)
async def extract_transcript(request: TranscriptRequest):
    """
    FastAPI endpoint to receive Spring Boot's request, fetch YouTube subtitles,
    process the text, and return clean content ready for AI analysis.
    """
    start_time = time.time()
    
    # 터미널에 들어온 요청 JSON 출력
    import json
    print("\n" + "="*50)
    print(f"[Extract API] 요청 수신 URL: {request.url}")
    print("="*50)
    
    video_id = extract_video_id(request.url)
    result = await asyncio.to_thread(fetch_and_clean_transcript, video_id)
    
    end_time = time.time()
    result["processing_time"] = round(end_time - start_time, 2)
    
    return result

@router.post("/extract-visual-analysis", response_model=VisualAnalysisResponse)
async def extract_visual_analysis(request: VisualAnalysisRequest):
    """
    영상 시각 정보(OCR 및 장면 분석)만 독립적으로 추출하여 반환합니다.
    """
    start_time = time.time()
    
    video_id = extract_video_id(request.url)
    
    # 별도 스레드에서 시각 분석 실행 (간격 30초 고정)
    visual_segments = await asyncio.to_thread(
        analyze_visual_content, 
        request.url, 
        30
    )
    
    end_time = time.time()
    
    return VisualAnalysisResponse(
        video_id=video_id,
        visual_segments=visual_segments,
        status="SUCCESS",
        processing_time=round(end_time - start_time, 2)
    )

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


@router.post("/analyze-transcript", response_model=AnalysisResponse)
async def analyze_transcript(request: AnalysisRequest):
    """
    전달받은 파싱 데이터를 기반으로 영상 신뢰도를 분석하고 결과를 반환합니다.
    """
    start_time = time.time()
    
    # dict 형태로 변환
    parsed_data = request.model_dump()
    
    # 터미널에 들어온 분석 요청 JSON 출력
    import json
    print("\n" + "="*50)
    print(f"[Analyze API] 분석 요청 수신 (video_id: {request.video_id})")
    print(json.dumps(parsed_data, indent=2, ensure_ascii=False)[:500] + "\n... (생략) ...") 
    print("="*50)

    # LLM 서비스로 전달
    result = await asyncio.to_thread(analyze_transcript_with_llm, parsed_data)
    
    end_time = time.time()
    
    print("\n" + "="*50)
    print(f"[Analyze API] 분석 결과 반환 (video_id: {request.video_id}, 소요시간: {round(end_time - start_time, 2)}s)")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("="*50 + "\n")
    
    return result
