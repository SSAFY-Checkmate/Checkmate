import os
import tempfile
from typing import Optional
from fastapi import HTTPException
from core.text_processor import clean_transcript_text

STT_MODEL = None

def get_stt_model():
    global STT_MODEL
    if STT_MODEL is None:
        from faster_whisper import WhisperModel
        # CTranslate2 기반 faster-whisper 사용 (메모리 점유율 최소화)
        STT_MODEL = WhisperModel("base", device="cpu", compute_type="int8")
    return STT_MODEL

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
                
            model = get_stt_model()
            segments, info = model.transcribe(audio_path, beam_size=5)
            raw_text = " ".join([segment.text for segment in segments])
            
            cleaned_text = clean_transcript_text(raw_text)
            
            return {
                "video_id": video_id,
                "title": title,
                "author": author,
                "language": "stt-auto",
                "content": cleaned_text,
                "status": "SUCCESS"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"STT 변환 실패 및 자막 없음: {str(e)}")
