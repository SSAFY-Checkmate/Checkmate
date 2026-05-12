import json
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from services.analysis.steps.semantic_router import semantic_router
from services.analysis.steps.evidence_retriever import evidence_retriever

class FactCheckResult(BaseModel):
    claim: str = Field(..., description="검증 대상이 된 원래의 주장")
    thought_process: str = Field(..., description="판정 전, 증거의 신뢰도를 평가하고 편향 개입 여부를 스스로 묻는 자기 성찰 과정")
    status: Literal["SUPPORTED", "PARTIALLY_SUPPORTED", "REFUTED", "NOT_ENOUGH_INFO"] = Field(..., description="판정 결과")
    explanation: str = Field(..., description="최종 사용자를 위한 간결한 판정 근거 설명")

import asyncio

async def process_single_claim(item: dict, llm_client) -> Optional[dict]:
    claim = item.get("claim", "")
    start_time = item.get("start_time", 0.0)
    original_text = item.get("original_text", "")
    
    if not claim:
        return None
        
    # 1. Semantic Routing (블로킹 작업이므로 to_thread 사용)
    routing_result = await asyncio.to_thread(semantic_router.route_claim, claim)
    selected_routes = routing_result.get("selected_routes", ["general_web_search"])
    
    # 2. Evidence Retrieval (비동기 DB/검색/SQL 작업)
    search_keywords = item.get("search_keywords", [])
    evidences = await evidence_retriever.retrieve_by_routes(claim, selected_routes, 3, search_keywords)
    
    # 증거를 문자열로 포맷팅
    evidence_text = ""
    for i, ev in enumerate(evidences):
        evidence_text += f"[{i+1}] 출처 도메인: {ev['route']}\n내용: {ev['content']}\n\n"
        
    if not evidence_text.strip():
        evidence_text = "검색된 관련 근거가 없습니다."

    # 3. LLM Verification
    system_prompt = """당신은 주어진 증거에 기반하여 진실을 규명하는 유연하고 합리적인 수석 검증관(Chief Fact-Checker)입니다.

[임무]
주어진 증거(Evidence) 자료들을 종합적으로 분석하여, 사용자의 주장(Claim)이 사실인지 거짓인지 합리적으로 판정하십시오.

[증거 평가 및 교차 검증 원칙]
1. [식약처 DB 조회 결과] 태그가 붙은 증거는 정부의 공식 승인 데이터베이스 결과이므로 가장 신뢰도가 높으며, 다른 모든 증거보다 우선하여 판정의 근거로 삼으십시오.
2. 공식 기관 문서나 법령(Qdrant DB 기반)은 두 번째로 신뢰도가 높습니다.
3. [웹 검색 결과] 태그가 붙은 증거는 공신력 있는 정부 기관(go.kr)이나 주요 언론사(yna.co.kr 등)에서 수집된 자료이므로, 공식 문서에 준하는 매우 높은 신뢰도를 가집니다. 내용이 주장을 뒷받침한다면 주저하지 말고 적극적으로 SUPPORTED 판정을 내리십시오.
4. 증거의 텍스트가 주장과 일치하지 않더라도, 문맥상 핵심 의미가 상통한다면 사실로 인정하는 유연함을 발휘하십시오. 특히 웹 검색 결과에 주장을 뒷받침하는 맥락이 있다면 보수적으로 접근하지 말고 넓게 사실로 인정하세요.
5. 만약 [검색된 증거]가 사실상 비어 있거나, "검색된 관련 근거가 없습니다."와 같은 문구만 포함한다면, status는 반드시 "NOT_ENOUGH_INFO"로 설정해야 합니다.

[자기 성찰 및 메타 인지]
판정을 내리기 전 다음 질문에 대한 답을 작성하며 스스로 성찰하십시오:
- "나의 판정은 오직 제공된 증거에만 기반하고 있는가?"
- "도출하려는 결론에 논리적 비약이나 비약적인 추론은 없는가?"

[판정 기준]
- SUPPORTED: 주장의 핵심 내용이 증거에 의해 합리적으로 뒷받침됨
- PARTIALLY_SUPPORTED: 주장의 핵심은 사실이나, 일부 세부 수치나 조건이 다르거나 과장됨
- REFUTED: 주장의 핵심 내용이 신뢰할 수 있는 증거와 명백히 충돌함
- NOT_ENOUGH_INFO: 제공된 증거만으로는 주장의 사실 여부를 합리적으로 추론하기 어려움

[출력 규칙]
- 당신의 응답은 JSON 스키마(FactCheckResult)에 맞춰야 합니다.
- "thought_process"에는 위 자기 성찰 질문에 대한 상세한 내부 사고 과정을 한국어로 작성하세요.
- "explanation"에는 최종 사용자에게 보여줄 2~4문장 정도의 간결한 설명만 작성하세요."""
        
    user_prompt = f"""[검증할 주장]
{claim}

[검색된 증거]
{evidence_text}

이 주장에 대한 사실 여부를 판정하고, explanation에 그 이유를 한국어로 상세히 적어주세요.
"""
    
    try:
        # 비동기 LLM 호출
        result = await llm_client.make_structured_request_async(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=FactCheckResult,
            stage="verification"
        )
        
        if result:
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": result.claim,
                "status": result.status,
                "explanation": result.explanation,
                "routes": selected_routes
            }
        else:
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": claim,
                "status": "NOT_ENOUGH_INFO",
                "explanation": "LLM 응답 생성 실패",
                "routes": selected_routes
            }
            
    except Exception as e:
        return {
            "start_time": start_time,
            "original_text": original_text,
            "claim": claim,
            "status": "ERROR",
            "explanation": str(e),
            "routes": selected_routes
        }

async def rag_fact_check_step(state: dict, llm_client) -> dict:
    """RAG Fact Check (Routing, Semantic Search & Verification) - Async Parallel Processing"""
    extracted_claims = state.get("extracted_claims", [])
    
    # 동시 실행 제어 (GMS 최대 20개 동시 처리 기준)
    semaphore = asyncio.Semaphore(20)
    
    async def sem_process(item):
        async with semaphore:
            return await process_single_claim(item, llm_client)
            
    tasks = [sem_process(item) for item in extracted_claims]
    results = await asyncio.gather(*tasks)
    
    # None 결과 필터링
    fact_check_results = [res for res in results if res is not None]
    
    state["fact_check_results"] = fact_check_results
    return state
