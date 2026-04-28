import os

from fastapi import APIRouter
from qdrant_client import QdrantClient

router = APIRouter(prefix="/v1/rag", tags=["rag"])


def get_qdrant_client() -> QdrantClient:
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    return QdrantClient(url=qdrant_url)


@router.get("/qdrant/health")
def qdrant_health():
    client = get_qdrant_client()
    collections = client.get_collections()

    return {
        "status": "ok",
        "qdrant_url": os.getenv("QDRANT_URL", "http://localhost:6333"),
        "collections": [collection.name for collection in collections.collections],
    }