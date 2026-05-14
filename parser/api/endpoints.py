import asyncio
import json
import time
from typing import Optional, Tuple

from fastapi import APIRouter, HTTPException

from api.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    FrameRequest,
    FrameResponse,
    TranscriptRequest,
    TranscriptResponse,
    VisualAnalysisRequest,
    VisualAnalysisResponse,
)
from services.llm_engine import analyze_transcript_with_llm
from services.visual_engine import analyze_visual_content, ocr_image_base64
from services.youtube_service import extract_video_id, fetch_and_clean_transcript

router = APIRouter()


def _validate_time_slicing(request: TranscriptRequest) -> Tuple[Optional[float], Optional[float]]:
    """
    Returns (start_seconds, end_seconds) if slicing is requested, otherwise (None, None).

    Priority:
    1) start_seconds + end_seconds (range)
    2) at_seconds (+ window_seconds, default 30s)
    """
    start = request.start_seconds
    end = request.end_seconds
    at = request.at_seconds
    window = request.window_seconds

    has_range = start is not None or end is not None
    if has_range:
        if start is None or end is None:
            raise ValueError("Both start_seconds and end_seconds must be provided for range slicing.")
        if start < 0 or end < 0:
            raise ValueError("start_seconds/end_seconds must be >= 0.")
        if end < start:
            raise ValueError("end_seconds must be >= start_seconds.")
        return float(start), float(end)

    if at is not None:
        if at < 0:
            raise ValueError("at_seconds must be >= 0.")
        if window is None:
            window = 30.0
        if window <= 0:
            raise ValueError("window_seconds must be > 0.")
        return float(at), float(at + window)

    if window is not None:
        raise ValueError("window_seconds requires at_seconds.")

    return None, None


def _slice_transcript_result(result: dict, start_seconds: float, end_seconds: float) -> dict:
    segments = result.get("segments") or []
    sliced_segments = [
        s
        for s in segments
        if isinstance(s, dict)
        and s.get("start_time") is not None
        and float(s["start_time"]) >= start_seconds
        and float(s["start_time"]) < end_seconds
    ]

    # Keep content consistent with segments for downstream analysis.
    sliced_content = " ".join([s.get("text", "") for s in sliced_segments]).strip()

    out = dict(result)
    out["segments"] = sliced_segments
    out["content"] = sliced_content
    return out


def _pick_nearest_segment(segments: list, at_seconds: float) -> dict | None:
    best = None
    best_dist = float("inf")
    for s in segments or []:
        try:
            st = float(s.get("start_time"))
        except Exception:
            continue
        dist = abs(st - at_seconds)
        if dist < best_dist:
            best = s
            best_dist = dist
    return best


def _unique_preserve_order(items: list[str]) -> list[str]:
    seen = set()
    out: list[str] = []
    for s in items or []:
        s = (s or "").strip()
        if not s:
            continue
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


@router.post("/extract-transcript", response_model=TranscriptResponse)
async def extract_transcript(request: TranscriptRequest):
    """
    Fetch YouTube subtitles, process the text, and return clean content ready for AI analysis.
    Supports optional slicing by:
    - range: start_seconds + end_seconds
    - at: at_seconds (+ window_seconds, default 30s)
    """
    start_time = time.time()

    print("\n" + "=" * 50)
    print(f"[Extract API] request url={request.url}")
    print(
        f"[Extract API] slicing start_seconds={request.start_seconds} end_seconds={request.end_seconds} "
        f"at_seconds={request.at_seconds} window_seconds={request.window_seconds}"
    )
    print("=" * 50)

    video_id = extract_video_id(request.url)
    result = await asyncio.to_thread(fetch_and_clean_transcript, video_id)

    try:
        start_s, end_s = _validate_time_slicing(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if request.at_seconds is not None:
        # Point semantics for AT: nearest single segment + frame OCR (best-effort).
        at_s = float(request.at_seconds)
        seg = _pick_nearest_segment(result.get("segments") or [], at_s)
        if seg is None:
            raise HTTPException(status_code=422, detail=f"No transcript segments available for at_seconds={at_s}")

        seg_text = (seg.get("text") or "").strip()
        ocr_texts: list[str] = []
        try:
            from services.image_extractor import extract_frame_base64_ocr
            for t in (at_s - 1.0, at_s, at_s + 1.0):
                if t < 0:
                    continue
                frame = await asyncio.to_thread(extract_frame_base64_ocr, request.url, str(t))
                image_b64 = frame.get("image_base64")
                if image_b64:
                    texts = await asyncio.to_thread(ocr_image_base64, image_b64)
                    ocr_texts.extend(texts or [])
            ocr_texts = _unique_preserve_order(ocr_texts)
        except Exception:
            ocr_texts = []

        seg_preview = seg_text[:300].replace("\n", " ") if seg_text else ""
        ocr_preview = " | ".join(ocr_texts)[:300].replace("\n", " ") if ocr_texts else ""
        print(f"[Extract API][AT] url={request.url} atSeconds={at_s} segStart={seg.get('start_time')} segTextChars={len(seg_text)} ocrItems={len(ocr_texts)}")
        if seg_preview:
            print(f"[Extract API][AT] segText='{seg_preview}'")
        if ocr_preview:
            print(f"[Extract API][AT] ocrText='{ocr_preview}'")

        combined_parts = []
        if seg_text:
            combined_parts.append(seg_text)
        if ocr_texts:
            combined_parts.append(" ".join(ocr_texts))
        result["segments"] = [seg]
        result["content"] = "\n".join([p for p in combined_parts if p]).strip()

    elif start_s is not None and end_s is not None:
        result = _slice_transcript_result(result, start_s, end_s)

    end_time = time.time()
    result["processing_time"] = round(end_time - start_time, 2)
    return result


@router.post("/extract-visual-analysis", response_model=VisualAnalysisResponse)
async def extract_visual_analysis(request: VisualAnalysisRequest):
    """
    Extract only visual information (OCR / scene text) from the video and return it.
    Interval is fixed to 30 seconds for now.
    """
    start_time = time.time()

    video_id = extract_video_id(request.url)
    visual_segments = await asyncio.to_thread(analyze_visual_content, request.url, 30)

    end_time = time.time()
    return VisualAnalysisResponse(
        video_id=video_id,
        visual_segments=visual_segments,
        status="SUCCESS",
        processing_time=round(end_time - start_time, 2),
    )


@router.post("/extract-frame", response_model=FrameResponse)
async def extract_frame(request: FrameRequest):
    """
    Extract a YouTube frame at the given timestamp and return it as base64 JSON.
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
    Analyze the transcript content with LLM and return structured results.
    """
    start_time = time.time()

    parsed_data = request.model_dump()

    print("\n" + "=" * 50)
    print(f"[Analyze API] request received (video_id={request.video_id})")
    print(json.dumps(parsed_data, indent=2, ensure_ascii=False)[:500] + "\n... (truncated) ...")
    print("=" * 50)

    result = await asyncio.to_thread(analyze_transcript_with_llm, parsed_data)

    end_time = time.time()
    print("\n" + "=" * 50)
    print(f"[Analyze API] response (video_id={request.video_id}, elapsed={round(end_time - start_time, 2)}s)")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("=" * 50 + "\n")

    return result
