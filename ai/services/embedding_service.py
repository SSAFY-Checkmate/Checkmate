import logging
from openai import OpenAI
from core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.api_key = settings.gms_key
        self.base_url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1"
        self.model = "text-embedding-3-small"
        
        if not self.api_key:
            logger.warning("GMS_KEY is not set. Embeddings might fail.")
            self.client = None
        else:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
            logger.info("Initialized EmbeddingService with GMS Gateway.")

    def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        if not self.client:
            raise ValueError("OpenAI Client is not initialized due to missing GMS_KEY.")
            
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise e

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if not self.client:
            raise ValueError("OpenAI Client is not initialized due to missing GMS_KEY.")
            
        if not texts:
            return []

        try:
            response = self.client.embeddings.create(
                input=texts,
                model=self.model
            )
            # Ensure the embeddings match the order of input texts
            embeddings = [data.embedding for data in sorted(response.data, key=lambda x: x.index)]
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise e

embedding_service = EmbeddingService()
