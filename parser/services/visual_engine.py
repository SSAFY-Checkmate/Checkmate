import os
import cv2
import base64
import requests
from typing import List, Dict
from fastapi import HTTPException
import yt_dlp

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
    from collections import OrderedDict
    for frame in frames_data:
        try:
            # 문장은 유지하되 별개의 정보 블록만 구분하도록 프롬프트 수정
            payload = OrderedDict([
                ("model", "gpt-4o-mini"),
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
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                raw_analysis = response.json()["choices"][0]["message"]["content"]
                # 쉼표로 구분된 텍스트를 리스트로 변환 및 정제
                text_list = [item.strip() for item in raw_analysis.split(",") if item.strip()]
                
                visual_segments.append({
                    "start_time": float(frame["timestamp"]),
                    "text": text_list
                })
        except Exception:
            continue
            
    return visual_segments
