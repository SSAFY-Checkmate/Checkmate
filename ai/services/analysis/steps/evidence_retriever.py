import logging
import asyncio
import os
import urllib.parse
from typing import List, Dict, Any
from core.authority_config import get_domain_authority
from services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)

class EvidenceRetriever:
    def __init__(self):
        pass

    def _calculate_evidence_score(self, claim: str, content: str, url: str = None, source_type: str = "unknown") -> int:
        """
        Evidence Score 산정: MVP 버전 (cross_check_score는 기본점 0으로 둠)
        source_authority_score(35%) + claim_relevance_score(30%) + freshness_score(15%) + original_source_score(10%) + cross_check_score(10%)
        """
        # 1. Source Authority (Max 35)
        auth_info = get_domain_authority(url) if url else {"score": 50, "grade": "UNKNOWN"}
        if source_type == "verified_claims":
            auth_score = 35 # DB 및 검증완료 데이터는 최고점
        else:
            auth_score = (auth_info["score"] / 100.0) * 35

        # 2. Claim Relevance (Max 30)
        relevance_score = 25 
        
        # 3. Freshness (Max 15) - MVP 기본값 10
        freshness_score = 10
        
        # 4. Original Source (Max 10)
        if source_type == "verified_claims" or auth_info["grade"] in ["VERY_HIGH", "HIGH"]:
            original_score = 10
        else:
            original_score = 5

        # 5. Cross Check (Max 10) - MVP 기본 0
        cross_check_score = 0

        total_score = auth_score + relevance_score + freshness_score + original_score + cross_check_score
        return int(min(100, max(0, total_score)))

    async def _search_naver_custom(self, claim: str, search_query: str) -> List[Dict[str, Any]]:
        client_id = os.getenv("NAVER_CLIENT_ID")
        client_secret = os.getenv("NAVER_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            logger.warning("Naver Client ID or Secret is missing. Skipping web search.")
            return []

        import re
        import requests
        
        # 쿼리에서 쓸데없는 문자 제거 (LLM이 잘 만들겠지만 혹시 모를 대비)
        query = search_query.strip()[:60]
        
        if not query:
            logger.warning("Search query is empty after stripping. Skipping Naver search to prevent 400 Bad Request.")
            return []
            
        logger.info(f"Executing Naver Search. Query=[{query}]")
        
        url = "https://openapi.naver.com/v1/search/webkr.json"
        headers = {
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret
        }
        params = {
            "query": query,
            "display": 3
        }
        
        try:
            response = await asyncio.to_thread(requests.get, url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            evidence_list = []
            items = data.get("items", [])
            
            for item in items:
                link = item.get("link", "")
                snippet = item.get("description", "")
                title = item.get("title", "")
                
                # HTML 태그 제거 (<b> 등)
                title = re.sub(r'<[^>]+>', '', title)
                snippet = re.sub(r'<[^>]+>', '', snippet)
                
                content = f"[{title}] {snippet}"
                score = self._calculate_evidence_score(claim, content, url=link, source_type="web_search")
                
                evidence_list.append({
                    "route": "web_search",
                    "score": score,
                    "content": f"[웹 검색 결과]\nURL: {link}\n{content}",
                    "metadata": {
                        "source_type": "web_search",
                        "url": link,
                        "grade": get_domain_authority(link)["grade"]
                    }
                })
            return evidence_list
        except Exception as e:
            logger.error(f"Naver Search failed: {e}")
            return []

    async def _search_qdrant_collection(self, collection_name: str, claim: str, top_k: int = 3, is_verified=False) -> List[Dict[str, Any]]:
        vector_store = qdrant_service.get_vector_store(collection_name)
        if not vector_store:
            return []
            
        try:
            results = await asyncio.to_thread(vector_store.similarity_search_with_score, claim, k=top_k)
            evidence_list = []
            for doc, sim_score in results:
                source_url = doc.metadata.get("url", "")
                source_type = "verified_claims" if is_verified else "qdrant_db"
                
                ev_score = self._calculate_evidence_score(claim, doc.page_content, url=source_url, source_type=source_type)
                grade = "VERY_HIGH" if is_verified else get_domain_authority(source_url)["grade"]
                
                evidence_list.append({
                    "route": collection_name,
                    "score": ev_score,
                    "content": doc.page_content,
                    "metadata": {
                        "source_type": source_type,
                        "similarity": sim_score,
                        "grade": grade,
                        "url": source_url
                    }
                })
            return evidence_list
        except Exception as e:
            logger.error(f"Error searching collection {collection_name}: {e}")
            return []

    async def retrieve_by_strategy(self, routing_result: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        claim = routing_result.get("claim", "")
        strategy = routing_result.get("strategy", {})
        optimized_queries = routing_result.get("optimized_queries", [claim])
        
        all_evidence = []
        
        # Priority 1: verified_claims (Cache Hit)
        if strategy.get("use_verified_claims"):
            verified_evidences = await self._search_qdrant_collection("verified_claims", claim, top_k=2, is_verified=True)
            high_score_verified = [e for e in verified_evidences if e["score"] >= 80]
            if high_score_verified:
                logger.info("Cache Hit in verified_claims. Returning early.")
                return high_score_verified
            all_evidence.extend(verified_evidences)

        # Priority 2: stable domain docs & SQL
        if strategy.get("use_stable_guidelines"):
            for domain in strategy.get("selected_domains", []):
                collection_name = f"{domain}_docs"
                domain_evs = await self._search_qdrant_collection(collection_name, claim, top_k=2)
                all_evidence.extend(domain_evs)

        # Priority 3: web_evidence_cache
        web_cache_evidences = await self._search_qdrant_collection("web_evidence_cache", claim, top_k=2)
        all_evidence.extend(web_cache_evidences)

        highest_score = max([e["score"] for e in all_evidence], default=0)

        # Priority 4: Naver Web Search
        if strategy.get("use_web_search") and highest_score < 80:
            async def run_query(q):
                return await self._search_naver_custom(claim, q)
                
            # 여러 개의 최적화된 쿼리를 동시에 비동기로 실행
            web_evs_lists = await asyncio.gather(*[run_query(q) for q in optimized_queries[:3]])
            for evs in web_evs_lists:
                all_evidence.extend(evs)
                
            highest_score = max([e["score"] for e in all_evidence], default=0)

            # Priority 5: 1 Retry with strict official domains if score is still < 70
            if highest_score < 70:
                logger.info("Highest score < 70 after 1st web search. Retrying with official domains.")
                
                FOOD_OFFICIAL_DOMAINS = [
                    "mfds.go.kr",
                    "foodsafetykorea.go.kr",
                    "law.go.kr"
                ]
                official_queries = []
                for q in optimized_queries[:2]:
                    if not q.strip(): continue
                    for domain in FOOD_OFFICIAL_DOMAINS:
                        official_queries.append(f"{q} site:{domain}")
                        
                retry_evs_lists = await asyncio.gather(*[run_query(q) for q in official_queries])
                for evs in retry_evs_lists:
                    all_evidence.extend(evs)
                    
            # URL 기준 중복 결과 제거
            unique_evs = {}
            for ev in all_evidence:
                url = ev.get("metadata", {}).get("url", "")
                if url:
                    if url not in unique_evs or ev["score"] > unique_evs[url]["score"]:
                        unique_evs[url] = ev
                else:
                    unique_evs[str(len(unique_evs))] = ev
            all_evidence = list(unique_evs.values())

        filtered_evidence = []
        for e in all_evidence:
            if e["score"] >= 50:
                filtered_evidence.append(e)
            else:
                logger.debug(f"Evidence filtered out due to low score ({e['score']}): {e['content'][:30]}...")
        
        filtered_evidence = sorted(filtered_evidence, key=lambda x: x["score"], reverse=True)
        return filtered_evidence[:top_k]

evidence_retriever = EvidenceRetriever()
