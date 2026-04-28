import asyncio
from langchain_core.runnables import RunnableLambda, RunnableSequence

from services.claimify.llm_client import LLMClient
from services.analysis.schemas import AnalyzeRequest, AnalyzeResponse
from services.analysis.steps.preprocessing import preprocess_sentences_step
from services.analysis.steps.summary import generate_summary_step
from services.analysis.steps.cleansing import text_cleansing_step
from services.analysis.steps.claim_extraction import extract_claims_step
from services.analysis.steps.rag_fact_check import rag_fact_check_step

class AnalysisPipelineService:
    def __init__(self):
        self.llm_client = LLMClient()
        
        # Build the LangChain pipeline using LCEL
        self.pipeline: RunnableSequence = (
            RunnableLambda(preprocess_sentences_step)
            | RunnableLambda(generate_summary_step)
            | RunnableLambda(text_cleansing_step)
            # Pass llm_client to extract_claims_step
            | RunnableLambda(lambda state: extract_claims_step(state, self.llm_client))
            | RunnableLambda(rag_fact_check_step)
            | RunnableLambda(self.format_response)
        )

    def format_response(self, state: dict) -> AnalyzeResponse:

        return AnalyzeResponse(
            summary=state.get("summary", ""),
            fact_check_results=state.get("fact_check_results", [])
        )

    async def run(self, request: AnalyzeRequest) -> AnalyzeResponse:
        initial_state = {
            "video_title": request.video_title,
            "text": request.text
        }
        
        # ainvoke allows running the pipeline asynchronously where possible
        result = await self.pipeline.ainvoke(initial_state)
        return result
