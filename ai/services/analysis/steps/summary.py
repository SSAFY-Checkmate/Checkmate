from core.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

async def generate_summary_step(state: dict) -> dict:
    """Step 3: Summary Generation"""
    cleaned_content = state.get("cleaned_content", "")
    
    if not cleaned_content:
        state["summary"] = "요약할 텍스트가 없습니다."
        return state
        
    llm = ChatOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or "https://gms.ssafy.io/gmsapi/api.openai.com/v1",
        model="gpt-4o-mini", 
        temperature=0.0
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """당신은 가짜 뉴스와 허위 정보를 분석하는 엘리트 콘텐츠 분석가(Expert Content Analyst)입니다.

[임무]
제공된 영상 자막의 핵심 주제와 주요 주장들을 객관적이고 명확하게 요약하십시오.

[메타 인지 및 작업 순서 (Meta-Structure)]
Step 1: 자막 전체의 메인 테마와 가장 논쟁적인/구체적인 주장 파악 (내부 사고)
Step 2: 초기 요약문 작성 (내부 사고)
Step 3: 작성된 요약문이 객관적인지, 영상의 원래 맥락을 왜곡하지 않았는지 자기 성찰(Reflexion)
Step 4: 최종 요약문 도출

[출력 규칙]
- 불필요한 인사말, 감탄사, 수식어를 완벽히 배제하십시오.
- 최종 결과물은 3~5문장의 간결하고 전문적인 한국어로 작성해야 합니다.
- 당신은 Step 1~3을 머릿속에서만 수행하고, 출력에는 절대 포함하지 마십시오. 오직 'Step 4'의 최종 요약문 텍스트만 출력해야 합니다."""),
        ("user", "다음 자막을 요약해 주세요:\n\n{text}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    # 비동기로 요약 결과 생성
    summary = await chain.ainvoke({"text": cleaned_content})
    
    print(f"\n[Step 3: Summary Generated]")
    print(f"-> {summary}")
    
    state["summary"] = summary
    return state
