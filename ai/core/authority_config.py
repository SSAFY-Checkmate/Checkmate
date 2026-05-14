# 출처 등급별 Base Score
GRADE_SCORES = {
    "VERY_HIGH": 95,
    "HIGH": 80,
    "MEDIUM": 50,
    "LOW": 30,
    "VERY_LOW": 10
}

# 도메인별 출처 권위도 설정 (Whitelist/Blacklist 역할 겸임)
# 추가 도메인들이 필요에 따라 업데이트될 수 있습니다.
AUTHORITY_SOURCES = {
    # 정부/공식 기관 (VERY_HIGH)
    "mfds.go.kr": {"name": "식품의약품안전처", "grade": "VERY_HIGH"},
    "foodsafetykorea.go.kr": {"name": "식품안전나라", "grade": "VERY_HIGH"},
    "law.go.kr": {"name": "국가법령정보센터", "grade": "VERY_HIGH"},
    "kdca.go.kr": {"name": "질병관리청", "grade": "VERY_HIGH"},
    "snuh.org": {"name": "서울대학교병원", "grade": "VERY_HIGH"},
    "amc.seoul.kr": {"name": "서울아산병원", "grade": "VERY_HIGH"},
    "severance.healthcare": {"name": "세브란스병원", "grade": "VERY_HIGH"},
    "nih.go.kr": {"name": "국립보건연구원", "grade": "VERY_HIGH"},
    "hira.or.kr": {"name": "건강보험심사평가원", "grade": "VERY_HIGH"},
    "nhis.or.kr": {"name": "국민건강보험공단", "grade": "VERY_HIGH"},
    "kams.or.kr": {"name": "대한의학회", "grade": "VERY_HIGH"},
    "nmc.or.kr": {"name": "국립중앙의료원", "grade": "VERY_HIGH"},
    
    # 일반 정부기관/주요 언론사/협회 (HIGH)
    "go.kr": {"name": "대한민국 정부", "grade": "HIGH"},
    "yna.co.kr": {"name": "연합뉴스", "grade": "HIGH"},
    "kbs.co.kr": {"name": "KBS", "grade": "HIGH"},
    "kca.go.kr": {"name": "한국소비자원", "grade": "HIGH"},
    "kma.org": {"name": "대한의사협회", "grade": "HIGH"},
    "sbs.co.kr": {"name": "SBS", "grade": "HIGH"},
    "mbc.co.kr": {"name": "MBC", "grade": "HIGH"},
    "ytn.co.kr": {"name": "YTN", "grade": "HIGH"},
    
    # 포털 뉴스 등 (MEDIUM)
    "news.naver.com": {"name": "네이버 뉴스", "grade": "MEDIUM"},
    "v.daum.net": {"name": "다음 뉴스", "grade": "MEDIUM"},
    
    # 블로그/쇼핑몰 등 (LOW / VERY_LOW)
    "blog.naver.com": {"name": "네이버 블로그", "grade": "LOW"},
    "tistory.com": {"name": "티스토리", "grade": "LOW"},
    "brunch.co.kr": {"name": "브런치", "grade": "LOW"},
    "shopping.naver.com": {"name": "네이버 쇼핑", "grade": "VERY_LOW"},
    "coupang.com": {"name": "쿠팡", "grade": "VERY_LOW"}
}

def get_domain_authority(url: str) -> dict:
    """
    주어진 URL의 도메인을 분석하여 출처 권위도(Grade 및 Base Score)를 반환합니다.
    """
    import urllib.parse
    try:
        parsed_url = urllib.parse.urlparse(url)
        # 네트워크 위치(netloc)에서 호스트명 추출
        hostname = parsed_url.netloc.lower()
        if not hostname:
            # url이 schema 없이 시작할 경우 (예: mfds.go.kr/...)
            hostname = url.split('/')[0].lower()

        # 도메인 매칭 로직 (서브도메인 포함 처리)
        for domain, info in AUTHORITY_SOURCES.items():
            if hostname == domain or hostname.endswith("." + domain):
                return {
                    "grade": info["grade"],
                    "score": GRADE_SCORES[info["grade"]],
                    "name": info["name"]
                }
                
        # 매칭되는 도메인이 없는 경우
        # .go.kr 이나 .ac.kr 등 신뢰할 수 있는 최상위 도메인 패턴 추가 확인
        if hostname.endswith(".go.kr") or hostname.endswith(".ac.kr"):
            return {"grade": "HIGH", "score": GRADE_SCORES["HIGH"], "name": "기타 공식/학술 기관"}
            
        return {"grade": "UNKNOWN", "score": GRADE_SCORES["LOW"], "name": "알 수 없는 출처"}
        
    except Exception:
        return {"grade": "UNKNOWN", "score": GRADE_SCORES["LOW"], "name": "알 수 없는 출처"}
