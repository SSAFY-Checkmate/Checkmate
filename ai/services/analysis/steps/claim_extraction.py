import asyncio
from services.claimify.pipeline import ClaimifyPipeline

async def extract_claims_step(state: dict, llm_client) -> dict:
    """Step 6: Claim Extraction using ClaimifyPipeline"""
    factual_segments = state.get("factual_segments", [])
    video_title = state.get("video_title", "Unknown Video")
    
    claimify_pipeline = ClaimifyPipeline(llm_client, video_title)
    
    async def process_segment(segment):
        start_time = segment.get("start_time", 0.0)
        text = segment.get("text", "")
        
        if not text.strip():
            return []
            
        try:
            # 비동기로 Claimify 내부 파이프라인(Selection -> Disambiguation -> Decomposition) 실행
            claims = await claimify_pipeline.run_async(text)
            # 결과에 start_time과 추출 전 원본 문장(original_text) 매핑
            return [{"start_time": start_time, "original_text": text, "claim": c} for c in claims]
        except Exception as e:
            print(f"[Claimify Error at {start_time}s] {e}")
            return []

    # 병렬로 모든 팩트 세그먼트에 대해 추출 실행 (속도 최적화)
    results = await asyncio.gather(*(process_segment(seg) for seg in factual_segments))
    
    # 2차원 리스트 평탄화
    extracted_claims = []
    for res in results:
        extracted_claims.extend(res)
        
    print(f"\n[Step 6: Claim Extraction Completed]")
    print(f"-> Extracted {len(extracted_claims)} discrete claims.")
    for c in extracted_claims:
        print(f"   - [Original: {c['original_text']}] -> [Claim: {c['claim']}]")
        
    state["extracted_claims"] = extracted_claims
    return state
