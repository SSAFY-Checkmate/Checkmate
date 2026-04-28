import json
from pydantic import BaseModel, Field
from typing import List, Optional
from services.analysis.steps.semantic_router import semantic_router
from services.analysis.steps.evidence_retriever import evidence_retriever

class FactCheckResult(BaseModel):
    claim: str = Field(..., description="검증 대상이 된 원래의 주장")
    status: str = Field(..., description="판정 결과 (SUPPORTED, PARTIALLY_SUPPORTED, REFUTED, NOT_ENOUGH_INFO 중 하나)")
    explanation: str = Field(..., description="판정에 대한 상세한 근거와 설명")

def rag_fact_check_step(state: dict, llm_client) -> dict:
    """RAG Fact Check (Routing, Semantic Search & Verification)"""
    extracted_claims = state.get("extracted_claims", [])
    
    fact_check_results = []
    
    for item in extracted_claims:
        claim = item.get("claim", "")
        start_time = item.get("start_time", 0.0)
        original_text = item.get("original_text", "")
        
        if not claim:
            continue
            
        # 1. Semantic Routing
        routing_result = semantic_router.route_claim(claim)
        selected_routes = routing_result.get("selected_routes", ["general_web_search"])
        
        # 2. Evidence Retrieval
        evidences = evidence_retriever.retrieve_by_routes(claim, selected_routes, top_k=3)
        
        # 증거를 문자열로 포맷팅
        evidence_text = ""
        for i, ev in enumerate(evidences):
            evidence_text += f"[{i+1}] 출처 도메인: {ev['route']}\n내용: {ev['content']}\n\n"
            
        if not evidence_text.strip():
            evidence_text = "검색된 관련 근거가 없습니다."

        # 3. LLM Verification
        system_prompt = """당신은 주어진 증거(Evidence)를 바탕으로 사용자의 주장(Claim)의 사실 여부를 검증하는 팩트체커입니다.
반드시 제공된 증거만을 바탕으로 판단해야 하며, 외부 지식이나 개인적 의견을 개입시키지 마십시오.

[증거 평가 우선순위 가이드라인]
1. 공식 기관(식약처, 금융감독원 등) 문서나 법령(Qdrant DB 기반)을 최우선으로 신뢰하십시오.
2. [웹 검색 결과] 태그가 붙은 증거는 보조적인 참고 자료로만 활용하십시오.
3. 웹 검색 결과와 공식 문서가 충돌할 경우, 무조건 공식 문서를 우선하십시오.
4. 웹 검색 결과만 존재할 경우, 그 출처가 명확한 정부/언론사 도메인인지 확인하고 보수적으로 판정하십시오.

[판정 기준]
- SUPPORTED: 주장이 증거와 완전히 일치함
- PARTIALLY_SUPPORTED: 주장의 일부만 사실이거나, 조건/범위/수치가 과장됨
- REFUTED: 신뢰할 수 있는 증거와 명백히 충돌함
- NOT_ENOUGH_INFO: 제공된 증거에 관련 내용이 없어 사실 여부를 판단할 수 없음"""
        
        user_prompt = f"""[검증할 주장]
{claim}

[검색된 증거]
{evidence_text}

이 주장에 대한 사실 여부를 판정하고, explanation에 그 이유를 한국어로 상세히 적어주세요.
"""
        
        try:
            # llm_client를 통한 구조화된 응답 요청
            result = llm_client.make_structured_request(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=FactCheckResult,
                stage="verification"
            )
            
            if result:
                fact_check_results.append({
                    "start_time": start_time,
                    "original_text": original_text,
                    "claim": result.claim,
                    "status": result.status,
                    "explanation": result.explanation,
                    "routes": selected_routes
                })
            else:
                fact_check_results.append({
                    "start_time": start_time,
                    "original_text": original_text,
                    "claim": claim,
                    "status": "NOT_ENOUGH_INFO",
                    "explanation": "LLM 응답 생성 실패",
                    "routes": selected_routes
                })
                
        except Exception as e:
            fact_check_results.append({
                "start_time": start_time,
                "original_text": original_text,
                "claim": claim,
                "status": "ERROR",
                "explanation": str(e),
                "routes": selected_routes
            })
            
    state["fact_check_results"] = fact_check_results
    return state
