import { ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import type { Claim, Verdict } from "../store";

/**
 * [목업 데이터] 분석 결과 리포트 종류별 상세 설정
 * UI에서 결과 팝업을 띄울 때 사용됩니다.
 */
export const ANALYSIS_WARNING_CONFIG = {
  safe: {
    gradient: "from-blue-400 to-blue-600",
    textColor: "text-blue-600",
    icon: ShieldCheck,
    prefix: "신뢰",
    title: "검증된 신뢰 정보",
    desc: "Checkmate 분석 결과, 신뢰할 수 있는 사실로 확인되었습니다.",
    btnText: "지금 확인",
  },
  warning: {
    gradient: "from-red-400 to-red-600",
    textColor: "text-red-600",
    icon: AlertTriangle,
    prefix: "주의",
    title: "허위/과장 정보 주의",
    desc: "이 영상에서 허위 의심 문장이 발견되었습니다. 판단 근거를 확인하세요.",
    btnText: "판단 근거 보기",
  },
  unknown: {
    gradient: "from-amber-400 to-amber-600",
    textColor: "text-amber-600",
    icon: HelpCircle,
    prefix: "보류",
    title: "판단 보류 안내",
    desc: "확보된 정보만으로는 AI 판독이 어렵습니다. 커뮤니티 투표가 필요합니다.",
    btnText: "게시판으로 이동",
  },
};

/**
 * [목업 데이터] 비디오 ID에 따른 시뮬레이션 결과 데이터 세트
 */
export const MOCK_ANALYSIS_RESULTS: Record<
  string,
  {
    verdict: Verdict;
    score: number;
    warningCount: number;
    claims: Claim[];
  }
> = {
  default: {
    verdict: "safe",
    score: 98,
    warningCount: 0,
    claims: [
      {
        id: "c-safe-1",
        text: "영상 내 사실 정보 일치",
        verdict: "safe",
        evidence: "공식 기사와 교차 검증 결과 사실입니다.",
        sources: [{ label: "언론 보도", url: "#" }],
      },
    ],
  },
  warn: {
    verdict: "warning",
    score: 15,
    warningCount: 2,
    claims: [
      {
        id: "c-warn-1",
        text: '"단 며칠 만에 10kg 감량 보장"',
        verdict: "warning",
        evidence: "과장된 표현이며 과학적 근거가 부족합니다.",
        sources: [{ label: "식약처 자료", url: "#" }],
      },
    ],
  },
};
