import logging
from typing import List, Dict, Any
from services.embedding_service import embedding_service
from services.qdrant_service import qdrant_service

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

    def _search_web_whitelist(self, claim: str) -> List[Dict[str, Any]]:
        """DuckDuckGo를 이용해 화이트리스트 도메인 한정 웹 검색을 수행합니다."""
        try:
            from langchain_community.tools import DuckDuckGoSearchRun
            search = DuckDuckGoSearchRun()
            
            # 검색어에 site 연산자를 조합하여 화이트리스트 도메인만 타겟팅
            query = f"{claim} site:go.kr OR site:yna.co.kr OR site:kbs.co.kr"
            
            logger.info(f"Running web search with query: {query}")
            result_text = search.invoke(query)
            
            if not result_text or "No good DuckDuckGo Search Result was found" in result_text:
                return []
                
            return [{
                "route": "news_event",
                "score": 0.7, # 임의의 검색 점수 부여
                "content": f"[웹 검색 결과] {result_text}",
                "metadata": {"source_type": "web_search", "query": query}
            }]
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            return []

    def retrieve_by_routes(self, claim: str, selected_routes: List[str], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        선택된 라우트들의 컬렉션에서 claim과 관련된 근거(Evidence)를 검색합니다.
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
                results = vector_store.similarity_search_with_score(claim, k=top_k)
                
                for doc, score in results:
                    all_evidence.append({
                        "route": route,
                        "score": score,
                        "content": doc.page_content,
                        "metadata": doc.metadata
                    })
                    
            except Exception as e:
                logger.error(f"Error searching collection {collection_name}: {e}")
                
        # 3. Web Search Fallback (껐다 켰다 할 수 있는 로직)
        import os
        enable_web_search = os.getenv("ENABLE_WEB_SEARCH", "false").lower() == "true"
        
        if enable_web_search:
            # news_event(최신 뉴스) 라우트이거나, 로컬 Qdrant에서 검색된 근거가 아예 없을 때 웹 검색 가동
            if "news_event" in selected_routes or len(all_evidence) == 0:
                logger.info("Web Search condition met. Triggering DuckDuckGo whitelist search...")
                web_evidence = self._search_web_whitelist(claim)
                all_evidence.extend(web_evidence)
                
        # 4. (선택적) Reranking - 단순히 score 순으로 재정렬
        all_evidence = sorted(all_evidence, key=lambda x: x["score"], reverse=True)
        
        return all_evidence

evidence_retriever = EvidenceRetriever()
