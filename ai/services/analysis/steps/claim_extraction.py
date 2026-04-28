from services.claimify.pipeline import ClaimifyPipeline

def extract_claims_step(state: dict, llm_client) -> dict:

    cleansed_text = state.get("cleansed_text", "")
    video_title = state.get("video_title", "Unknown Video")
    
    # claimify_pipeline = ClaimifyPipeline(llm_client, video_title)
    # claims = claimify_pipeline.run(cleansed_text)
    
    # Mocking for backend integration testing
    claims = [
        "이 영상에서 소개하는 약을 먹으면 하루 만에 10kg이 빠집니다."
    ]
    
    state["claims"] = claims
    return state
