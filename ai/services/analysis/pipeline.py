import asyncio
from langchain_core.runnables import RunnableLambda, RunnableSequence

from services.claimify.llm_client import LLMClient
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse, AnalyzeResponseData, Violation
from services.analysis.steps.preprocessing import preprocess_sentences_step
from services.analysis.steps.summary import generate_summary_step
from services.analysis.steps.cleansing import text_cleansing_step
from services.analysis.steps.claim_extraction import extract_claims_step
from services.analysis.steps.rag_fact_check import rag_fact_check_step

class AnalysisPipelineService:
    def __init__(self):
        self.llm_client = LLMClient()
        
        async def extract_claims_wrapper(state):
            return await extract_claims_step(state, self.llm_client)

        # Build the LangChain pipeline using LCEL
        self.pipeline: RunnableSequence = (
            RunnableLambda(preprocess_sentences_step)
            | RunnableLambda(generate_summary_step)
            | RunnableLambda(text_cleansing_step)
            | RunnableLambda(extract_claims_wrapper)
            | RunnableLambda(rag_fact_check_step)
            | RunnableLambda(self.format_response)
        )

    def format_response(self, state: dict) -> AnalyzeResponse:
        
        request: AnalyzeRequest = state.get("request")
        video_id = request.video_id if request else ""
        video_title = request.title if request else ""
        channel_name = request.author if request else ""
        
        # mock violations from fact_check_results
        violations = []
        for res in state.get("fact_check_results", []):
            violations.append(Violation(
                start_time=res.get("start_time", 0.0), # 동적 시간 맵핑
                violation_sentence=res.get("original_text", res.get("claim", "")), # 주장 추출 전 원본 문장
                reason=res.get("reason", "허위 판별 근거 (Mock)") # RAG 기반 판별 근거
            ))

        # 만약 claims가 없으면 기본 mock 데이터 추가
        if not violations:
            violations.append(Violation(
                start_time=120.0,
                violation_sentence="백신은 효과가 없으며 오히려 몸을 망칩니다.",
                reason="의학적 근거가 없는 허위 사실입니다."
            ))

        data = AnalyzeResponseData(
            video_id=video_id if video_id else "dQw4w9WgXcQ",
            video_title=video_title if video_title else "테스트 영상 제목",
            channel_name=channel_name if channel_name else "테스트 채널명",
            trust_grade="DANGER", # Mock
            confidence_score=85,  # Mock
            summary=state.get("summary", "AI 분석 요약 내용입니다..."),
            violations=violations
        )

        return AnalyzeResponse(
            status=200,
            message="요청이 성공했습니다.",
            data=data
        )

    async def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        initial_state = {
            "request": request,
            "video_title": request.title,
            "text": request.content
        }
        
        # ainvoke allows running the pipeline asynchronously where possible
        result = await self.pipeline.ainvoke(initial_state)
        return result
