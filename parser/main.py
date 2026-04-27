from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import json
from dotenv import load_dotenv
from api.endpoints import router as transcript_router

load_dotenv()

app = FastAPI(
    title="YouTube Transcript Extraction API",
    description="FastAPI service for extracting and cleaning YouTube transcripts with STT Fallback",
    version="1.1.0",
    root_path="/parser"
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "parser"
    }

# API 라우터 등록
app.include_router(transcript_router, prefix="/v1")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    headers = dict(request.headers)
    try:
        body_json = json.loads(body)
        body_str = json.dumps(body_json, indent=2, ensure_ascii=False)
    except Exception:
        body_str = body.decode("utf-8", errors="ignore")
        
    print("\n" + "!"*50)
    print(f"[422 ERROR] 잘못된 형식의 요청 수신 (URL: {request.url.path})")
    print(f"👇 [실제 받은 데이터 (Body)]\n{body_str}")
    print(f"👇 [거절된 사유 (에러 상세)]\n{exc.errors()}")
    print("!"*50 + "\n")
    
    print(f"[422 DEBUG] path={request.url.path} method={request.method}")
    print(f"[422 DEBUG] headers={json.dumps(headers, ensure_ascii=False)}")
    print(f"[422 DEBUG] body_bytes={len(body)}")

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body_str},
    )

# You can run this service via command:
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app --host 0.0.0.0 --port 8000 --http h11 --reload
