import logging
from langchain_openai import OpenAIEmbeddings
from core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.base_url = settings.openai_base_url or "https://gms.ssafy.io/gmsapi/api.openai.com/v1"
        self.model = "text-embedding-3-small"
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY is not set. Embeddings might fail.")
            self.embeddings = None
        else:
            # LangChain의 OpenAIEmbeddings 사용
            self.embeddings = OpenAIEmbeddings(
                api_key=self.api_key,
                base_url=self.base_url,
                model=self.model
            )
            logger.info("Initialized EmbeddingService with LangChain OpenAIEmbeddings.")

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        if not self.embeddings:
            raise ValueError("OpenAIEmbeddings is not initialized due to missing OPENAI_API_KEY.")
            
        try:
            return self.embeddings.embed_query(text)
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise e

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not self.embeddings:
            raise ValueError("OpenAIEmbeddings is not initialized due to missing OPENAI_API_KEY.")
            
        if not texts:
            return []

        try:
            return self.embeddings.embed_documents(texts)
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise e

embedding_service = EmbeddingService()
