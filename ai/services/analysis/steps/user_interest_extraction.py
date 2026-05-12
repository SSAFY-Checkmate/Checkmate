import json
import logging
from pydantic import BaseModel, Field
from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings

logger = logging.getLogger(__name__)

class UserInterestSegment(BaseModel):
    start_time: float = Field(description="관련된 자막의 시작 시간 (여러 자막이 합쳐진 경우 가장 첫 자막의 시작 시간)")
    text: str = Field(description="사실관계 확인이 필요하다고 판단되어 추출되거나 조합된 문장")

class UserInterestResponse(BaseModel):
    thought_process: str = Field(description="유튜브 시청자의 관점에서 왜 이 내용들이 사실관계 확인이 필요한지 생각한 이유")
    segments: List[UserInterestSegment] = Field(description="추출 및 조합된 문장 목록")

async def user_interest_extraction_step(state: dict) -> dict:
    """Step 3: 시청자 관점에서 사실관계 확인이 필요한 문장 추출 및 조합"""
    cleaned_segments = state.get("cleaned_segments", [])
    
    if not cleaned_segments:
        state["user_interest_segments"] = []
        return state

    llm = ChatOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or "https://gms.ssafy.io/gmsapi/api.openai.com/v1",
        model="gpt-4o-mini", 
        temperature=0.2
    )
    structured_llm = llm.with_structured_output(UserInterestResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "너는 이 영상에 매우 관심이 많은 유튜브 시청자야. 이 영상의 자막 내용을 보면서, "
         "'정말 이게 사실일까?', '이거 진짜 확인해봐야겠다' 싶은 내용만 뽑아내려고 해.\n\n"
         "이 내용에서 사실관계 확인이 필요한 자막만 뽑아. 또는 여러 자막을 문맥에 맞게 합쳐서 "
         "사실관계 확인이 필요한 하나의 명확한 문장으로 생성해서 출력해 줘.\n"
         "특히 건강, 의학, 정책, 효능 등 과장될 수 있거나 중요한 정보에 집중해."),
        ("user", "아래는 영상의 자막 세그먼트들이야. 사실관계 확인이 필요한 문장들을 추출하거나 합쳐서 반환해줘:\n\n{segments_json}")
    ])
    
    chain = prompt | structured_llm
    segments_json = json.dumps(cleaned_segments, ensure_ascii=False, indent=2)
    
    try:
        response: UserInterestResponse = await chain.ainvoke({"segments_json": segments_json})
        state["user_interest_segments"] = [seg.model_dump() for seg in response.segments]
        
        print("\n[Step 3: User Interest Extraction Completed]")
        print(f"-> Extracted {len(state['user_interest_segments'])} statements to verify.")
        for seg in state["user_interest_segments"]:
            print(f"   - [{seg['start_time']}s] {seg['text']}")
            
    except Exception as e:
        logger.error(f"[User Interest Extraction Error] {e}")
        state["user_interest_segments"] = []
        
    return state
