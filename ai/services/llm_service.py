from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings

def generate_response(prompt: str) -> str:
    # Initialize the LLM
    # Make sure to provide a valid API key in .env or settings
    llm = ChatOpenAI(temperature=0.7, openai_api_key=settings.openai_api_key)
    
    # Create a basic prompt template
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant."),
        ("user", "{input}")
    ])
    
    # Create a chain
    chain = prompt_template | llm
    
    # Invoke the chain
    response = chain.invoke({"input": prompt})
    return response.content
