import asyncio
from pydantic import BaseModel

class ReasonSummary(BaseModel):
    summary: str

async def summarize_violation_step(state: dict, llm_client) -> dict:
    """RAG 결과를 자막 문장 단위로 모아서 한 문장으로 요약하는 단계"""
    fact_check_results = state.get("fact_check_results", [])
    
    # 1. 자막 단위로 Violation 그룹핑
    grouped_violations = {}
    for fc in fact_check_results:
        orig = fc.get("original_text", fc.get("claim", ""))
        start = fc.get("start_time", 0.0)
        claim = fc.get("claim", "")
        reason = fc.get("explanation", "")
        status = fc.get("status", "UNKNOWN")
        
        key = (orig, start)
        if key not in grouped_violations:
            grouped_violations[key] = {
                "start_time": start,
                "violation_sentence": orig,
                "reasons": []
            }
        grouped_violations[key]["reasons"].append(f"- 주장: {claim} | 판정: {status} | 근거: {reason}")
        
    async def summarize_violation(data):
        reasons_text = "\n".join(data["reasons"])
        system_prompt = "당신은 팩트체크 결과를 시청자가 이해하기 쉽게 정리해주는 요약 전문가입니다."
        user_prompt = f"""다음은 영상의 특정 자막 원본에서 추출된 여러 주장에 대한 팩트체크 결과들입니다.
자막 원본: "{data['violation_sentence']}"

[팩트체크 결과]
{reasons_text}

이 결과들을 종합하여, 이 자막의 내용 중 어떤 점이 사실이고 어떤 점이 과장/허위인지 1~2문장의 자연스러운 평문으로 요약해서 설명해 주세요. 
(마크다운 불릿 포인트나 기호 사용 금지)

[중요 1] '첫 번째 출처', '두 번째 출처', '문서 [1]'과 같은 모호한 지시대명사는 절대 사용하지 마세요. 대신 팩트체크 결과에 적혀있는 실제 '기관명' 또는 '자체 상식'을 직접 명시해야 합니다.

[중요 2] 응답의 통일성을 위해, 문장 중간에 출처를 섞어 쓰지 말고 요약문 맨 마지막에 괄호를 사용하여 출처를 한 번에 표기하세요.
출력 템플릿: "[자연스러운 요약 평문 1~2문장] (출처: [기관명 또는 자체 검증 분석])"
예시: "가르시니아캄보지아 추출물의 내장지방 감소 효과는 과학적 근거가 부족하여 과장된 표현입니다. (출처: 자체 검증 분석)"""
        
        try:
            summary_obj = await llm_client.make_structured_request_async(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=ReasonSummary,
                stage="violation_reason_summary"
            )
            final_reason = summary_obj.summary if summary_obj and summary_obj.summary else reasons_text
        except Exception as e:
            print(f"Violation summary failed: {e}")
            final_reason = reasons_text
            
        return {
            "start_time": data["start_time"],
            "violation_sentence": data["violation_sentence"],
            "reason": final_reason
        }

    summarized_violations = []
    if grouped_violations:
        tasks = [summarize_violation(data) for data in grouped_violations.values()]
        summarized_violations = await asyncio.gather(*tasks)
        
    state["summarized_violations"] = summarized_violations
    return state
