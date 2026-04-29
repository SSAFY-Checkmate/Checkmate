import re
from services.analysis.schemas import AnalyzeRequest

def clean_text(text: str) -> str:
    # 1. 괄호 안의 효과음/잡음 제거 (예: (웃음), [박수 소리])
    text = re.sub(r'[\(\[].*?[\)\]]', '', text)
    
    # 2. 대표적인 유튜브 추임새 제거 (문장 중간에 낀 불필요한 단어들)
    filler_words = [r'\b어\b', r'\b음\b', r'\b그\b', r'\b아\b', r'\b저기\b', r'\b막\b', r'\b약간\b', r'\b진짜\b', r'\b이제\b', r'\b그니까\b']
    for filler in filler_words:
        text = re.sub(filler, '', text)
        
    # 3. 여러 개의 공백을 하나로 압축 및 양옆 공백 제거
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def preprocess_sentences_step(state: dict) -> dict:
    """Step 2: Sentence Preprocessing (Rule-based noise removal)"""
    segments = state.get("segments", [])
    
    cleaned_segments = []
    cleaned_content_parts = []
    
    if segments:
        for seg in segments:
            original_text = seg.get("text", "")
            start_time = seg.get("start_time", 0.0)
            processed = clean_text(original_text)
            
            # 필터링 후 텍스트가 의미 있게 남아있는 경우에만 리스트에 담기
            if len(processed) > 1:
                cleaned_segments.append({
                    "start_time": start_time,
                    "text": processed
                })
                cleaned_content_parts.append(processed)
                
    else:
        # 만약 segments 배열이 비어있다면, 전체 텍스트를 기준으로 한번에 정제
        raw_text = state.get("text", "")
        cleaned_content_parts.append(clean_text(raw_text))
    
    # 전처리된 세그먼트들을 하나의 문자열로 결합 (이후 요약 봇에게 전달될 텍스트)
    cleaned_content = " ".join(cleaned_content_parts)
    
    # 다음 스텝들을 위해 state에 결과 저장
    state["cleaned_segments"] = cleaned_segments
    state["cleaned_content"] = cleaned_content
    
    return state
