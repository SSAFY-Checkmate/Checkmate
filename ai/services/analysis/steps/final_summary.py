from pydantic import BaseModel

class FinalSummaryResult(BaseModel):
    summary: str

async def final_summary_step(state: dict, llm_client) -> dict:
    """영상의 종합 신뢰도 등급과 팩트체크 결과를 바탕으로 최종 2~3줄 요약문을 생성하는 단계"""
    fact_check_results = state.get("fact_check_results", [])
    trust_grade = state.get("trust_grade", "UNKNOWN")
    
    final_summary = ""
    reasons_text_global = ""
    
    for i, fc in enumerate(fact_check_results, 1):
        status = fc.get("status", "")
        explanation = fc.get("explanation", "")
        if status != "NOT_ENOUGH_INFO":
            reasons_text_global += f"{i}. [{status}] {explanation}\n"
            
    if reasons_text_global.strip():
        system_prompt = "당신은 팩트체크 결과를 바탕으로 영상의 전체적인 신뢰성과 주의사항을 시청자에게 안내하는 요약 전문가입니다."
        user_prompt = f"""다음은 영상에서 추출된 주요 주장들의 팩트체크 결과입니다.
영상의 전체적인 신뢰성 등급은 '{trust_grade}'입니다.
이 팩트체크 결과들을 종합하여, 영상의 어떤 내용이 과장되었거나 허위인지, 시청자가 어떤 점을 주의해야 하는지 2~3줄(150자 내외)로 요약해 주세요.

[팩트체크 결과]
{reasons_text_global}"""
        
        try:
            summary_obj = await llm_client.make_structured_request_async(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                response_model=FinalSummaryResult,
                stage="final_summary"
            )
            if summary_obj and summary_obj.summary:
                final_summary = summary_obj.summary
        except Exception as e:
            print(f"Final summary failed: {e}")
            final_summary = ""
            
    # Fallback
    if not final_summary:
        if trust_grade == "DANGER":
            final_summary = f"명백한 허위 및 상충 내용이 발견되었습니다. 시청 시 각별한 주의가 필요합니다."
        elif trust_grade == "WARNING":
            final_summary = f"과장 또는 부분적 사실이 포함되어 있습니다. 내용을 교차 검증하시기 바랍니다."
        elif trust_grade == "GOOD":
            final_summary = f"대부분 신뢰할 수 있는 사실 기반의 내용으로 분석되었습니다."
        else:
            final_summary = state.get("summary", "추출된 주장 중 팩트체크를 진행할 만큼 명확한 정보가 부족하여 판정을 보류합니다.")
            
    state["final_summary"] = final_summary
    return state
