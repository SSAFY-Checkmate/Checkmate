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
        system_prompt = "당신은 팩트체크 결과를 시청자가 이해하기 쉽게 한 문장으로 정리해주는 요약 전문가입니다."
        user_prompt = f"""다음은 영상의 특정 자막 원본에서 추출된 여러 주장에 대한 팩트체크 결과들입니다.
자막 원본: "{data['violation_sentence']}"

[팩트체크 결과]
{reasons_text}

이 결과들을 종합하여, 이 자막의 내용 중 어떤 점이 사실이고 어떤 점이 과장/허위인지 1~2문장의 자연스러운 평문으로 요약해서 설명해 주세요. (마크다운 불릿 포인트나 기호 사용 금지)"""
        
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
