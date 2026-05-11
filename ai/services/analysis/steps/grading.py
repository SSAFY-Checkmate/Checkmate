def grading_step(state: dict) -> dict:
    """팩트체크 결과를 바탕으로 종합 점수와 위험 등급을 판정하는 단계"""
    fact_check_results = state.get("fact_check_results", [])
    
    has_refuted = False
    score_sum = 0
    valid_claims = 0
    
    for fc in fact_check_results:
        status = fc.get("status", "")
        if status == "REFUTED":
            has_refuted = True
            score_sum += 0
            valid_claims += 1
        elif status == "PARTIALLY_SUPPORTED":
            score_sum += 50
            valid_claims += 1
        elif status == "SUPPORTED":
            score_sum += 100
            valid_claims += 1
            
    if valid_claims > 0:
        confidence_score = int(score_sum / valid_claims)
    else:
        confidence_score = 0
        
    if valid_claims == 0:
        trust_grade = "UNKNOWN"
    elif confidence_score < 50 or has_refuted:
        trust_grade = "DANGER"
    elif confidence_score < 90:
        trust_grade = "WARNING"
    else:
        trust_grade = "GOOD"
        
    state["confidence_score"] = confidence_score
    state["trust_grade"] = trust_grade
    return state
