import re

FILLER_WORDS = [
    "어", "음", "그", "저", "아", "휴", "그러니까", "말하자면",
    "아이고", "아이쿠", "아이구", "그니까", "에", "막", "이제", "진짜"
]

SPACING_MODEL = None

def get_spacing_model():
    global SPACING_MODEL
    if SPACING_MODEL is None:
        try:
            from pykospacing import Spacing
            SPACING_MODEL = Spacing()
        except ImportError:
            pass
    return SPACING_MODEL

def clean_transcript_text(text: str) -> str:
    """
    Cleans the transcript text logic for AI processing.
    """
    text = re.sub(r'\[.*?\]|\(.*?\)', ' ', text)
    for filler in FILLER_WORDS:
        text = re.sub(rf'\b{filler}\b', ' ', text)
    text = re.sub(r'([ㄱ-ㅎㅏ-ㅣ])\1+', r'\1', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    # 문맥 기반 띄어쓰기 복구
    spacing = get_spacing_model()
    if spacing:
        try:
            text = spacing(text)
        except Exception:
            pass
            
    return text
