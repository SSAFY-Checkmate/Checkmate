from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI LangChain App"
    openai_api_key: str = ""
    openai_base_url: str = ""
    qdrant_url: str = "http://qdrant:6333"
    enable_web_search: bool = False
    
    # Kafka & Redis Settings
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "ai-analysis-group"
    kafka_auto_offset_reset: str = "earliest"
    topic_analysis_requested: str = "analysis.requested"
    topic_analysis_completed: str = "analysis.completed"
    topic_analysis_failed: str = "analysis.failed"
    redis_url: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
