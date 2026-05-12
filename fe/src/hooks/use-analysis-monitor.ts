import { useEffect, useRef } from "react";
import { useCheckmateStore } from "../lib/store";

/**
 * [분석 모니터링 훅]
 * 분석이 특정 단계에서 너무 오래 머물 경우 타임아웃 에러를 발생시킵니다.
 */
const ANALYSIS_TIMEOUT_MSG = "수사 시간 초과";

export function useAnalysisMonitor(timeoutMs: number = 180000) {
  const { analysisStatus, setAnalysisStatus, setErrorMsg, currentVideoId } = useCheckmateStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 분석 중인 상태들 (진행 중인 상태들만 모니터링)
    const isProcessing = ["checking", "detecting", "analyzing_transcript", "analyzing_claims", "verifying"].includes(
      analysisStatus,
    );

    // 타이머 초기화 (상태 변경 및 영상 전환 시)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isProcessing) {
      // 새로운 타이머 설정
      timerRef.current = setTimeout(() => {
        console.warn(`[Analysis Timeout] ${analysisStatus} state timed out after ${timeoutMs}ms`);
        setErrorMsg(ANALYSIS_TIMEOUT_MSG);
        setAnalysisStatus("error");
      }, timeoutMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [analysisStatus, timeoutMs, setAnalysisStatus, setErrorMsg, currentVideoId]);

  return { analysisStatus };
}
