import base64

import cv2
import yt_dlp
from fastapi import HTTPException


def parse_timestamp(ts: str) -> float:
    parts = ts.split(":")
    try:
        if len(parts) == 1:
            return float(parts[0])
        if len(parts) == 2:
            return float(parts[0]) * 60 + float(parts[1])
        if len(parts) == 3:
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    except ValueError:
        pass
    raise Exception("Invalid timestamp format. Use seconds or mm:ss")


def extract_frame_base64(url: str, timestamp_str: str) -> dict:
    timestamp_sec = parse_timestamp(timestamp_str)

    ydl_opts = {
        "format": "bestvideo[ext=mp4]/best",
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get("url")

            if not stream_url:
                raise Exception("Failed to find stream URL.")

            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                raise Exception("Failed to open video stream.")

            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
            success, frame = cap.read()
            cap.release()

            if not success:
                raise Exception("Failed to read frame at the given timestamp.")

            ret, buffer = cv2.imencode(".jpg", frame)
            if not ret:
                raise Exception("Failed to encode image.")

            base64_str = base64.b64encode(buffer).decode("utf-8")
            return {
                "video_id": info.get("id", ""),
                "title": info.get("title"),
                "author": info.get("uploader"),
                "image_base64": base64_str,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame extract failed: {str(e)}")


def extract_frame_base64_ocr(url: str, timestamp_str: str, max_height: int = 300, jpeg_quality: int = 60) -> dict:
    """
    Extract a frame optimized for OCR payload size.

    - Prefer a low resolution stream (<= max_height)
    - Downscale frame if needed
    - Encode JPEG with lower quality
    """
    timestamp_sec = parse_timestamp(timestamp_str)

    ydl_opts = {
        "format": f"bestvideo[height<={max_height}][ext=mp4]/best[height<={max_height}]",
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get("url")

            if not stream_url:
                raise Exception("Failed to find stream URL.")

            cap = cv2.VideoCapture(stream_url)
            if not cap.isOpened():
                raise Exception("Failed to open video stream.")

            cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_sec * 1000)
            success, frame = cap.read()
            cap.release()

            if not success:
                raise Exception("Failed to read frame at the given timestamp.")

            h, w = frame.shape[:2]
            if max_height and h > max_height:
                new_w = int(w * (max_height / float(h)))
                frame = cv2.resize(frame, (new_w, max_height), interpolation=cv2.INTER_AREA)

            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), int(jpeg_quality)]
            ret, buffer = cv2.imencode(".jpg", frame, encode_param)
            if not ret:
                raise Exception("Failed to encode image.")

            base64_str = base64.b64encode(buffer).decode("utf-8")
            return {
                "video_id": info.get("id", ""),
                "title": info.get("title"),
                "author": info.get("uploader"),
                "image_base64": base64_str,
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame extract(OCR) failed: {str(e)}")

