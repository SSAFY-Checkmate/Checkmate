import os
import tempfile
import requests
from typing import Optional
from fastapi import HTTPException
from core.text_processor import clean_transcript_text

def run_stt_fallback(video_id: str, title: Optional[str], author: Optional[str]) -> dict:
    import yt_dlp
    
    with tempfile.TemporaryDirectory() as temp_dir:
        audio_path = os.path.join(temp_dir, f"{video_id}.m4a")
        
        ydl_opts = {
            'format': 'm4a/bestaudio/best',
            'outtmpl': audio_path,
            'quiet': True,
            'no_warnings': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'm4a',
                'preferredquality': '128',
            }],
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
                
            if not os.path.exists(audio_path):
                raise Exception("오디오 파일이 다운로드되지 않았습니다.")
                
            # SSAFY GMS API 호출 (OpenAI Whisper)
            gms_key = os.getenv("GMS_KEY")
            if not gms_key:
                raise Exception("서버에 GMS_KEY 환경 변수가 설정되어 있지 않습니다.")
                
            url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/audio/transcriptions"
            headers = {
                "Authorization": f"Bearer {gms_key}"
            }
            # 파일과 텍스트 필드를 multipart/form-data로 전송
            # requests가 files 인자를 받으면 Content-Type을 boundary와 함께 자동 설정함
            with open(audio_path, "rb") as audio_file:
                files = {
                    "file": (os.path.basename(audio_path), audio_file, "audio/mp4")
                }
                data = {
                    "model": "whisper-1"
                }
                response = requests.post(url, headers=headers, files=files, data=data)
                
            if response.status_code != 200:
                raise Exception(f"GMS API 호출 실패: {response.status_code} - {response.text}")
                
            result_json = response.json()
            raw_text = result_json.get("text", "")
            
            cleaned_text = clean_transcript_text(raw_text)
            
            return {
                "video_id": video_id,
                "title": title,
                "author": author,
                "language": "stt-auto",
                "content": cleaned_text,
                "is_whisper": True,
                "status": "SUCCESS"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"STT 변환 실패 및 자막 없음: {str(e)}")
