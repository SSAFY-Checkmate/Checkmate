from fastapi import FastAPI
from core.config import settings
from routers import llm_router, claims, rag

app = FastAPI(
    title=settings.app_name,
    description="FastAPI application with LangChain integration",
    version="1.0.0",
    root_path="/ai"
)

# Include routers
app.include_router(llm_router.router)
app.include_router(claims.router)
app.include_router(rag.router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app_name": settings.app_name}