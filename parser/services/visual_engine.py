import os
import cv2
import base64
import requests
from typing import List, Dict
from fastapi import HTTPException
import yt_dlp
from collections import OrderedDict
import logging

logger = logging.getLogger("VisualEngine")

def _model_candidates() -> List[str]:
    # Prefer explicit OCR model, then shared model used by llm_engine, then safe fallbacks.
    raw = [
        os.getenv("GMS_OCR_MODEL"),
        os.getenv("GMS_MODEL"),
        "gpt-4o",
        "gpt-4o-mini",
    ]
    seen = set()
    out: List[str] = []
    for m in raw:
        if not m:
            continue
        m = str(m).strip()
        if not m or m in seen:
            continue
        seen.add(m)
        out.append(m)
    return out or ["gpt-4o"]


def _filter_ocr_texts(texts: List[str]) -> List[str]:
    """
    Best-effort cleanup for OCR outputs.

    Sometimes the multimodal model returns refusal/meta messages (e.g. "I can't assist...")
    instead of OCR text. Filter those out so they don't pollute downstream analysis.
    """
    bad_substrings = [
        "i'm sorry",
        "im sorry",
        "i cannot",
        "i can't",
        "i cant",
        "can't assist",
        "cannot assist",
        "can't extract",
        "cannot extract",
        "can't help",
        "cannot help",
        "죄송",
        "도와드릴 수",
        "도와드릴수",
        "추출할 수 없",
        "extract text",
    ]
    out: List[str] = []
    for t in texts or []:
        s = (t or "").strip()
        if not s:
            continue
        low = s.lower()
        if any(b in low for b in bad_substrings):
            continue
        out.append(s)
    return out

def extract_frames_from_stream(url: str, interval_sec: int = 20) -> List[Dict]:
    """스트리밍 URL에서 일정 간격으로 프레임을 추출합니다."""
    # 300p로 약간 높여 OCR 정확도 확보
    ydl_opts = {
        'format': 'bestvideo[height<=300][ext=mp4]/best[height<=300]',
        'quiet': True,
        'no_warnings': True
    }
    
    frames = []
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get('url')
            duration = info.get('duration', 0)
            
            if not stream_url:
                return []
                
            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                return []
            
            # 5초부터 시작
            for t in range(5, int(duration), interval_sec):
                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
                success, frame = cap.read()
                if success:
                    # 품질 60으로 약간 상향
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 60]
                    _, buffer = cv2.imencode('.jpg', frame, encode_param)
                    base64_str = base64.b64encode(buffer).decode('utf-8')
                    frames.append({
                        "timestamp": t,
                        "image": base64_str
                    })
            
            cap.release()
    except Exception:
        pass
        
    return frames

def analyze_visual_content(video_url: str, interval_sec: int = 30) -> List[Dict]:
    """영상 스트림에서 시각 정보를 추출하여 GPT-4o로 분석합니다."""
    gms_key = os.getenv("GMS_KEY")
    if not gms_key:
        return []

    # 1. 프레임 추출 (스트리밍 방식)
    frames_data = extract_frames_from_stream(video_url, interval_sec=interval_sec)
    
    if not frames_data:
        return []

    visual_segments = []
    url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {gms_key}",
        "Content-Type": "application/json"
    }
    
    # 2. GPT-4o 멀티모달 분석
    model_candidates = _model_candidates()
    for frame in frames_data:
        try:
            # 문장은 유지하되 별개의 정보 블록만 구분하도록 프롬프트 수정
            payload = OrderedDict([
                ("model", model_candidates[0]),
                ("messages", [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text", 
                                "text": "이 영상 프레임에서 추출할 수 있는 모든 텍스트를 의미 있는 문장이나 독립적인 정보 단위(자막 블록 등)별로 구분해서 쉼표로 분리된 리스트 형태로 출력해줘. 하나의 완성된 문장은 억지로 쪼개지 말고 그대로 유지하되, 화면상의 위치가 다르거나 별개의 정보인 경우에만 쉼표로 구분해줘. 부연 설명이나 목록 형식은 절대 사용하지 말고 정보만 나열해줘. 한국어로 답변해줘."
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{frame['image']}"}
                            }
                        ]
                    }
                ]),
                ("max_tokens", 500)
            ])
            
            resp = None
            for model in model_candidates:
                payload["model"] = model
                resp = requests.post(url, headers=headers, json=payload, timeout=30)
                if resp.status_code == 200:
                    break
                logger.warning("Visual analyze failed: model=%s http_status=%s", model, resp.status_code)

            if resp is not None and resp.status_code == 200:
                raw_analysis = resp.json()["choices"][0]["message"]["content"]
                text_list = [item.strip() for item in raw_analysis.split(",") if item.strip()]

                visual_segments.append({
                    "start_time": float(frame["timestamp"]),
                    "text": text_list
                })
        except Exception:
            continue
            
    return visual_segments


def ocr_image_base64(image_base64: str) -> List[str]:
    """
    OCR a single frame image (base64 JPEG) using GPT-4o-mini via SSAFY GMS.

    Returns a list of extracted text snippets. If GMS_KEY is missing or call fails, returns [].
    """
    gms_key = os.getenv("GMS_KEY")
    if not gms_key:
        logger.warning("OCR skipped: GMS_KEY is missing")
        return []

    url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {gms_key}",
        "Content-Type": "application/json",
    }

    prompt = (
        "Extract all readable on-screen text from the image. "
        "Return as a comma-separated list of short text chunks. "
        "Do not add explanations or extra formatting."
    )

    model_candidates = _model_candidates()
    payload = OrderedDict([
        ("model", model_candidates[0]),
        ("messages", [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}},
                ],
            }
        ]),
        ("max_tokens", 400),
    ])

    try:
        response = None
        for model in model_candidates:
            payload["model"] = model
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                break
            body_preview = ""
            try:
                body_preview = (response.text or "")[:300].replace("\n", " ")
            except Exception:
                body_preview = ""
            logger.warning("OCR failed: model=%s http_status=%s body_preview='%s'", model, response.status_code, body_preview)

        if response is None or response.status_code != 200:
            return []

        raw = response.json()["choices"][0]["message"]["content"]
        texts = [item.strip() for item in raw.split(",") if item.strip()]
        texts = _filter_ocr_texts(texts)
        logger.info(
            "OCR ok: model=%s items=%s preview='%s'",
            payload["model"],
            len(texts),
            " | ".join(texts)[:300].replace("\n", " "),
        )
        return texts
    except Exception as e:
        logger.warning("OCR exception: %s", e, exc_info=True)
        return []
