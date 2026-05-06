import asyncio
from langchain_core.runnables import RunnableLambda, RunnableSequence

from services.claimify.llm_client import LLMClient
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse, AnalyzeData, Violation
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

        async def rag_fact_check_wrapper(state):
            return await rag_fact_check_step(state, self.llm_client)

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
            | RunnableLambda(lambda s: log_step(s, "3단계: 객관적 문장 필터링 (Cleansing)"))
            | RunnableLambda(text_cleansing_step)
            | RunnableLambda(lambda s: log_step(s, "4단계: 세부 주장 분리 (Claim Extraction)"))
            | RunnableLambda(extract_claims_wrapper)
            | RunnableLambda(lambda s: log_step(s, "5단계: RAG 팩트체크 (Fact-check)"))
            | RunnableLambda(rag_fact_check_wrapper)
            | RunnableLambda(lambda s: log_step(s, "6단계: 최종 결과 포맷팅 (Formatting)"))
            | RunnableLambda(self.format_response)
        )

    def format_response(self, state: dict) -> AnalyzeResponse:
        fact_check_results = state.get("fact_check_results", [])
        
        violations = []
        has_refuted = False
        has_partially = False
        has_supported = False
        
        score_sum = 0
        valid_claims = 0
        
        grouped_violations = {}
        for fc in fact_check_results:
            orig = fc.get("original_text", fc.get("claim", ""))
            start = fc.get("start_time", 0.0)
            claim = fc.get("claim", "")
            reason = fc.get("explanation", "")
            
            if orig not in grouped_violations:
                grouped_violations[orig] = {
                    "start_time": start,
                    "reasons": []
                }
            grouped_violations[orig]["reasons"].append(f"[주장] {claim}\n[판정 결과] {reason}")
            
        for orig, data in grouped_violations.items():
            violations.append(Violation(
                start_time=data["start_time"],
                violation_sentence=orig,
                reason="\n\n".join(data["reasons"])
            ))
            status = fc.get("status", "")
            if status == "REFUTED":
                has_refuted = True
                score_sum += 0
                valid_claims += 1
            elif status == "PARTIALLY_SUPPORTED":
                has_partially = True
                score_sum += 50
                valid_claims += 1
            elif status == "SUPPORTED":
                has_supported = True
                score_sum += 100
                valid_claims += 1
            # NOT_ENOUGH_INFO는 점수(모수)에 포함하지 않음
                
        # 1. 세심한 종합 점수 계산 (비율 기반)
        if valid_claims > 0:
            confidence_score = int(score_sum / valid_claims)
        else:
            confidence_score = 0

        # 2. 종합 등급 판정 (사용자 경고 목적이므로 가장 위험한 상태를 대표로 노출)
        if has_refuted:
            trust_grade = "DANGER"
        elif has_partially:
            trust_grade = "WARNING"
        elif has_supported:
            trust_grade = "GOOD"
        else:
            # 증거가 부족하거나 검증할 주장이 없는 경우
            trust_grade = "UNKNOWN"
            
        # 3. 요약문(summary) 생성
        # 기존: 일반 요약본(summary)이 있으면 그대로 사용. 
        # 문제점: 허위 주장을 그대로 요약해서 마치 사실인 것처럼 반환함.
        # 해결: 팩트체크 결과가 있을 경우 무조건 팩트체크 결과를 반영한 종합 요약을 생성.
        final_summary = ""
        reasons_text = ""
        for i, fc in enumerate(fact_check_results, 1):
            status = fc.get("status", "")
            explanation = fc.get("explanation", "")
            if status != "NOT_ENOUGH_INFO":
                reasons_text += f"{i}. [{status}] {explanation}\n"
                
        if reasons_text.strip():
            from pydantic import BaseModel
            class SummaryResult(BaseModel):
                summary: str
                
            system_prompt = "당신은 팩트체크 결과를 바탕으로 영상의 전체적인 신뢰성과 주의사항을 시청자에게 안내하는 요약 전문가입니다."
            user_prompt = f"""다음은 영상에서 추출된 주요 주장들의 팩트체크 결과입니다.
영상의 전체적인 신뢰성 등급은 '{trust_grade}'입니다.
이 팩트체크 결과들을 종합하여, 영상의 어떤 내용이 과장되었거나 허위인지, 시청자가 어떤 점을 주의해야 하는지 2~3줄(150자 내외)로 요약해 주세요.

[팩트체크 결과]
{reasons_text}"""
            
            try:
                summary_obj = self.llm_client.make_structured_request(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    response_model=SummaryResult,
                    stage="final_summary"
                )
                if summary_obj and summary_obj.summary:
                    final_summary = summary_obj.summary
            except Exception as e:
                final_summary = ""
                
        # LLM 호출 실패하거나 검증할 내용이 없는 경우 Fallback
        if not final_summary:
            if trust_grade == "DANGER":
                final_summary = f"명백한 허위 및 상충 내용이 발견되었습니다. 시청 시 각별한 주의가 필요합니다."
            elif trust_grade == "WARNING":
                final_summary = f"과장 또는 부분적 사실이 포함되어 있습니다. 내용을 교차 검증하시기 바랍니다."
            elif trust_grade == "GOOD":
                final_summary = f"대부분 신뢰할 수 있는 사실 기반의 내용으로 분석되었습니다."
            else:
                # 팩트체크 결과가 없을 때는 Step 2에서 만든 일반 요약문을 반환
                final_summary = state.get("summary", "추출된 주장 중 팩트체크를 진행할 만큼 명확한 정보가 부족하여 판정을 보류합니다.")

        data = AnalyzeData(
            video_id=state.get("video_id", "unknown"),
            video_title=state.get("video_title", "Unknown Video"),
            channel_name=state.get("author", "Unknown Channel"),
            trust_grade=trust_grade,
            confidence_score=confidence_score,
            summary=final_summary,
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
