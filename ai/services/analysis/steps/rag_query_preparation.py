import logging
import asyncio
from pydantic import BaseModel, Field
from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings

logger = logging.getLogger(__name__)

class RagOptimizedQuery(BaseModel):
    refined_claim: str = Field(description="지시대명사가 고유명사로 치환되고, 검색하기 좋게 문장이 정제된 독립적인 단일 주장")
    search_keywords: List[str] = Field(description="DB(식약처 등) 검색에 활용할 핵심 명사 키워드 (최대 3개)")

async def rag_query_preparation_step(state: dict) -> dict:
    """Step 4: RAG 기반 팩트체크를 위한 쿼리(문장/키워드) 최적화 단계"""
    user_interest_segments = state.get("user_interest_segments", [])
    video_title = state.get("video_title", "")
    
    if not user_interest_segments:
        state["extracted_claims"] = []
        return state

    llm = ChatOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or "https://gms.ssafy.io/gmsapi/api.openai.com/v1",
        model="gpt-4o-mini", 
        temperature=0.0
    )
    structured_llm = llm.with_structured_output(RagOptimizedQuery)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
         "당신은 데이터베이스(RAG) 검색 쿼리 최적화 전문가입니다.\n"
         "입력된 문장은 사용자가 유튜브 영상에서 사실을 확인하고 싶어하는 내용입니다. 이 문장을 검색 엔진(식약처 DB 등)에 쿼리하기 좋게 정제하세요.\n\n"
         "[지침]\n"
         "1. '이 약', '저것', '이 제품' 같은 지시대명사가 있다면 영상 제목({video_title})이나 문맥을 바탕으로 구체적인 고유명사로 치환하세요.\n"
         "2. 불필요한 감탄사나 서술어를 제거하고, 독립된 단일 명제(Atomic Claim) 형태로 문장을 정제하세요.\n"
         "3. 검색에 사용할 가장 중요한 핵심 명사 키워드를 최대 3개까지 추출하세요."),
        ("user", "정제할 문장: {text}")
    ])
    
    chain = prompt | structured_llm
    
    async def process_segment(segment):
        start_time = segment.get("start_time", 0.0)
        original_text = segment.get("text", "")
        
        try:
            res: RagOptimizedQuery = await chain.ainvoke({
                "video_title": video_title,
                "text": original_text
            })
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": res.refined_claim,
                "search_keywords": res.search_keywords
            }
        except Exception as e:
            logger.error(f"[RAG Query Prep Error at {start_time}s] {e}")
            # 에러 발생 시 원본 텍스트를 그대로 사용
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": original_text,
                "search_keywords": []
            }

    results = await asyncio.gather(*(process_segment(seg) for seg in user_interest_segments))
    
    # 빈 값 필터링
    extracted_claims = [r for r in results if r]
    
    print("\n[Step 4: RAG Query Preparation Completed]")
    for c in extracted_claims:
        print(f"   - [Original: {c['original_text']}] -> [Query: {c['claim']}] [Keywords: {c['search_keywords']}]")
        
    state["extracted_claims"] = extracted_claims
    return state
