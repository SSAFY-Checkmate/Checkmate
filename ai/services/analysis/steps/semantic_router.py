import logging
from typing import List, Dict, Any
from services.embedding_service import embedding_service
from services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

class SemanticRouter:
    def __init__(self):
        self.collection_name = "route_descriptions"

    def _select_routes(self, scores: List[tuple]) -> List[str]:
        """
        문서에 정의된 Route 선택 전략 알고리즘
        scores 예시: [("food_health_ad", 0.88), ("health_medical", 0.83), ...]
        """
        if not scores:
            return ["general_web_search"]

        # 1. 유사도 내림차순 정렬
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        selected = []

        if len(scores) == 1:
            name, score = scores[0]
            if score >= 0.60:
                return [name]
            return ["general_web_search"]

        top1_name, top1_score = scores[0]
        top2_name, top2_score = scores[1]

        # 2. top1이 압도적으로 높으면 하나만 선택
        if top1_score >= 0.75 and (top1_score - top2_score) >= 0.15:
            return [top1_name]

        # 3. 기본적으로 top-2 선택 (0.60 이상인 경우만)
        for name, score in scores[:2]:
            if score >= 0.60:
                selected.append(name)

        # 4. top-3도 충분히 높고 top-2와 차이가 작으면 포함
        if len(scores) >= 3:
            top3_name, top3_score = scores[2]
            if top3_score >= 0.60 and (top2_score - top3_score) <= 0.08:
                selected.append(top3_name)

        # 5. 아무 route도 0.60 이상이 아니면 fallback
        if not selected:
            selected = ["general_web_search"]

        return selected

    def route_claim(self, claim: str) -> Dict[str, Any]:
        """
        하나의 주장을 받아서 적절한 검색 도메인(route)을 반환합니다.
        """
        try:
            # 1. Claim Embedding 생성
            claim_vector = embedding_service.embed_text(claim)

            # 2. Qdrant `route_descriptions` 컬렉션에서 검색
            search_result = qdrant_service.client.query_points(
                collection_name=self.collection_name,
                query=claim_vector,
                limit=10,
                with_payload=True
            )

            # 3. (route_name, score) 형태의 리스트 생성
            scores = []
            for hit in search_result.points:
                route_name = hit.payload.get("name")
                if route_name:
                    scores.append((route_name, hit.score))
            
            logger.info(f"Route scores for claim '{claim[:20]}...': {scores}")

            # 4. 알고리즘 기반 Route 선택
            selected_routes = self._select_routes(scores)
            logger.info(f"Selected routes: {selected_routes}")

            return {
                "claim": claim,
                "selected_routes": selected_routes,
                "scores": scores
            }

        except Exception as e:
            logger.error(f"Error routing claim: {e}")
            # 에러 발생 시 안전하게 fallback 처리
            return {
                "claim": claim,
                "selected_routes": ["general_web_search"],
                "scores": []
            }

semantic_router = SemanticRouter()
