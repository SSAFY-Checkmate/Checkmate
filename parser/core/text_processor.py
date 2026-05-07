import re

# 흔히 쓰이는 추임새 및 무의미한 감탄사 추가
FILLER_WORDS = [
    "어", "음", "그", "저", "아", "휴", "그러니까", "말하자면",
    "아이고", "아이쿠", "아이구", "그니까", "에", "막", "이제", "진짜",
    "대박", "와", "진짜로", "헐", "우와"
]

# 구독, 좋아요, 알림 설정, 시청 독려 등 CTA(Call To Action) 문구 정규식 패턴
CTA_PATTERNS = [
    r"구독과?\s*좋아요",
    r"알림\s*설정",
    r"여러분\s*보세요",
    r"구독\s*부탁",
    r"좋아요\s*부탁",
    r"채널\s*고정",
    r"끝까지\s*시청"
]

SPACING_MODEL = None
KIWI_MODEL = None

def get_spacing_model():
    global SPACING_MODEL
    if SPACING_MODEL is None:
        try:
            from pykospacing import Spacing
            SPACING_MODEL = Spacing()
        except ImportError:
            pass
    return SPACING_MODEL

def get_kiwi_model():
    global KIWI_MODEL
    if KIWI_MODEL is None:
        try:
            from kiwipiepy import Kiwi
            KIWI_MODEL = Kiwi()
        except ImportError:
            pass
    return KIWI_MODEL

def clean_transcript_text(text: str, split_sentences: bool = True) -> str:
    """
    Cleans the transcript text logic for AI processing.
    """
    # 1. 태그 및 괄호(예: [음악], (웃음)) 제거
    text = re.sub(r'\[.*?\]|\(.*?\)', ' ', text)
    
    # 2. 유튜버 단골 CTA 문구 및 과장 표현 제거
    for pattern in CTA_PATTERNS:
        text = re.sub(pattern, ' ', text)
        
    # 3. 감탄사 및 추임새 제거
    for filler in FILLER_WORDS:
        text = re.sub(rf'\b{filler}\b', ' ', text)
        
    # 4. 반복되는 자음/모음(ㅋㅋ, ㅎㅎ 등) 단일화 또는 제거
    text = re.sub(r'([ㄱ-ㅎㅏ-ㅣ])\1+', r'\1', text)
    
    # 5. 불필요한 다중 공백 제거
    text = re.sub(r'\s+', ' ', text).strip()
    
    # 6. 문맥 기반 띄어쓰기 복구
    spacing = get_spacing_model()
    if spacing:
        try:
            text = spacing(text)
        except Exception:
            pass
            
    # 7. Kiwi를 이용한 빠르고 정확한 문장 단위 분리 및 재결합
    if split_sentences:
        kiwi = get_kiwi_model()
        if kiwi:
            try:
                sentences = kiwi.split_into_sents(text)
                if sentences:
                    text = "\n".join([s.text for s in sentences])
            except Exception:
                pass
        
    return text

def process_and_merge_segments(raw_segments: list) -> list:
    """
    Takes a list of raw segments `[{"start_time": float, "text": str}]`, 
    cleans the text, concatenates them, and splits them into properly 
    formed sentences using Kiwi, mapping the start times correctly.
    """
    kiwi = get_kiwi_model()
    if not kiwi:
        cleaned_segments = []
        for seg in raw_segments:
            c_text = clean_transcript_text(seg["text"], split_sentences=False).strip()
            if c_text:
                cleaned_segments.append({
                    "start_time": seg["start_time"],
                    "text": c_text
                })
        return cleaned_segments

    char_to_time = []
    full_text = ""

    for seg in raw_segments:
        c_text = clean_transcript_text(seg["text"], split_sentences=False).strip()
        if not c_text:
            continue
            
        start_char_idx = len(full_text)
        
        if full_text:
            full_text += " "
            start_char_idx += 1
            
        full_text += c_text
        char_to_time.append((start_char_idx, seg["start_time"]))

    if not full_text:
        return []

    try:
        sentences = kiwi.split_into_sents(full_text)
    except Exception:
        return [{"start_time": 0.0, "text": full_text}]

    merged_segments = []
    for s in sentences:
        sentence_start_idx = s.start
        
        start_time = 0.0
        for idx, t in reversed(char_to_time):
            if sentence_start_idx >= idx:
                start_time = t
                break
                
        merged_segments.append({
            "start_time": start_time,
            "text": s.text.strip()
        })

    return merged_segments
