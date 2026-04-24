import { create } from "zustand";
import { MOCK_ANALYSIS_RESULTS } from "./constants/mock-data";

export type Tab = "report" | "community";
export type Verdict = "safe" | "warning" | "unknown";

/**
 * 분석된 주장(Claim) 인터페이스
 */
export interface Claim {
  id: string;
  text: string;
  verdict: Verdict;
  evidence: string;
  sources: { label: string; url: string }[];
}

/**
 * 분석 진행 상태 타입
 */
export type AnalysisStatus =
  | "idle"
  | "detecting"
  | "analyzing_transcript"
  | "analyzing_claims"
  | "verifying"
  | "complete";

/**
 * Checkmate 전역 상태 스토어 인터페이스
 */
interface CheckmateState {
  // 패널 및 모달 상태
  isPanelOpen: boolean;
  activeTab: Tab;
  isResponseModalOpen: boolean;

  // 알림 팝업 상태
  isWarningVisible: boolean;
  warningCount: number;

  // 분석 진행 상태
  analysisStatus: AnalysisStatus;

  // 현재 영상 정보
  videoTitle: string;
  channelName: string;
  currentVideoId: string | null;

  // 분석 결과 데이터
  trustScore: number;
  overallVerdict: Verdict;
  claims: Claim[];

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => void;
  setCurrentVideo: (id: string, title: string, channel: string) => void;
}

/**
 * Zustand Store 구현
 */
export const useCheckmateStore = create<CheckmateState>((set) => ({
  // 초기 상태 설정
  isPanelOpen: false,
  activeTab: "report",
  isResponseModalOpen: false,
  isWarningVisible: false,
  warningCount: 0,
  analysisStatus: "idle",
  videoTitle: "",
  channelName: "",
  currentVideoId: "1", // 기본값
  trustScore: 0,
  overallVerdict: "unknown",
  claims: [],

  // 액션 구현
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  showWarning: (count) => set({ isWarningVisible: true, warningCount: count }),
  closeWarning: () => set({ isWarningVisible: false }),

  /**
   * 영상 정보를 설정하고 해당 영상의 이전 분석 상태가 있다면 가져오기 (여기서는 초기화 위주)
   */
  setCurrentVideo: (id, title, channel) =>
    set({
      currentVideoId: id,
      videoTitle: title,
      channelName: channel,
      analysisStatus: "idle",
      overallVerdict: "unknown",
      trustScore: 0,
      isWarningVisible: false,
    }),

  /**
   * TODO: MSW 또는 실제 API 도입 시 이 시뮬레이션 로직은 삭제될 예정입니다.
   * 영상 분석 프로세스를 시뮬레이션합니다.
   */
  startAnalysis: () => {
    const videoId = useCheckmateStore.getState().currentVideoId;
    if (!videoId) return;

    // 1단계: 감지 중
    set({ analysisStatus: "detecting" });

    setTimeout(() => {
      // 2단계: 자막 분석 중
      set({ analysisStatus: "analyzing_transcript" });

      setTimeout(() => {
        // 3단계: 주장 추출 중
        set({ analysisStatus: "analyzing_claims" });

        setTimeout(() => {
          // 4단계: 신뢰도 검증 중
          set({ analysisStatus: "verifying" });

          setTimeout(() => {
            // [TODO: 목업 데이터] 외부 상수 파일에서 데이터를 가져옵니다.
            const isWarningCase = videoId.includes("warn");
            const result = isWarningCase
              ? MOCK_ANALYSIS_RESULTS.warn
              : MOCK_ANALYSIS_RESULTS.default;

            // 완료 상태 업데이트
            set({
              analysisStatus: "complete",
              isWarningVisible: true,
              overallVerdict: result.verdict,
              trustScore: result.score,
              warningCount: result.warningCount,
              claims: result.claims,
            });
          }, 1500);
        }, 1200);
      }, 1000);
    }, 800);
  },
}));
