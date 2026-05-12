import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from services.analysis.steps.evidence_retriever import evidence_retriever
from services.analysis.steps.semantic_router import semantic_router
from core.authority_config import get_domain_authority

class TestEvidenceRetrieverAndRouter(unittest.TestCase):
    
    def test_source_scoring(self):
        """1. Source Scoring Unit Test"""
        # VERY_HIGH
        self.assertEqual(get_domain_authority("https://mfds.go.kr/index.do")["grade"], "VERY_HIGH")
        self.assertEqual(get_domain_authority("http://law.go.kr/test")["grade"], "VERY_HIGH")
        
        # HIGH
        self.assertEqual(get_domain_authority("https://www.korea.kr/main.do")["grade"], "HIGH")
        self.assertEqual(get_domain_authority("https://yna.co.kr/view/123")["grade"], "HIGH")
        
        # LOW / VERY_LOW
        self.assertEqual(get_domain_authority("https://blog.naver.com/user123")["grade"], "LOW")
        self.assertEqual(get_domain_authority("https://shopping.naver.com/item")["grade"], "VERY_LOW")
        
        # Unknown but .go.kr
        self.assertEqual(get_domain_authority("https://unknown.go.kr")["grade"], "HIGH")

    def test_calculate_evidence_score(self):
        """2. Evidence Score Calculation Test"""
        claim = "이 제품은 체지방 감소 효과가 있다."
        
        # 1. 식약처 결과 (VERY_HIGH)
        # auth(35) + relevance(25) + fresh(10) + orig(10) + cross(0) = 80
        score1 = evidence_retriever._calculate_evidence_score(
            claim, 
            "체지방 감소 효과 기능성 인정", 
            url="https://mfds.go.kr/test"
        )
        self.assertGreaterEqual(score1, 80)
        
        # 2. 블로그 결과 (LOW)
        # auth(30% of 35 = 10.5) + relevance(25) + fresh(10) + orig(5) + cross(0) = ~50
        score2 = evidence_retriever._calculate_evidence_score(
            claim, 
            "다이어트에 최고예요", 
            url="https://blog.naver.com/test"
        )
        self.assertLess(score2, 60)
        
        # 3. SQL DB 자체 결과 (최고점 부여)
        score3 = evidence_retriever._calculate_evidence_score(
            claim, 
            "인정", 
            source_type="sql_database"
        )
        self.assertGreaterEqual(score3, 80)

    def test_domain_strategy_router(self):
        """3. Router Strategy Test"""
        # 가짜 도메인 입력에 대한 전략 테스트
        domains_health = [{"name": "food_health_ad", "score": 0.9}]
        strategy1 = semantic_router._determine_strategy("건강기능식품", domains_health)
        
        self.assertTrue(strategy1["use_stable_guidelines"])
        self.assertEqual(strategy1["web_search_priority"], "high")
        
        domains_policy = [{"name": "policy_regulation", "score": 0.85}]
        strategy2 = semantic_router._determine_strategy("법률 개정안", domains_policy)
        
        self.assertTrue(strategy2["use_stable_guidelines"])
        self.assertEqual(strategy2["web_search_priority"], "low")

if __name__ == "__main__":
    unittest.main()
