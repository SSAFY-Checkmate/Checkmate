from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.qdrant_service import qdrant_service
from services.rag_seed_service import rag_seed_service
from services.embedding_service import embedding_service

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)

class EmbeddingRequest(BaseModel):
    text: str

@router.get("/qdrant/health", summary="Qdrant 연결 상태 확인", description="Qdrant DB 서버와의 연결 상태를 점검하고, 현재 생성되어 있는 컬렉션 목록을 반환합니다.")
async def check_qdrant_health():
    result = qdrant_service.check_health()
    if result.get("status") == "error":
        raise HTTPException(status_code=503, detail=result.get("message", "Qdrant connection error"))
    return result

@router.post("/init", summary="RAG 컬렉션 및 Seed 초기화", description="Qdrant에 필요한 10개의 컬렉션을 생성하고, `route_descriptions.json` 데이터가 존재할 경우 GMS 임베딩을 통해 벡터 DB에 업서트(초기화)합니다. 서버 시작 시 자동 실행되지 않으므로 수동 호출이 필요합니다.")
async def init_rag_collections():
    try:
        result = rag_seed_service.initialize_collections_and_seed()
        return {
            "status": "success",
            "message": "Initialization completed.",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embedding/test", summary="GMS Embedding API 테스트", description="입력받은 텍스트를 SSAFY GMS Gateway(text-embedding-3-small)를 통해 임베딩 벡터로 변환하고, 생성된 벡터의 차원 수(1536) 및 프리뷰 값을 반환합니다.")
async def test_embedding(request: EmbeddingRequest):
    try:
        embedding = embedding_service.embed_text(request.text)
        return {
            "status": "success",
            "dimension": len(embedding),
            "preview": embedding[:5]  # return first 5 items as preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from services.analysis.steps.semantic_router import semantic_router

class RouteRequest(BaseModel):
    claim: str

@router.post("/routing/test", summary="Semantic Router 테스트", description="입력된 주장을 임베딩하여 Qdrant의 route_descriptions와 비교하고, 규칙에 따라 적절한 도메인 라우트를 추천합니다.")
async def test_semantic_routing(request: RouteRequest):
    try:
        result = semantic_router.route_claim(request.claim)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))