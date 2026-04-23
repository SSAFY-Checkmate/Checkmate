from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI LangChain App"
    openai_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
