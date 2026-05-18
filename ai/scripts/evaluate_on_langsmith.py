import os
import json
import asyncio
import traceback
from uuid import uuid4
import sys

# 환경변수 로드
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langsmith import Client, evaluate, aevaluate
from services.analysis.pipeline import AnalysisPipelineService
from services.analysis.schemas import AnalyzeRequest
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

# langsmith 클라이언트
client = Client()

# 평가할 데이터셋 이름
DATASET_NAME = "Fact-Check-Evaluation-Dataset-v1"

def create_dataset_if_not_exists(json_path: str):
    """LangSmith에 데이터셋을 생성합니다."""
    datasets = list(client.list_datasets(dataset_name=DATASET_NAME))
    if datasets:
        print(f"Dataset '{DATASET_NAME}' already exists.")
        return datasets[0]
        
    print(f"Creating dataset '{DATASET_NAME}'...")
    dataset = client.create_dataset(
        dataset_name=DATASET_NAME,
        description="Dataset for evaluating RAG fact-check pipeline"
    )
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for item in data:
        client.create_example(
            inputs=item.get("inputs", {}),
            outputs=item.get("outputs", {}),
            dataset_id=dataset.id
        )
        
    print("Dataset created successfully.")
    return dataset

class EvalResult(BaseModel):
    faithfulness_score: float = Field(description="Score between 0.0 and 1.0. 1.0 if the reason is supported by the context.")
    relevance_score: float = Field(description="Score between 0.0 and 1.0. 1.0 if the reason addresses the violation.")
    comment: str = Field(description="Brief explanation")

def custom_langchain_evaluator(run, example):
    """
    RAGAS 대신 직접 LangChain과 GPT-4o-mini를 사용하여 평가하는 커스텀 평가기입니다.
    안정적이고 직관적인 동작을 보장합니다.
    """
    try:
        claim = example.inputs.get("content", "")
        
        data = run.outputs.get("data", {})
        if not data:
            return [{"key": "faithfulness", "score": 0.0}, {"key": "answer_relevancy", "score": 0.0}]
            
        violations = data.get("violations", [])
        if not violations:
            return [{"key": "faithfulness", "score": 1.0}, {"key": "answer_relevancy", "score": 1.0}]
            
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(EvalResult)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert evaluator for a fact-checking AI pipeline. Your job is to evaluate the quality of the AI's violation detection."),
            ("human", "Video Script (Context):\n{context}\n\nViolation Sentence Detected:\n{sentence}\n\nAI's Reason for Violation:\n{reason}\n\nEvaluate the AI's Reason based on:\n1. Faithfulness: Is the AI's reason logically supported by the Video Script? (1.0 if yes, 0.0 if no)\n2. Relevance: Does the reason accurately explain why the 'Violation Sentence' is problematic? (1.0 if yes, 0.0 if no)")
        ])
        
        chain = prompt | llm
        
        total_faith = 0.0
        total_rel = 0.0
        comments = []
        
        for v in violations:
            sentence = v.get("violation_sentence", "")
            reason = v.get("reason", "")
            
            res = chain.invoke({"context": claim, "sentence": sentence, "reason": reason})
            total_faith += res.faithfulness_score
            total_rel += res.relevance_score
            comments.append(res.comment)
            
        avg_faith = total_faith / len(violations)
        avg_rel = total_rel / len(violations)
        
        return [
            {"key": "faithfulness", "score": avg_faith, "comment": " | ".join(comments)},
            {"key": "answer_relevancy", "score": avg_rel, "comment": " | ".join(comments)}
        ]
        
    except Exception as e:
        traceback.print_exc()
        return [
            {"key": "faithfulness", "score": 0.0, "comment": f"Error: {str(e)}"},
            {"key": "answer_relevancy", "score": 0.0, "comment": f"Error: {str(e)}"}
        ]

async def target_pipeline_wrapper(inputs: dict) -> dict:
    """
    파이프라인 모킹(Mock): 
    실제 파이프라인을 동작시키지 않고 test_dataset.json에 저장된 outputs를 그대로 반환하여 
    RAGAS 평가만 먼저 테스트합니다.
    """
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "evaluation", "test_dataset.json")
    with open(json_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
        
    for item in raw_data:
        # videoId로 현재 실행 중인 입력과 매칭
        if item.get("inputs", {}).get("videoId") == inputs.get("videoId"):
            return item.get("outputs", {})
            
    return {}

def run_evaluation():
    # 1. 데이터셋 확인 및 생성
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "evaluation", "test_dataset.json")
    dataset = create_dataset_if_not_exists(json_path)
    
    print("\nStarting evaluation using LangSmith and Custom LangChain Evaluator...")
    
    # asyncio.run 을 위해 wrapper를 동기 함수처럼 동작하게 래핑
    async def a_run_eval():
        results = await aevaluate(
            target_pipeline_wrapper,
            data=DATASET_NAME,
            evaluators=[custom_langchain_evaluator], # 직접 만든 안정적인 커스텀 평가기 사용
            experiment_prefix="Custom-Eval",
            max_concurrency=2 # 너무 높으면 RateLimit 걸릴 수 있음
        )
        return results
        
    asyncio.run(a_run_eval())
    print("\nEvaluation completed! Check your LangSmith Dashboard.")

if __name__ == "__main__":
    run_evaluation()
