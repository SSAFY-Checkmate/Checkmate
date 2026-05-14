import json
import uuid
import datetime
import asyncio
import logging
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

from services.analysis.steps.semantic_router import semantic_router
from services.analysis.steps.evidence_retriever import evidence_retriever
from services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

class FactCheckResult(BaseModel):
    claim: str = Field(..., description="검증 대상이 된 원래의 주장")
    thought_process: str = Field(..., description="판정 전, 제공된 증거의 신뢰도(Score)를 기반으로 자기 성찰하는 과정")
    status: Literal["SUPPORTED", "PARTIALLY_SUPPORTED", "REFUTED", "MISLEADING", "UNSUPPORTED", "NOT_ENOUGH_INFO"] = Field(..., description="판정 결과")
    confidence: float = Field(..., description="판정에 대한 확신도 (0.0 ~ 1.0). 증거의 신뢰도가 낮거나 충돌하면 낮게 설정하세요.")
    explanation: str = Field(..., description="최종 사용자를 위한 간결한 판정 근거 설명")

class OptimizedQueries(BaseModel):
    queries: List[str] = Field(..., description="의미 중심, 법령/명칭 중심 등 목적에 맞게 분해된 네이버 웹 검색용 키워드 조합 2~3개")

class EvidenceRelevance(BaseModel):
    relevance: Literal["RELEVANT", "IRRELEVANT"] = Field(..., description="관련성 여부")
    reason: str = Field(..., description="판단 이유")

async def _save_to_verified_claims(claim: str, result: FactCheckResult, evidences: List[dict]):
    """조건을 만족하는 경우 검증 결과를 verified_claims 컬렉션에 적재합니다."""
    if result.status == "NOT_ENOUGH_INFO":
        return
        
    has_high_score_evidence = any(e.get("score", 0) >= 80 for e in evidences)
    if not has_high_score_evidence:
        return
        
    if result.confidence < 0.75:
        return
        
    try:
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"verified_{claim}"))
        
        # TTL: 기본 30일 (추후 도메인별 세분화 가능)
        retrieved_at = datetime.datetime.now().isoformat()
        
        content = f"[검증된 주장]\n주장: {claim}\n판정: {result.status}\n설명: {result.explanation}"
        
        metadata = {
            "source_type": "verified_claims",
            "url": "",
            "grade": "VERY_HIGH",
            "verdict": result.status,
            "confidence": result.confidence,
            "retrieved_at": retrieved_at,
            "ttl_days": 30
        }
        
        # Qdrant upsert
        vector_store = qdrant_service.get_vector_store("verified_claims")
        if vector_store:
            await asyncio.to_thread(
                vector_store.add_texts,
                texts=[content],
                metadatas=[metadata],
                ids=[point_id]
            )
            logger.info(f"Successfully saved verified claim to cache: {claim[:30]}...")
    except Exception as e:
        logger.error(f"Failed to save to verified_claims: {e}")

async def _save_to_web_cache(claim: str, evidences: List[dict]):
    """웹 검색 결과 중 유효한 것을 web_evidence_cache에 적재합니다."""
    try:
        vector_store = qdrant_service.get_vector_store("web_evidence_cache")
        if not vector_store:
            return
            
        texts = []
        metadatas = []
        ids = []
        
        for ev in evidences:
            # 웹 검색 결과이고 점수가 50 이상인 경우만 캐싱
            if ev.get("metadata", {}).get("source_type") == "web_search" and ev.get("score", 0) >= 50:
                url = ev.get("metadata", {}).get("url", "")
                if not url:
                    continue
                    
                point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"webcache_{url}_{claim}"))
                retrieved_at = datetime.datetime.now().isoformat()
                
                texts.append(ev["content"])
                metadatas.append({
                    "source_type": "web_cache",
                    "url": url,
                    "grade": ev.get("metadata", {}).get("grade", "UNKNOWN"),
                    "original_claim": claim,
                    "retrieved_at": retrieved_at
                })
                ids.append(point_id)
                
        if texts:
            await asyncio.to_thread(
                vector_store.add_texts,
                texts=texts,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Saved {len(texts)} web evidences to cache.")
    except Exception as e:
        logger.error(f"Failed to save to web_evidence_cache: {e}")

def clean_queries(queries: List[str]) -> List[str]:
    cleaned = []
    for q in queries:
        if not q:
            continue
        q = q.strip()
        if not q:
            continue
        if len(q) < 2:
            continue
        cleaned.append(q)
    return list(dict.fromkeys(cleaned))

async def process_single_claim(item: dict, llm_client) -> Optional[dict]:
    claim = item.get("claim", "")
    start_time = item.get("start_time", 0.0)
    original_text = item.get("original_text", "")
    
    if not claim:
        return None
        
    # 1. 2단계 Semantic Routing
    routing_result = await asyncio.to_thread(semantic_router.route_claim, claim)
    
    # 1.5 Query Decomposition (LLM)
    query_system_prompt = """다음 주장을 검증하기 위한 웹 검색 쿼리를 3개 생성하세요.

규칙:
1. 단어 하나짜리 검색어는 만들지 마세요.
2. 반드시 주장 속 핵심 대상과 검증 포인트를 함께 포함하세요.
3. 식품·건강기능식품 주장은 식약처, 건강기능식품, 표시광고, 기준, 고시, 섭취 시 주의사항 등의 문맥어를 포함하세요.
4. 특정 조항이 등장하면 조항명과 문서명을 함께 검색하세요.
5. 쿼리는 빈 문자열이면 안 됩니다.
6. 검색어는 8자 이상이어야 합니다.
7. 너무 일반적인 검색어는 금지합니다. 예: "식약처", "건강기능식품", "도움 줄 수 있음"

예시:
주장: 식약처의 건강기능식품 표시광고 심의기준 제12조에 따르면 체중 감량 효과를 표시할 수 있다.
검색어:
- "건강기능식품 표시광고 심의기준" "제12조" "체중 감량"
- "건강기능식품" "체지방 감소" "표시 광고" "식약처"
- "건강기능식품의 표시기준" "체중 감량" "기능성"
"""
    try:
        query_result = await llm_client.make_structured_request_async(
            system_prompt=query_system_prompt,
            user_prompt=f"[주장]\n{claim}\n\n위 주장을 검증하기 위한 웹 검색 쿼리를 생성해주세요.",
            response_model=OptimizedQueries,
            stage="query_generation"
        )
        if query_result and query_result.queries:
            valid_queries = clean_queries(query_result.queries)
            if valid_queries:
                routing_result["optimized_queries"] = valid_queries
                logger.info(f"Generated Optimized Queries: {valid_queries}")
            else:
                logger.warning("No valid web search queries generated. Using claim as fallback.")
                routing_result["optimized_queries"] = clean_queries([claim])
        else:
            routing_result["optimized_queries"] = clean_queries([claim])
    except Exception as e:
        logger.warning(f"Query Decomposition failed: {e}. Falling back to original claim.")
        routing_result["optimized_queries"] = clean_queries([claim])
    
    # 2. Strategy 기반 Evidence Retrieval
    evidences = await evidence_retriever.retrieve_by_strategy(routing_result, top_k=5)
    
    # 2.5 Evidence Relevance Filter
    filter_system_prompt = """다음 증거가 주장을 검증하는 데 직접적으로 관련 있는지 판단하세요.

판단 기준:
- 주장 속 핵심 대상, 제도명, 원료명, 효능 표현 중 하나 이상을 직접 다루면 RELEVANT
- 같은 기관 사이트라도 주장과 다른 주제이면 IRRELEVANT
- 단순 홈페이지, 검색 포털, 목록 페이지는 IRRELEVANT
- 주장 검증에 필요한 조항/기준/주의사항/인정사항을 포함하면 RELEVANT"""

    filtered_evidences = []
    if evidences:
        async def filter_evidence(ev):
            user_prompt = f"[주장]\n{claim}\n\n[증거]\n{ev['content']}"
            try:
                rel_result = await llm_client.make_structured_request_async(
                    system_prompt=filter_system_prompt,
                    user_prompt=user_prompt,
                    response_model=EvidenceRelevance,
                    stage="relevance_filter"
                )
                if rel_result and rel_result.relevance == "RELEVANT":
                    return ev
            except Exception as e:
                logger.error(f"Relevance filter error: {e}")
            return None

        filter_tasks = [filter_evidence(ev) for ev in evidences]
        filter_results = await asyncio.gather(*filter_tasks)
        filtered_evidences = [ev for ev in filter_results if ev is not None]

    if not filtered_evidences:
        logger.warning(f"All evidences filtered out by relevance judge for claim: {claim[:30]}...")

    # 3. 증거 포맷팅 (점수 포함)
    evidence_text = ""
    for i, ev in enumerate(filtered_evidences[:3]): # 최종적으로 상위 3개만 사용
        grade = ev.get('metadata', {}).get('grade', 'UNKNOWN')
        score = ev.get('score', 0)
        evidence_text += f"[{i+1}] [출처 등급: {grade}, Score: {score}/100]\n내용: {ev['content']}\n\n"
        
    if not evidence_text.strip():
        evidence_text = "검색된 유효한 근거가 없습니다."

    # 4. LLM Verification
    system_prompt = """당신은 식품·의약품·건강기능식품 광고 주장을 검증하는 팩트체커입니다.
다음 원칙을 따르세요.
1. 기본적으로 제공된 증거를 최우선으로 기반하여 판정합니다. 단, 검색된 증거가 부족하더라도 당신의 자체 지식(사전 학습 데이터)을 바탕으로 누구나 아는 보편적 상식이나 명백한 의학적/과학적 사실이라면 이를 활용하여 판정(SUPPORTED, REFUTED 등)할 수 있습니다.
2. 다만 광고성 효능, 안전성, 인증, 질병 관련 주장은 일반 사실 주장보다 엄격하게 봅니다.
3. 주장이 제품의 효능, 체중 감량, 질병자 섭취 가능성, 부작용 없음, 약물 병용 가능성, 식약처 인증을 단정하는 경우, 제공된 증거가 이를 직접 뒷받침하지 않으면 단순 정보 부족이 아니라 UNSUPPORTED로 판정할 수 있습니다.
4. 원료의 기능성 인정 사실을 개별 제품의 효과 보장, 식약처 인증 제품, 질병 예방·치료 효과로 확장하면 MISLEADING으로 판정합니다.
5. 공식 문서가 특정 표현을 허용한다는 직접 근거가 없는데 광고 문구가 이를 허용된 표현처럼 말하면 MISLEADING으로 판정합니다.
6. 증거가 주장과 전혀 관련 없을 경우, 자체 지식으로도 판단할 수 없다면 NOT_ENOUGH_INFO로 판정합니다.
7. 출처 등급이 높아도 내용이 주장을 직접 다루지 않으면 근거로 사용하지 마세요.
8. [중요] explanation(설명) 작성 시, 판정의 근거가 된 출처(제공된 검색 증거의 특정 내용인지, 아니면 당신의 자체 보편적 지식인지)를 반드시 상세히 명시하세요. 증거가 없는 경우에도 '왜 이 주장을 허위/진실/판단불가/근거없음으로 보았는지' 그 이유를 자세히 서술해야 합니다.

[자기 성찰 및 메타 인지]
판정을 내리기 전 다음 질문에 대한 답을 'thought_process'에 상세히 작성하며 스스로 성찰하십시오:
- "제공된 증거가 주장의 핵심(효능, 대상, 인증 등)을 직접적으로 다루고 있는가?"
- "검색된 증거가 없다면, 이것이 나의 자체 지식으로 확신할 수 있는 보편적 사실인가?"
- "원료의 특성을 제품의 효능으로 과장하거나 소비자를 오인하게 만들지 않는가?"
- "근거가 부족한 경우 이것이 단순 정보 부족(NOT_ENOUGH_INFO)인지, 아니면 근거 없는 과장 광고(UNSUPPORTED)인지 신중히 구분했는가?"

[판정 기준 (status)]
- SUPPORTED: 증거 또는 명백한 자체 지식이 주장을 직접 지지함
- PARTIALLY_SUPPORTED: 주장의 일부는 맞으나 세부 내용이 다름
- REFUTED: 증거 또는 명백한 자체 지식이 주장을 직접 반박함
- MISLEADING: 일부 사실은 있으나 광고 표현이 제도, 효능, 안전성을 과장하거나 오인하게 함
- UNSUPPORTED: 광고성 주장을 했지만 제공된 증거가 없고 자체 지식으로도 뒷받침되지 않음
- NOT_ENOUGH_INFO: 관련 증거가 없고 자체 지식으로도 판단할 수 없어 지지/반박/과장 여부를 알 수 없음

[출력 규칙]
- 응답은 반드시 JSON 스키마(FactCheckResult)를 준수해야 합니다.
- "confidence"는 판정에 대한 당신의 확신도를 0.0에서 1.0 사이로 적어주세요.
"""
        
    user_prompt = f"""[검증할 주장]
{claim}

[검색된 증거]
{evidence_text}

이 주장에 대한 사실 여부를 판정하고, explanation에 그 이유와 출처(검색 증거 또는 자체 상식)를 한국어로 상세히 적어주세요.
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
            # 5. Feedback Loop (Async Background Task)
            asyncio.create_task(_save_to_verified_claims(claim, result, evidences))
            asyncio.create_task(_save_to_web_cache(claim, evidences))
            
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": result.claim,
                "status": result.status,
                "confidence": result.confidence,
                "explanation": result.explanation,
                "routes": routing_result.get("strategy", {}).get("selected_domains", [])
            }
        else:
            return {
                "start_time": start_time,
                "original_text": original_text,
                "claim": claim,
                "status": "NOT_ENOUGH_INFO",
                "confidence": 0.0,
                "explanation": "LLM 응답 생성 실패",
                "routes": routing_result.get("strategy", {}).get("selected_domains", [])
            }
            
    except Exception as e:
        logger.error(f"Error in RAG Fact Check LLM call: {e}")
        return {
            "start_time": start_time,
            "original_text": original_text,
            "claim": claim,
            "status": "ERROR",
            "confidence": 0.0,
            "explanation": str(e),
            "routes": routing_result.get("strategy", {}).get("selected_domains", [])
        }

async def rag_fact_check_step(state: dict, llm_client) -> dict:
    """RAG Fact Check (Routing, Evidence Strategy, Verification) - Async Parallel Processing"""
    extracted_claims = state.get("extracted_claims", [])
    
    semaphore = asyncio.Semaphore(15)
    
    async def sem_process(item):
        async with semaphore:
            return await process_single_claim(item, llm_client)
            
    tasks = [sem_process(item) for item in extracted_claims]
    results = await asyncio.gather(*tasks)
    
    fact_check_results = [res for res in results if res is not None]
    
    state["fact_check_results"] = fact_check_results
    return state
