import os
import time
import logging
from typing import List, Optional
from pydantic import BaseModel, Field

from services.claimify.llm_client import LLMClient
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse, AnalyzeData, Violation

logger = logging.getLogger(__name__)

class LLMViolation(BaseModel):
    start_time: float = Field(..., description="해당 발언이 등장하는 자막의 시작 시간(초). 세그먼트에 명시된 시간을 사용하세요.")
    violation_sentence: str = Field(..., description="문제가 되는(또는 팩트체크가 필요한) 원래의 자막 문장")
    reason: str = Field(..., description="해당 문장의 사실 여부 판정 결과와 그 증거/근거를 상세히 작성하세요.")

class LLMAnalyzeResult(BaseModel):
    trust_grade: str = Field(..., description="전체 영상의 신뢰도 등급. 다음 중 하나여야 합니다: VERY_HIGH, HIGH, MODERATE, LOW, VERY_LOW")
    confidence_score: int = Field(..., description="신뢰도 점수 (0 ~ 100)")
    summary: str = Field(..., description="영상 전체 내용 중 허위/과장/검증된 사실 등에 대한 종합 요약 (2-3문장)")
    violations: List[LLMViolation] = Field(..., description="팩트체크가 필요한 주요 주장 및 판정 결과 목록")

class OneShotAnalysisService:
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        # 환경변수에서 ONESHOT_LLM_MODEL을 읽거나, 없으면 기본 모델 사용
        raw_model = os.getenv("ONESHOT_LLM_MODEL", "gpt-4o")
        model_name = raw_model.split('#')[0].strip(' "\'')
        self.llm_client = LLMClient(model=model_name)
        
        self.system_prompt = """당신은 유튜브 영상의 자막을 분석하여 허위·과장 광고 및 건강/의학적 주장을 검증하는 고도화된 팩트체커입니다.
다음은 유튜브 영상의 정보와 전체 자막(각 세그먼트별 시작 시간 포함)입니다.

[작업 지시사항]
1. 팩트체크가 필요한 자막 추출: 단순한 인사말이나 일상적인 대화는 무시하고, "식품의 효능", "건강기능식품의 효과", "질병 예방/치료", "다이어트", "특정 성분의 부작용 없음" 등 시청자에게 오인을 줄 수 있거나 사실 검증이 필요한 핵심 주장을 하는 자막만 선별하세요.
2. 사실 여부 확인 및 증거 덧붙이기: 선별된 각 주장에 대해, 당신의 자체 지식(사전 학습된 보편적, 의학적, 과학적 사실 및 관련 법령/가이드라인 지식)을 동원하여 사실(SUPPORTED), 일부 사실(PARTIALLY_SUPPORTED), 거짓(REFUTED), 또는 과장/오인(MISLEADING) 여부를 명확히 판정하고 그 이유와 증거를 'reason' 필드에 구체적으로 설명하세요.
3. 종합 평가: 영상 전체적인 주장의 신빙성을 고려하여 신뢰도 등급(VERY_HIGH, HIGH, MODERATE, LOW, VERY_LOW)과 0~100 사이의 점수를 매기고, 전체 요약을 작성하세요.

[출력 형식]
반드시 제공된 JSON 스키마 구조(LLMAnalyzeResult)를 엄격히 준수하여 응답하세요. Markdown 백틱(```json) 없이 순수 JSON 객체만 반환하거나 도구를 지원하는 경우 구조화된 출력을 사용하세요."""

    async def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        start_time_ms = int(time.time() * 1000)
        
        # 입력 데이터 준비
        video_title = request.title or "Unknown Video"
        author = request.author or "Unknown Channel"
        
        transcript_text = ""
        if request.segments:
            for s in request.segments:
                transcript_text += f"[{s.start_time:.1f}s] {s.text}\n"
        else:
            transcript_text = request.content
            
        user_prompt = f"""[영상 정보]
제목: {video_title}
채널명: {author}

[자막 스크립트]
{transcript_text}

위 자막에서 팩트체크가 필요한 주요 주장을 찾아 사실 여부를 검증하고, 전체적인 신뢰도를 평가해 주세요.
"""
        
        try:
            logger.info(f"Starting One-Shot Analysis for video: {video_title}")
            
            result: Optional[LLMAnalyzeResult] = await self.llm_client.make_structured_request_async(
                system_prompt=self.system_prompt,
                user_prompt=user_prompt,
                response_model=LLMAnalyzeResult,
                stage="oneshot_analysis"
            )
            
            elapsed_ms = int(time.time() * 1000) - start_time_ms
            
            if not result:
                logger.error("LLM returned no result for one-shot analysis.")
                return AnalyzeResponse(
                    status=500,
                    message="LLM 분석 중 오류가 발생했습니다.",
                    data=None
                )
                
            # 응답 매핑
            violations = [
                Violation(
                    start_time=v.start_time,
                    violation_sentence=v.violation_sentence,
                    reason=v.reason
                ) for v in result.violations
            ]
            
            analyze_data = AnalyzeData(
                video_id=request.video_id,
                video_title=video_title,
                channel_name=author,
                channel_id=request.channel_id,
                trust_grade=result.trust_grade,
                confidence_score=result.confidence_score,
                summary=result.summary,
                violations=violations,
                elapsed_ms=elapsed_ms
            )
            
            return AnalyzeResponse(
                status=200,
                message="요청이 성공했습니다.",
                data=analyze_data
            )
            
        except Exception as e:
            logger.error(f"Error in one-shot analysis: {e}")
            return AnalyzeResponse(
                status=500,
                message=f"서버 내부 오류: {str(e)}",
                data=None
            )
