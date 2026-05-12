import logging
from typing import List, Dict, Any
from services.embedding_service import embedding_service
from services.qdrant_service import qdrant_service
from services.analysis.steps.sql_retriever import sql_retriever
import asyncio

logger = logging.getLogger(__name__)

class EvidenceRetriever:
    def __init__(self):
        # 라우트 이름과 실제 컬렉션 이름 매핑
        self.route_to_collection = {
            "food_health_ad": "food_health_ad_docs",
            "health_medical": "health_medical_docs",
            "policy_regulation": "policy_regulation_docs",
            "policy_welfare": "policy_welfare_docs",
            "news_event": "news_event_docs",
            "finance_investment": "finance_investment_docs",
            "product_commerce": "product_commerce_docs",
        }

    def _search_web_whitelist(self, claim: str, search_keywords: List[str] = None) -> List[Dict[str, Any]]:
        """DuckDuckGo를 이용해 화이트리스트 도메인 한정 웹 검색을 수행합니다."""
        import re
        try:
            from ddgs import DDGS
            
            # 1. 키워드가 있으면 키워드를 사용, 없으면 기존처럼 claim 정제
            if search_keywords and len(search_keywords) > 0:
                base_query = " ".join(search_keywords)
            else:
                # 특수문자 제거 및 너무 긴 문장은 앞부분 40자로 자르기
                cleaned_claim = re.sub(r'[\[\]\(\)\'\"]', ' ', claim)
                if len(cleaned_claim) > 40:
                    cleaned_claim = cleaned_claim[:40]
                base_query = cleaned_claim.strip()
            
            # 검색어에 site 연산자를 조합하여 화이트리스트 도메인 타겟팅 (확장)
            # 종합병원, 의료기관, 정부, 주요 언론사, 식약처 포함
            whitelist = "site:snuh.org OR site:amc.seoul.kr OR site:severance.healthcare OR site:kdca.go.kr OR site:go.kr OR site:yna.co.kr OR site:kbs.co.kr OR site:mfds.go.kr"
            query = f"{base_query} {whitelist}"
            
            logger.info(f"Running web search with query: {query}")
            
            result_text = ""
            try:
                # backend="html" 또는 "lite"로 설정하여 불필요한 위키백과(Instant Answer) 호출을 차단합니다.
                with DDGS() as ddgs:
                    results = list(ddgs.text(query, max_results=3, backend="html"))
                    
                if results:
                    snippets = [f"[{r.get('title', '')}] {r.get('body', '')}" for r in results]
                    result_text = "\n".join(snippets)
            except Exception as sub_e:
                logger.warning(f"DDGS direct search failed (ignoring): {sub_e}")
            
            if not result_text:
                return []
                
            return [{
                "route": "news_event",
                "score": 0.7, # 임의의 검색 점수 부여
                "content": f"[웹 검색 결과]\n{result_text}",
                "metadata": {"source_type": "web_search", "query": query}
            }]
        except Exception as e:
            logger.error(f"Web search overall failed: {e}")
            return []

    async def retrieve_by_routes(self, claim: str, selected_routes: List[str], top_k: int = 5, search_keywords: List[str] = None) -> List[Dict[str, Any]]:
        """
        선택된 라우트들의 컬렉션에서 claim과 관련된 근거(Evidence)를 검색합니다.
        조건부로 SQL Agent를 트리거하여 식약처 DB를 함께 조회합니다.
        """
        all_evidence = []
        
        # 1. 각 라우트별로 Qdrant 검색 수행 (LangChain Retriever 활용)
        for route in selected_routes:
            collection_name = self.route_to_collection.get(route)
            
            if not collection_name:
                # general_web_search 나 매핑되지 않은 라우트는 DB 검색을 건너뜁니다.
                logger.info(f"Skipping DB retrieval for route '{route}' (No collection mapping)")
                continue
                
            try:
                vector_store = qdrant_service.get_vector_store(collection_name)
                if not vector_store:
                    continue
                    
                # similarity_search_with_score returns List[Tuple[Document, float]]
                results = await asyncio.to_thread(vector_store.similarity_search_with_score, claim, k=top_k)
                
                for doc, score in results:
                    all_evidence.append({
                        "route": route,
                        "score": score,
                        "content": doc.page_content,
                        "metadata": doc.metadata
                    })
                    
            except Exception as e:
                logger.error(f"Error searching collection {collection_name}: {e}")
                
        # 2. SQL Agent Fallback/Addition (식품/건강 관련 라우트인 경우)
        if "food_health_ad" in selected_routes or "health_medical" in selected_routes:
            logger.info("SQL Agent condition met. Triggering 식약처 DB search...")
            sql_result = await sql_retriever.search_sql_db(claim)
            
            if sql_result:
                all_evidence.append({
                    "route": "sql_db",
                    "score": 0.95, # DB 검색 결과는 매우 높은 신뢰도 부여
                    "content": f"[식약처 DB 조회 결과]\n{sql_result}",
                    "metadata": {"source_type": "sql_database"}
                })

                
        # 3. Web Search Fallback (껐다 켰다 할 수 있는 로직)
        import os
        enable_web_search = os.getenv("ENABLE_WEB_SEARCH", "false").lower() == "true"
        
        if enable_web_search:
            logger.info("Web Search is enabled. Triggering DuckDuckGo whitelist search...")
            web_evidence = await asyncio.to_thread(self._search_web_whitelist, claim, search_keywords)
            all_evidence.extend(web_evidence)
                
        # 4. (선택적) Reranking - 단순히 score 순으로 재정렬
        all_evidence = sorted(all_evidence, key=lambda x: x["score"], reverse=True)
        
        return all_evidence

evidence_retriever = EvidenceRetriever()
