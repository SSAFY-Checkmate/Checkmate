import json
from pydantic import BaseModel, Field
from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

class FactualSegment(BaseModel):
    start_time: float = Field(description="세그먼트의 원본 시작 시간 (start_time)")
    text: str = Field(description="추출된 객관적 사실(Factual) 문장 또는 주장")

class FactualSegmentsResponse(BaseModel):
    factual_segments: List[FactualSegment] = Field(description="객관적 사실이나 명확한 주장을 포함하는 세그먼트 목록")

async def text_cleansing_step(state: dict) -> dict:
    """Step 4: Text Cleansing (LLM을 이용한 의미론적 팩트 문장 필터링)"""
    cleaned_segments = state.get("cleaned_segments", [])
    
    if not cleaned_segments:
        state["factual_segments"] = []
        return state

    # LangChain LLM 초기화 및 Structured Output 활성화
    from core.config import settings
    llm = ChatOpenAI(
        api_key=settings.gms_key,
        base_url="https://gms.ssafy.io/gmsapi/api.openai.com/v1",
        model="gpt-4o-mini", 
        temperature=0.0
    )
    structured_llm = llm.with_structured_output(FactualSegmentsResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "당신은 팩트체크를 위한 자막 필터링 전문가입니다. "
         "제공된 자막 세그먼트들 중에서 '주관적 감상', '단순 인사말', '감탄사', '농담' 등을 모두 제거하고, "
         "참/거짓을 판별할 수 있는 **'객관적 사실(Factual)'** 혹은 **'명확한 주장'**을 담고 있는 세그먼트만 골라내세요. "
         "해당하는 세그먼트의 start_time과 text를 원본 그대로 추출하여 응답해야 합니다."),
        ("user", "다음 세그먼트 목록에서 객관적 사실 문장만 필터링해 주세요:\n\n{segments_json}")
    ])
    
    chain = prompt | structured_llm
    
    # 딕셔너리 리스트를 JSON 문자열로 변환
    segments_json = json.dumps(cleaned_segments, ensure_ascii=False, indent=2)
    
    try:
        # 비동기로 LLM 호출
        response: FactualSegmentsResponse = await chain.ainvoke({"segments_json": segments_json})
        
        # Pydantic 객체를 딕셔너리로 변환하여 state에 저장
        state["factual_segments"] = [seg.model_dump() for seg in response.factual_segments]
        
        print(f"\n[Step 4: Cleansing Completed]")
        print(f"-> Filtered {len(cleaned_segments)} segments down to {len(state['factual_segments'])} factual segments.")
        for seg in state["factual_segments"]:
            print(f"   - [{seg['start_time']}s] {seg['text']}")
    except Exception as e:
        print(f"[Cleansing Error] {e}")
        # LLM 에러 발생 시 파이프라인 중단을 막기 위해 원본 전처리 데이터를 그대로 넘김
        state["factual_segments"] = cleaned_segments
        
    return state
