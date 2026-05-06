import json
from pydantic import BaseModel, Field
from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

class FactualSegment(BaseModel):
    start_time: float = Field(description="세그먼트의 원본 시작 시간 (start_time)")
    text: str = Field(description="추출된 객관적 사실(Factual) 문장 또는 주장")

class FactualSegmentsResponse(BaseModel):
    thought_process: str = Field(description="각 세그먼트가 왜 검증 가능한 사실인지 평가하고 성찰한 논리적 사고 과정")
    factual_segments: List[FactualSegment] = Field(description="최종 검토를 통과한 객관적 사실 세그먼트 목록")

async def text_cleansing_step(state: dict) -> dict:
    """Step 4: Text Cleansing (LLM을 이용한 의미론적 팩트 문장 필터링)"""
    cleaned_segments = state.get("cleaned_segments", [])
    
    if not cleaned_segments:
        state["factual_segments"] = []
        return state

    # LangChain LLM 초기화 및 Structured Output 활성화
    from core.config import settings
    llm = ChatOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or "https://gms.ssafy.io/gmsapi/api.openai.com/v1",
        model="gpt-4o-mini", 
        temperature=0.0
    )
    structured_llm = llm.with_structured_output(FactualSegmentsResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "당신은 무분별한 정보 속에서 검증 가능한 '사실'만을 추출해내는 수석 팩트체크 데이터 엔지니어입니다.\n\n"
         "[임무]\n"
         "제공된 자막 세그먼트 목록에서 주관적 감상, 단순 인사말, 농담 등을 완벽히 제거하고, 외부 데이터를 통해 참/거짓을 명확히 판별할 수 있는 '객관적 사실(Factual)' 또는 '명확한 주장(Claim)'이 포함된 세그먼트만 추출하세요.\n\n"
         "[분석 및 자기 성찰(Reflexion) 가이드라인]\n"
         "1. 각 세그먼트별로 \"이 문장이 구체적인 수치, 인물, 사건, 명제를 포함하여 외부 증거로 교차 검증이 가능한가?\"를 스스로 묻고 논리적으로 평가하세요.\n"
         "2. 사실과 의견이 혼재되어 있다면, 사실적 주장이 명확히 포함된 경우에만 추출 대상으로 선정하세요.\n"
         "3. 자신이 선택한 세그먼트들이 정말 객관적 기준에 부합하는지 다시 한번 검토(Reflexion)하세요.\n\n"
         "[출력 형식]\n"
         "- 당신의 응답은 JSON 스키마에 맞춰야 합니다.\n"
         "- \"thought_process\" 필드에는 위 1~3단계를 따라 각 세그먼트를 평가한 내용을 통합해서 한국어로 서술하세요.\n"
         "- \"factual_segments\" 필드에는 최종적으로 객관적 사실/명확한 주장이라고 판단한 세그먼트만 포함하세요."),
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
