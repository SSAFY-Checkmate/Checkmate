import cv2
import yt_dlp
from fastapi import HTTPException

def parse_timestamp(ts: str) -> float:
    parts = ts.split(":")
    try:
        if len(parts) == 1:
            return float(parts[0])
        elif len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    except ValueError:
        pass
    raise Exception("잘못된 타임스탬프 형식입니다. '초' 또는 '분:초' 형식으로 입력하세요.")

def extract_frame_bytes(url: str, timestamp_str: str) -> bytes:
    timestamp_sec = parse_timestamp(timestamp_str)
    
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get('url')
            
            if not stream_url:
                raise Exception("스트리밍 URL을 찾을 수 없습니다.")
                
            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                raise Exception("비디오 스트림을 열 수 없습니다.")
                
            # 밀리초(ms) 단위로 타임스탬프 설정
            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
            
            success, frame = cap.read()
            cap.release()
            
            if not success:
                raise Exception("해당 타임스탬프에서 프레임을 읽어오지 못했습니다.")
                
            # 이미지를 JPEG 포맷으로 인코딩
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                raise Exception("이미지 인코딩에 실패했습니다.")
                
            return buffer.tobytes()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프레임 추출 실패: {str(e)}")
