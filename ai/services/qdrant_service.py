import logging
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from core.config import settings

logger = logging.getLogger(__name__)

# Collection Names
COLLECTIONS = [
    # 라우팅/분류
    "route_descriptions",

    # 도메인별 안정 기준 문서 (기존 유지)
    "food_health_ad_docs",
    "health_medical_docs",
    "policy_regulation_docs",
    "finance_investment_docs",
    "news_event_docs",

    # 출처 신뢰도/웹 검색 기반 추가
    "web_evidence_cache",
    "source_reliability_logs",

    # 검증 이력/피드백 추가
    "verified_claims",
    "claim_patterns",
    "community_reports"
]

class QdrantService:
    def __init__(self):
        # QDRANT_URL is loaded via pydantic_settings, default is http://qdrant:6333
        self.url = settings.qdrant_url
        try:
            self.client = QdrantClient(url=self.url)
            logger.info(f"Connected to Qdrant at {self.url}")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant at {self.url}: {e}")
            self.client = None

    def check_health(self):
        if not self.client:
            return {"status": "error", "message": "Qdrant client not initialized"}
        
        try:
            # We can check health by listing collections
            collections_res = self.client.get_collections()
            collections = [c.name for c in collections_res.collections]
            return {"status": "ok", "url": self.url, "collections": collections}
        except Exception as e:
            return {"status": "error", "url": self.url, "message": str(e)}

    def create_collections_if_not_exist(self):
        if not self.client:
            logger.error("Qdrant client is not initialized.")
            return

        try:
            existing_collections_res = self.client.get_collections()
            existing_collections = [c.name for c in existing_collections_res.collections]
            
            created = []
            for collection_name in COLLECTIONS:
                if collection_name not in existing_collections:
                    self.client.create_collection(
                        collection_name=collection_name,
                        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
                    )
                    created.append(collection_name)
                    logger.info(f"Created collection: {collection_name}")
            return created
        except Exception as e:
            logger.error(f"Error creating collections: {e}")
            raise e

    def clear_all_collections(self):
        """Drops all collections and recreates them, effectively wiping all data."""
        if not self.client:
            logger.error("Qdrant client is not initialized.")
            return {"status": "error", "message": "Qdrant client not initialized"}

        try:
            for collection_name in COLLECTIONS:
                self.client.delete_collection(collection_name=collection_name)
                logger.info(f"Deleted collection: {collection_name}")
            
            # Recreate them
            created = self.create_collections_if_not_exist()
            return {"status": "success", "message": "All collections have been cleared and recreated.", "recreated": created}
        except Exception as e:
            logger.error(f"Error clearing collections: {e}")
            return {"status": "error", "message": str(e)}

    def upsert_points(self, collection_name: str, points: list):
        if not self.client:
            logger.error("Qdrant client is not initialized.")
            return False
        
        try:
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
            return True
        except Exception as e:
            logger.error(f"Error upserting points to {collection_name}: {e}")
            raise e

    def get_vector_store(self, collection_name: str):
        """Returns a LangChain QdrantVectorStore for the given collection."""
        if not self.client:
            logger.error("Qdrant client is not initialized.")
            return None
            
        from langchain_qdrant import QdrantVectorStore
        from services.embedding_service import embedding_service
        
        if not embedding_service.embeddings:
            logger.error("Embedding service is not initialized.")
            return None
            
        return QdrantVectorStore(
            client=self.client,
            collection_name=collection_name,
            embedding=embedding_service.embeddings
        )

qdrant_service = QdrantService()
