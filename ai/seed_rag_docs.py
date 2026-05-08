import os
import re
import uuid
import logging
import asyncio
from typing import List, Dict, Any
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

# 환경 변수 강제 설정 (Tor 프록시 등 우회, 로컬 테스트용)
# 만약 배포 환경이라면 이 부분은 주석 처리하거나 환경 변수에서 읽어오도록 수정하세요.
os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""

# 기존 서비스 모듈 임포트
from services.qdrant_service import qdrant_service
from services.embedding_service import embedding_service

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "rag", "rag_ready")
TARGET_COLLECTION = "food_health_ad_docs"

# 정규식 패턴: "- 키: 값" 형태의 메타데이터 추출용
METADATA_PATTERN = re.compile(r"^-\s*([^:]+):\s*(.*)$", re.MULTILINE)

def process_markdown_file(file_path: str) -> List[Dict[str, Any]]:
    logger.info(f"Processing file: {file_path}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. 마크다운 헤더 스플리터 적용
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    md_header_splits = markdown_splitter.split_text(content)

    # 2. 본문 분할을 위한 스플리터
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    processed_chunks = []

    for idx, doc in enumerate(md_header_splits):
        text = doc.page_content
        metadata = doc.metadata.copy()
        metadata["source_file"] = os.path.basename(file_path)

        # 메타데이터 추출 (- 키: 값)
        explicit_metadata = {}
        cleaned_text_lines = []
        
        for line in text.split("\n"):
            match = METADATA_PATTERN.match(line)
            # RAG 검색용 요약, chunk_id, source_type, domain 등 주요 키워드인지 확인
            if match and match.group(1).strip() in ["chunk_id", "source_type", "domain", "RAG 검색용 요약", "관련 근거", "용어", "정의"]:
                key = match.group(1).strip()
                val = match.group(2).strip()
                explicit_metadata[key] = val
            else:
                # 메타데이터가 아닌 일반 본문 줄
                cleaned_text_lines.append(line)
        
        # 딕셔너리 업데이트
        metadata.update(explicit_metadata)
        
        # 헤더 조립 (제목)
        headers = [metadata.get(f"Header {i}") for i in range(1, 4) if metadata.get(f"Header {i}")]
        title_str = " > ".join(headers) if headers else "제목 없음"
        
        summary_str = metadata.get("RAG 검색용 요약", "")
        
        cleaned_main_text = "\n".join(cleaned_text_lines).strip()
        
        # 만약 본문이 없다면 굳이 저장할 필요 없음
        if not cleaned_main_text and not summary_str:
            continue

        # 3. 2차 청킹 (본문이 너무 길 경우 대비)
        # 본문 텍스트만 분할
        if len(cleaned_main_text) > 1500:
            sub_chunks = text_splitter.split_text(cleaned_main_text)
        else:
            sub_chunks = [cleaned_main_text]

        for sub_idx, sub_chunk in enumerate(sub_chunks):
            # 최종 임베딩될 텍스트 조립
            text_to_embed = f"[제목] {title_str}\n"
            if summary_str:
                text_to_embed += f"[요약] {summary_str}\n"
            if sub_chunk:
                text_to_embed += f"[본문]\n{sub_chunk}"
                
            # 복사해서 서브 청크용 메타데이터 생성
            sub_metadata = metadata.copy()
            sub_metadata["sub_chunk_index"] = sub_idx
            
            # 고유 ID 생성 (chunk_id가 명시되어 있으면 활용, 아니면 UUID)
            base_id = metadata.get("chunk_id", f"{os.path.basename(file_path)}_{idx}")
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{base_id}_{sub_idx}"))
            
            processed_chunks.append({
                "id": point_id,
                "text_to_embed": text_to_embed.strip(),
                "metadata": sub_metadata
            })

    return processed_chunks

def seed_markdown_documents():
    logger.info("Starting RAG document seeding process...")
    
    # 컬렉션 생성 확인
    qdrant_service.create_collections_if_not_exist()
    vector_store = qdrant_service.get_vector_store(TARGET_COLLECTION)
    
    if not vector_store:
        logger.error(f"Failed to get vector store for {TARGET_COLLECTION}. Exiting.")
        return {"status": "error", "message": f"Failed to get vector store for {TARGET_COLLECTION}"}

    all_texts = []
    all_metadatas = []
    all_ids = []

    # 1. 파일 목록 읽기
    if not os.path.exists(DATA_DIR):
        logger.error(f"Data directory does not exist: {DATA_DIR}")
        return {"status": "error", "message": f"Data directory does not exist: {DATA_DIR}"}

    md_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".md")]
    logger.info(f"Found {len(md_files)} markdown files in {DATA_DIR}")

    # 2. 파일 파싱 및 청크 생성
    for file_name in md_files:
        file_path = os.path.join(DATA_DIR, file_name)
        chunks = process_markdown_file(file_path)
        
        for chunk in chunks:
            all_texts.append(chunk["text_to_embed"])
            all_metadatas.append(chunk["metadata"])
            all_ids.append(chunk["id"])
            
    logger.info(f"Total chunks extracted: {len(all_texts)}")

    # 3. Qdrant에 업서트
    if all_texts:
        logger.info(f"Upserting {len(all_texts)} chunks into Qdrant collection: {TARGET_COLLECTION}...")
        
        # 100개씩 배치 처리 (옵션)
        batch_size = 100
        for i in range(0, len(all_texts), batch_size):
            end_idx = min(i + batch_size, len(all_texts))
            logger.info(f"Upserting batch {i} to {end_idx}...")
            vector_store.add_texts(
                texts=all_texts[i:end_idx],
                metadatas=all_metadatas[i:end_idx],
                ids=all_ids[i:end_idx]
            )
        
        logger.info("Upsert completed successfully!")
        return {"status": "success", "message": "Markdown seeding completed", "total_chunks": len(all_texts), "files_processed": len(md_files)}
    else:
        logger.info("No chunks to upsert.")
        return {"status": "skipped", "message": "No chunks found to upsert"}

if __name__ == "__main__":
    seed_markdown_documents()
