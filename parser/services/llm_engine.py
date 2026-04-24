import os
import requests
import logging

logger = logging.getLogger(__name__)

import json

def analyze_transcript_with_llm(parsed_data: dict) -> dict:
    """
    SSAFY GMS (OpenAI API 호환)를 사용하여 스크립트(메타데이터 포함)의 신뢰도를 분석하고 
    Spring Entity(AnalysisResult) 구조의 dict를 반환합니다.
    """
    gms_key = os.getenv("GMS_KEY")
    model_version = os.getenv("GMS_MODEL", "gpt-4o-mini")
    
    default_result = {
        "youtubeInfo": {
            "channelId": parsed_data.get("channel_id") or "알 수 없음",
            "channelName": parsed_data.get("author") or "알 수 없음",
            "videoId": parsed_data.get("video_id") or "알 수 없음",
            "videoTitle": parsed_data.get("title") or "알 수 없음"
        },
        "analysisResult": {
            "trustGrade": "UNKNOWN",
            "confidenceScore": 0,
            "summary": "LLM 분석이 불가능합니다.",
            "modelVersion": model_version
        },
        "violations": []
    }

    if not gms_key:
        logger.warning("GMS_KEY 환경 변수가 없어 LLM 분석을 건너뜁니다.")
        default_result["analysisResult"]["summary"] = "LLM 분석을 위한 GMS_KEY가 설정되지 않았습니다."
        return default_result

    url = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {gms_key}",
        "Content-Type": "application/json"
    }
    
    prompt = """
다음은 유튜브 영상의 정보와 전체 자막(스크립트)입니다. 
이 내용을 바탕으로 영상의 신뢰도를 분석하여 아래의 JSON 형식으로만 응답해주세요.

[영상 정보]
- 영상 제목: {title}
- 채널/작성자: {author}
- 언어: {language}

[자막 내용]
{content}

[응답 형식 (반드시 JSON)]
{{
  "trustGrade": "신뢰 등급 (GOOD, WARNING, DANGER 중 하나로 작성)",
  "confidenceScore": 0에서 100 사이의 신뢰도 점수 (정수),
  "summary": "핵심 주장 요약 및 팩트체크 요약 결과 텍스트",
  "violations": [
    {{
      "startTime": 허위/과장 발언이 나온 추정 시간 (초 단위 정수, 모르면 0),
      "violationSentence": "실제 허위/과장 위반 발언 문장",
      "reason": "해당 발언이 위반인 근거 및 팩트체크 내용"
    }}
  ]
}}
"""
    
    title = parsed_data.get("title") or "알 수 없음"
    author = parsed_data.get("author") or "알 수 없음"
    language = parsed_data.get("language") or "알 수 없음"
    content_text = parsed_data.get("content", "")

    # 텍스트가 너무 길면 자름
    truncated_content = content_text[:10000]

    data = {
        "model": model_version,
        "messages": [
            {"role": "system", "content": "당신은 영상 스크립트의 사실 관계와 신뢰도를 분석하는 AI입니다. 반드시 지정된 순수 JSON 형식으로만 응답하세요."},
            {"role": "user", "content": prompt.format(title=title, author=author, language=language, content=truncated_content)}
        ],
        "temperature": 0.3
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        if response.status_code == 200:
            result_json = response.json()
            content = result_json["choices"][0]["message"]["content"]
            
            # Markdown JSON 블록 제거 (```json ... ```)
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
                
            parsed = json.loads(content.strip())
            
            return {
                "youtubeInfo": {
                    "channelId": parsed_data.get("channel_id") or "알 수 없음",
                    "channelName": parsed_data.get("author") or "알 수 없음",
                    "videoId": parsed_data.get("video_id") or "알 수 없음",
                    "videoTitle": parsed_data.get("title") or "알 수 없음"
                },
                "analysisResult": {
                    "trustGrade": parsed.get("trustGrade", "UNKNOWN"),
                    "confidenceScore": parsed.get("confidenceScore", 0),
                    "summary": parsed.get("summary", "요약 정보가 없습니다."),
                    "modelVersion": model_version
                },
                "violations": parsed.get("violations", [])
            }
        else:
            logger.error(f"GMS LLM API 호출 실패: {response.status_code} - {response.text}")
            default_result["analysisResult"]["summary"] = "API 호출 실패"
            return default_result
    except Exception as e:
        logger.error(f"GMS LLM API 예외 발생: {str(e)}")
        default_result["analysisResult"]["summary"] = f"예외 발생: {str(e)}"
        return default_result
