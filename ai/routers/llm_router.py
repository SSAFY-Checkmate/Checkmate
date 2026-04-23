from fastapi import APIRouter
from pydantic import BaseModel
from services.llm_service import generate_response

router = APIRouter(
    prefix="/api",
    tags=["LLM"]
)

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    result: str

@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    result = generate_response(request.prompt)
    return GenerateResponse(result=result)
