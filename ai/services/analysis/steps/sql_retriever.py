import os
import logging
from typing import Optional
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class SafeChatOpenAI(ChatOpenAI):
    def _clean_messages(self, messages):
        if hasattr(messages, "to_messages"):
            messages_list = messages.to_messages()
        elif isinstance(messages, list):
            messages_list = messages
        else:
            return messages

        for msg in messages_list:
            if hasattr(msg, "additional_kwargs"):
                fc = msg.additional_kwargs.get("function_call")
                if isinstance(fc, dict) and not fc.get("name"):
                    msg.additional_kwargs.pop("function_call", None)
                    
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                msg.tool_calls = [tc for tc in msg.tool_calls if tc.get("name") or tc.get("id")]
        return messages

    def invoke(self, input, config=None, **kwargs):
        input = self._clean_messages(input)
        return super().invoke(input, config=config, **kwargs)

    async def ainvoke(self, input, config=None, **kwargs):
        input = self._clean_messages(input)
        return await super().ainvoke(input, config=config, **kwargs)

class SQLRetriever:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model_name = os.getenv("LLM_MODEL", "gpt-4o-mini")
        
        # DB 경로 설정
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        db_path = os.path.join(base_dir, 'data', 'food_safety.db')
        
        import sqlite3
        from sqlalchemy.pool import QueuePool
        
        db_path_uri = db_path.replace('\\', '/')
        
        def ro_creator():
            return sqlite3.connect(
                f"file:{db_path_uri}?mode=ro", 
                uri=True, 
                check_same_thread=False
            )
            
        try:
            self.db = SQLDatabase.from_uri(
                "sqlite://", # dummy URI
                engine_args={
                    "creator": ro_creator,
                    "poolclass": QueuePool,
                    "pool_size": 10,
                    "max_overflow": 20
                }
            )
            if self.api_key:
                self.llm = SafeChatOpenAI(model=self.model_name, temperature=0.0, api_key=self.api_key)
                
                # 에이전트 프롬프트에 테이블 컨텍스트 주입
                system_prefix = """당신은 한국 식품의약품안전처(식약처)의 건강기능식품 데이터베이스를 검색하는 AI 에이전트입니다.
사용자의 주장이 사실인지 확인하기 위해 적절한 SQL 쿼리를 작성하여 DB를 조회하고, 그 결과를 바탕으로 사실 관계를 답변하세요.

[테이블 정보]
1. health_food_info: 건강기능식품 기본 정보 (제품명, 업체명, 주된기능성 등)
2. unfit_food: 검사 부적합 식품정보 (회수 대상 식품)
3. fsk_functional_raw: 건강기능식품 기능성 원료인정현황 (원료별 기능성, 성상 등)
4. fsk_ingredients: 건강기능식품 품목제조신고(원재료)
5. fsk_manufacturing: 건강기능식품 품목제조 신고사항 현황

[주의사항]
- 쿼리를 작성할 때 LIKE 연산자와 % 와일드카드를 적극 사용하여 부분 일치 검색을 수행하세요.
- DB에 결과가 없다면 "DB에 일치하는 관련 정보가 없습니다." 라고 답변하세요.
- 답변은 팩트체크를 위한 증거용으로 사용되므로, DB에서 찾은 내용을 상세히 나열하세요.
"""
                self.agent_executor = create_sql_agent(
                    llm=self.llm,
                    toolkit=None,  # DB를 직접 넘기면 자동으로 toolkit 구성됨
                    db=self.db,
                    agent_type="openai-functions",
                    verbose=False,
                    prefix=system_prefix
                )
            else:
                self.agent_executor = None
        except Exception as e:
            logger.error(f"SQL Database 연동 실패: {e}")
            self.agent_executor = None

    async def search_sql_db(self, claim: str) -> Optional[str]:
        """주장에 대한 사실 확인을 위해 SQL DB를 비동기적으로 조회합니다."""
        if not self.agent_executor:
            logger.warning("SQL Agent가 초기화되지 않았습니다.")
            return None
            
        try:
            import asyncio
            # agent_executor.ainvoke를 사용하여 비동기 실행 (블로킹 방지)
            result = await self.agent_executor.ainvoke({"input": claim})
            
            output = result.get("output", "")
            if "일치하는 관련 정보가 없습니다" in output or not output.strip():
                return None
                
            return output
        except Exception as e:
            logger.error(f"SQL Agent 조회 실패: {e}")
            return None

sql_retriever = SQLRetriever()
