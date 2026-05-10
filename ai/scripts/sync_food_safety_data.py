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
API_KEY = os.getenv("DATA_GO_KR_API_KEY")

# DB 설정 (SQLite)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, 'food_safety.db')
engine = create_engine(f'sqlite:///{DB_PATH}')

# 대상 API 설정
API_CONFIGS = {
    "htfs_info": {
        "url": "http://apis.data.go.kr/1471000/HtfsInfoService03/getHtfsItem01",
        "description": "건강기능식품정보",
        "table_name": "health_food_info",
        "num_of_rows": 500
    },
    "unfit_food": {
        "url": "http://apis.data.go.kr/1471000/PrsecImproptFoodInfoService03/getPrsecImproptFoodList01",
        "description": "검사 부적합 식품정보",
        "table_name": "unfit_food"
    }
}

def fetch_data(url: str, page_no: int = 1, num_of_rows: int = 100):
    """API에서 데이터를 페이징하여 가져옵니다."""
    params = {
        'serviceKey': API_KEY,
        'pageNo': str(page_no),
        'numOfRows': str(num_of_rows),
        'type': 'json'
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # 식약처/공공데이터포털 JSON 구조 대응
        if 'response' in data:
            body = data['response'].get('body', {})
        else:
            body = data.get('body', {})
            
        raw_items = body.get('items', [])
        total_count = int(body.get('totalCount', 0)) if body.get('totalCount') else 0
        
        # items 리스트 안의 요소가 {'item': {...}} 구조인 경우 평탄화(Flatten)
        items = []
        for it in raw_items:
            if isinstance(it, dict) and 'item' in it and len(it) == 1:
                items.append(it['item'])
            else:
                items.append(it)
        
        if not items:
            logger.warning(f"데이터 형식이 다를 수 있습니다. 응답 키: {list(data.keys())}")
            if data:
                logger.warning(f"응답 샘플: {str(data)[:500]}")
        
        return items, total_count
    except Exception as e:
        logger.error(f"Error fetching data from {url}: {e}")
        return [], 0

def sync_api_to_db(api_key: str, config: dict):
    """단일 API 데이터를 가져와 SQLite 테이블에 저장합니다."""
    url = config["url"]
    table_name = config["table_name"]
    description = config["description"]
    
    logger.info(f"[{description}] 동기화 시작 (Table: {table_name})")
    
    if "openapi.do" in url:
        logger.error(f"[{description}] 오류: 설정된 URL({url})은 API 명세서 웹페이지입니다. '개발계정 Endpoint' (http://apis.data.go.kr/...) 주소로 변경해주세요.")
        return
    
    page_no = 1
    num_of_rows = config.get("num_of_rows", 100) # 설정된 값이 없으면 안전하게 100개씩 가져옴
    all_items = []
    
    # 첫 페이지 요청으로 총 개수 확인
    items, total_count = fetch_data(url, page_no, num_of_rows)
    all_items.extend(items)
    
    if total_count > num_of_rows:
        total_pages = (total_count // num_of_rows) + 1
        logger.info(f"총 {total_count}건, {total_pages}페이지 데이터 가져오기 진행중...")
        
        for p in range(2, total_pages + 1):
            items, _ = fetch_data(url, p, num_of_rows)
            all_items.extend(items)
            
    if not all_items:
        logger.warning(f"[{description}] 저장할 데이터가 없습니다.")
        return
        
    df = pd.DataFrame(all_items)
    
    # 동기화 시간 컬럼 추가
    df['synced_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        # if_exists='replace'를 사용하여 매일 새로운 데이터로 덮어쓰기 (또는 append)
        # PK 기반의 정확한 UPSERT를 원할 경우 SQLAlchemy의 기능 활용 필요
        df.to_sql(table_name, con=engine, if_exists='replace', index=False)
        logger.info(f"[{description}] {len(df)}건의 데이터를 '{table_name}' 테이블에 성공적으로 저장했습니다.")
    except Exception as e:
        logger.error(f"[{description}] DB 저장 실패: {e}")

def main():
    if not API_KEY:
        logger.error("DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다.")
        return
        
    logger.info(f"식약처 8종 OpenAPI 동기화 시작 (DB: {DB_PATH})")
    
    for key, config in API_CONFIGS.items():
        sync_api_to_db(API_KEY, config)
        
    logger.info("모든 동기화 작업이 완료되었습니다.")

if __name__ == "__main__":
    main()
