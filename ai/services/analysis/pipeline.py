import os
import asyncio
from langchain_core.runnables import RunnableLambda, RunnableSequence

from services.claimify.llm_client import LLMClient
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse, AnalyzeData, Violation
from services.analysis.steps.preprocessing import preprocess_sentences_step
from services.analysis.steps.summary import generate_summary_step
from services.analysis.steps.user_interest_extraction import user_interest_extraction_step
from services.analysis.steps.rag_query_preparation import rag_query_preparation_step
from services.analysis.steps.rag_fact_check import rag_fact_check_step
from services.analysis.steps.violation_summary import summarize_violation_step
from services.analysis.steps.grading import grading_step
from services.analysis.steps.final_summary import final_summary_step

class AnalysisPipelineService:
    def __init__(self):
        self.llm_client = LLMClient()
        
        # RAG 전용 LLM 클라이언트 설정 (환경변수 RAG_LLM_MODEL이 없으면 기본 모델 사용)
        rag_model_name = os.getenv("RAG_LLM_MODEL")
        self.rag_llm_client = LLMClient(model=rag_model_name)
        
        async def rag_fact_check_wrapper(state):
            return await rag_fact_check_step(state, self.rag_llm_client)

        async def summarize_violation_wrapper(state):
            return await summarize_violation_step(state, self.llm_client)

        async def final_summary_wrapper(state):
            return await final_summary_step(state, self.llm_client)

        def log_step(state, step_name):
            print(f"\n==========================================")
            print(f"[Pipeline] {step_name} 시작...")
            print(f"==========================================")
            return state

        # Build the LangChain pipeline using LCEL
        self.pipeline: RunnableSequence = (
            RunnableLambda(lambda s: log_step(s, "1단계: 자막 전처리 (Preprocessing)"))
            | RunnableLambda(preprocess_sentences_step)
            | RunnableLambda(lambda s: log_step(s, "2단계: 전체 요약 생성 (Summary)"))
            | RunnableLambda(generate_summary_step)
            | RunnableLambda(lambda s: log_step(s, "3단계: 시청자 관점 의심 문장 추출 (User Interest)"))
            | RunnableLambda(user_interest_extraction_step)
            | RunnableLambda(lambda s: log_step(s, "4단계: RAG 쿼리 최적화 (Query Prep)"))
            | RunnableLambda(rag_query_preparation_step)
            | RunnableLambda(lambda s: log_step(s, "5단계: RAG 팩트체크 (Fact-check)"))
            | RunnableLambda(rag_fact_check_wrapper)
            | RunnableLambda(lambda s: log_step(s, "6단계: 자막별 결과 요약 (Violation Summary)"))
            | RunnableLambda(summarize_violation_wrapper)
            | RunnableLambda(lambda s: log_step(s, "7단계: 점수 산정 및 등급 판정 (Grading)"))
            | RunnableLambda(grading_step)
            | RunnableLambda(lambda s: log_step(s, "8단계: 최종 종합 요약 (Final Summary)"))
            | RunnableLambda(final_summary_wrapper)
            | RunnableLambda(lambda s: log_step(s, "9단계: 최종 결과 포맷팅 (Formatting)"))
            | RunnableLambda(self.format_response)
        )

    def format_response(self, state: dict) -> AnalyzeResponse:
        summarized_violations = state.get("summarized_violations", [])
        
        violations = [
            Violation(
                start_time=v["start_time"],
                violation_sentence=v["violation_sentence"],
                reason=v["reason"]
            )
            for v in summarized_violations
        ]

        data = AnalyzeData(
            video_id=state.get("video_id", "unknown"),
            video_title=state.get("video_title", "Unknown Video"),
            channel_name=state.get("author", "Unknown Channel"),
            trust_grade=state.get("trust_grade", "UNKNOWN"),
            confidence_score=state.get("confidence_score", 0),
            summary=state.get("final_summary", ""),
            violations=violations
        )

        return AnalyzeResponse(
            status=200,
            message="요청이 성공했습니다.",
            data=data
        )

    async def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        initial_state = {
            "video_id": request.video_id,
            "video_title": request.title or "Unknown Video",
            "author": request.author or "Unknown Channel",
            "text": request.content,
            "segments": [s.model_dump() for s in request.segments] if request.segments else []
        }
        
        # ainvoke allows running the pipeline asynchronously where possible
        result = await self.pipeline.ainvoke(initial_state)
        return result
