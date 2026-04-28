from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI LangChain App"
    openai_api_key: str = ""
    openai_base_url: str = ""
    qdrant_url: str = "http://qdrant:6333"
    enable_web_search: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
