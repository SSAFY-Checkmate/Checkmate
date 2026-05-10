import os
import requests
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 환경변수 로드
load_dotenv()
API_KEY = os.getenv("FOODSAFETYKOREA_API_KEY")

# DB 설정 (SQLite) - 기존 DB 파일 재사용
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, 'food_safety.db')
engine = create_engine(f'sqlite:///{DB_PATH}')

# 식품안전나라 API 설정 
API_CONFIGS = {
    "htfs_functional": {
        "service_id": "I-0040", 
        "description": "건강기능식품 기능성 원료인정현황",
        "table_name": "fsk_functional_raw"
    },
    "htfs_ingredient": {
        "service_id": "C003", 
        "description": "건강기능식품 품목제조신고(원재료)",
        "table_name": "fsk_ingredients"
    },
    "htfs_mnf": {
        "service_id": "I0030", 
        "description": "건강기능식품 품목제조 신고사항 현황",
        "table_name": "fsk_manufacturing"
    }
}

def fetch_foodsafety_data(api_key: str, service_id: str, start_idx: int, end_idx: int):
    """식품안전나라 API에서 데이터를 가져옵니다."""
    url = f"http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/json/{start_idx}/{end_idx}"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # 정상 응답 구조: {"ServiceId": {"total_count": "100", "row": [...]}}
        # 에러 응답 구조: {"RESULT": {"CODE": "INFO-...", "MSG": "..."}}
        
        if "RESULT" in data:
            code = data["RESULT"].get("CODE")
            msg = data["RESULT"].get("MSG")
            logger.error(f"API 에러 [{code}]: {msg}")
            return [], 0
            
        if service_id in data:
            result = data[service_id]
            total_count = int(result.get("total_count", 0))
            items = result.get("row", [])
            return items, total_count
            
        logger.warning(f"알 수 없는 응답 구조입니다. 응답 키: {list(data.keys())}")
        return [], 0
        
    except Exception as e:
        logger.error(f"데이터 통신 에러 (Service: {service_id}): {e}")
        return [], 0

def sync_api_to_db(api_key: str, config: dict):
    """단일 API 데이터를 가져와 SQLite 테이블에 저장합니다."""
    service_id = config["service_id"]
    table_name = config["table_name"]
    description = config["description"]
    
    logger.info(f"[{description}] 동기화 시작 (Table: {table_name})")
    
    chunk_size = 1000 # 한 번에 가져올 개수 (식품안전나라 권장 1000개)
    all_items = []
    
    # 첫 페이지 요청으로 총 개수 확인
    items, total_count = fetch_foodsafety_data(api_key, service_id, 1, chunk_size)
    all_items.extend(items)
    
    if total_count > chunk_size:
        logger.info(f"총 {total_count}건, 분할 데이터 가져오기 진행중...")
        
        # 1001 ~ 2000, 2001 ~ 3000 형태로 인덱스 지정
        for start_idx in range(chunk_size + 1, total_count + 1, chunk_size):
            end_idx = min(start_idx + chunk_size - 1, total_count)
            items, _ = fetch_foodsafety_data(api_key, service_id, start_idx, end_idx)
            all_items.extend(items)
            
    if not all_items:
        logger.warning(f"[{description}] 저장할 데이터가 없습니다. (Service ID가 올바른지 확인해주세요)")
        return
        
    df = pd.DataFrame(all_items)
    
    # 동기화 시간 컬럼 추가
    df['synced_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        df.to_sql(table_name, con=engine, if_exists='replace', index=False)
        logger.info(f"[{description}] {len(df)}건의 데이터를 '{table_name}' 테이블에 성공적으로 저장했습니다.")
    except Exception as e:
        logger.error(f"[{description}] DB 저장 실패: {e}")

def main():
    if not API_KEY or API_KEY == "your_foodsafetykorea_api_key_here":
        logger.error("FOODSAFETYKOREA_API_KEY 환경변수가 설정되지 않았거나 기본값입니다.")
        return
        
    logger.info(f"식품안전나라 OpenAPI 동기화 시작 (DB: {DB_PATH})")
    
    for key, config in API_CONFIGS.items():
        sync_api_to_db(API_KEY, config)
        
    logger.info("모든 식품안전나라 동기화 작업이 완료되었습니다.")

if __name__ == "__main__":
    main()
