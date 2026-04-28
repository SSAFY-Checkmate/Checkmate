from services.claimify.pipeline import ClaimifyPipeline

def extract_claims_step(state: dict, llm_client) -> dict:

    cleansed_text = state.get("cleansed_text", "")
    video_title = state.get("video_title", "Unknown Video")
    
    claimify_pipeline = ClaimifyPipeline(llm_client, video_title)
    
    claims = claimify_pipeline.run(cleansed_text)
    
    state["claims"] = claims
    return state
