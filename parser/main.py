from fastapi import FastAPI
from dotenv import load_dotenv
from api.endpoints import router as transcript_router

load_dotenv()

app = FastAPI(
    title="YouTube Transcript Extraction API",
    description="FastAPI service for extracting and cleaning YouTube transcripts with STT Fallback",
    version="1.1.0"
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "parser"
    }

# API 라우터 등록
app.include_router(transcript_router, prefix="/v1")

# You can run this service via command:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload