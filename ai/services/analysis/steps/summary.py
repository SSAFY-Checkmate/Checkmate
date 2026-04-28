from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

async def generate_summary_step(state: dict) -> dict:
    """Step 3: Summary Generation"""
    cleaned_content = state.get("cleaned_content", "")
    
    if not cleaned_content:
        state["summary"] = "요약할 텍스트가 없습니다."
        return state
        
    # LangChain LLM 및 프롬프트 설정 (환경 변수에 OPENAI_API_KEY가 설정되어 있어야 합니다)
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "당신은 영상 콘텐츠 내용 요약 전문가입니다. 제공된 자막 텍스트를 바탕으로 영상의 전체적인 핵심 주제와 주요 주장을 3~5문장으로 명확하게 요약해 주세요. 불필요한 인삿말이나 수식어는 제외하고 핵심만 전달하세요."),
        ("user", "다음 자막을 요약해 주세요:\n\n{text}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    # 비동기로 요약 결과 생성
    summary = await chain.ainvoke({"text": cleaned_content})
    
    print(f"\n[Step 3: Summary Generated]")
    print(f"-> {summary}")
    
    state["summary"] = summary
    return state
