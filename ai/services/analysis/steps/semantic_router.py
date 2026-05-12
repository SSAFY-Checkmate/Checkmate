import logging
from typing import List, Dict, Any
from services.embedding_service import embedding_service
from services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

class SemanticRouter:
    def __init__(self):
        self.collection_name = "route_descriptions"

    def _route_domain(self, claim: str) -> List[Dict[str, Any]]:
        """
        1단계: Claim Domain Router
        주장이 어떤 도메인에 속하는지 판단합니다.
        """
        try:
            vector_store = qdrant_service.get_vector_store(self.collection_name)
            if not vector_store:
                raise ValueError("Vector store not initialized")

            # Qdrant `route_descriptions` 컬렉션에서 검색
            results = vector_store.similarity_search_with_score(claim, k=5)

            domains = []
            for doc, score in results:
                route_name = doc.metadata.get("name")
                if route_name:
                    domains.append({"name": route_name, "score": score})
            
            # 높은 점수순 정렬
            domains = sorted(domains, key=lambda x: x["score"], reverse=True)
            return domains

        except Exception as e:
            logger.error(f"Error routing domain: {e}")
            return [{"name": "news_event", "score": 0.5}] # Fallback domain

    def _determine_strategy(self, claim: str, domains: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        2단계: Retrieval Strategy Router
        도메인 분류 결과를 바탕으로 검색 전략을 수립합니다.
        """
        # 기본 전략
        strategy = {
            "use_verified_claims": True,     # 캐시 최우선
            "use_stable_guidelines": False,
            "use_web_search": True,          # 기본적으로 웹 검색 허용
            "web_search_priority": "normal",
            "selected_domains": [],
            "reason": "일반적인 팩트체크 검색 전략"
        }

        if not domains:
            return strategy

        top_domain = domains[0]["name"]
        top_score = domains[0]["score"]
        
        # 0.45 이상인 도메인들을 수집 (최대 2개)
        selected_domains = [d["name"] for d in domains if d["score"] >= 0.45][:2]
        
        # 만약 하나도 0.45 이상이 안 넘는다면 가장 높은 것 1개 선택
        if not selected_domains:
            selected_domains = [top_domain]

        strategy["selected_domains"] = selected_domains

        # 도메인 성격에 따른 전략 조정
        if "food_health_ad" in selected_domains or "health_medical" in selected_domains:
            strategy["use_stable_guidelines"] = True
            strategy["web_search_priority"] = "high"
            strategy["reason"] = "건강/식품/의료 도메인은 가이드라인 문서 및 정부출처 웹 검색이 필수적임"
            
        elif "policy_regulation" in selected_domains:
            strategy["use_stable_guidelines"] = True
            strategy["web_search_priority"] = "low" # 정책 원문은 Qdrant DB(가이드라인)나 SQL 우선
            strategy["reason"] = "정책 도메인은 가이드라인 문서(DB) 우선"
            
        elif "news_event" in selected_domains:
            strategy["use_stable_guidelines"] = False
            strategy["web_search_priority"] = "high"
            strategy["reason"] = "뉴스/사건 도메인은 최신 정보가 중요하므로 웹 검색 우선"
            
        elif "finance_investment" in selected_domains:
            strategy["use_stable_guidelines"] = False
            strategy["web_search_priority"] = "high"
            strategy["reason"] = "금융/투자 도메인은 최신 웹 데이터 우선"

        return strategy

    def route_claim(self, claim: str) -> Dict[str, Any]:
        """
        주장을 받아서 2단계 라우팅(도메인 분류 -> 검색 전략 수립)을 수행합니다.
        """
        logger.info(f"Routing claim: '{claim[:30]}...'")
        
        # 1. Domain Routing
        domains = self._route_domain(claim)
        logger.info(f"Domain routing result: {domains}")
        
        # 2. Strategy Routing
        strategy = self._determine_strategy(claim, domains)
        logger.info(f"Retrieval strategy: {strategy}")

        return {
            "claim": claim,
            "domains": domains,
            "strategy": strategy
        }

semantic_router = SemanticRouter()
