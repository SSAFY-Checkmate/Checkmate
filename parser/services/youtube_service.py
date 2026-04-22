import re
import requests
from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

from core.text_processor import clean_transcript_text
from services.stt_engine import run_stt_fallback

def extract_video_id(url: str) -> str:
    if len(url) == 11 and re.match(r"^[0-9A-Za-z_-]{11}$", url):
        return url
    match = re.search(r"(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    if match:
        return match.group(1)
    raise HTTPException(status_code=422, detail="잘못된 유튜브 URL 형식입니다.")

def fetch_and_clean_transcript(video_id: str) -> dict:
    try:
        title = None
        author = None
        try:
            oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
            meta_res = requests.get(oembed_url, timeout=5)
            if meta_res.status_code == 200:
                data = meta_res.json()
                title = data.get("title")
                author = data.get("author_name")
        except Exception:
            pass
            
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)
        
        transcript = None
        lang_used = None

        try:
            transcript = transcript_list.find_transcript(['ko'])
            lang_used = 'ko'
        except NoTranscriptFound:
            for t in transcript_list:
                if t.language_code == 'ko' and t.is_generated:
                    transcript = t
                    lang_used = 'ko-auto'
                    break
            if not transcript:
                try:
                    transcript = transcript_list.find_transcript(['en'])
                    lang_used = 'en'
                except NoTranscriptFound:
                    raise NoTranscriptFound(video_id)
        
        transcript_data = transcript.fetch()
        raw_text = " ".join([segment.text for segment in transcript_data])
        cleaned_text = clean_transcript_text(raw_text)
        
        return {
            "video_id": video_id,
            "title": title,
            "author": author,
            "language": lang_used,
            "content": cleaned_text,
            "is_whisper": False,
            "status": "SUCCESS"
        }

    except (TranscriptsDisabled, NoTranscriptFound):
        return run_stt_fallback(video_id, title, author)
        
    except VideoUnavailable:
        raise HTTPException(status_code=422, detail=f"비디오가 삭제되었거나 비공개입니다. ID: {video_id}")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
