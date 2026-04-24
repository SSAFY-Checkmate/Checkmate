import { create } from "zustand";
import { MOCK_ANALYSIS_RESULTS } from "./constants/mock-data";

export type Tab = "report" | "community";
export type Verdict = "safe" | "warning" | "unknown";

export interface WantedCard {
  id: string;
  claim: string;
  reporterComment: string;
  votesTrue: number;
  votesFake: number;
  userVote?: "true" | "fake";
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  badge?: "verifier" | "reporter";
}

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

  // 커뮤니티 데이터
  wantedCards: WantedCard[];
  chatMessages: ChatMessage[];

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  closeResponseModal: () => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => void;
  setCurrentVideo: (id: string, title: string, channel: string) => void;
  voteOnCard: (cardId: string, vote: "true" | "fake") => void;
  addChatMessage: (msg: { username: string; message: string; badge?: "verifier" | "reporter" }) => void;
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
  currentVideoId: "1",
  trustScore: 0,
  overallVerdict: "unknown",
  claims: [],

  // 커뮤니티 초기 데이터 (목업)
  wantedCards: [
    {
      id: "w1",
      claim: "이 약만 먹으면 일주일 만에 10kg 감량?",
      reporterComment: "과장 광고가 의심됩니다.",
      votesTrue: 12,
      votesFake: 85,
    },
    {
      id: "w2",
      claim: "내일부터 모든 세금이 0원?",
      reporterComment: "가짜 뉴스인 것 같아요.",
      votesTrue: 3,
      votesFake: 142,
    },
  ],
  chatMessages: [
    { id: "1", username: "팩트체커", message: "이 영상 3분 12초 부분 자막이 이상해요.", badge: "verifier" },
    { id: "2", username: "익명", message: "저도 그렇게 생각합니다." },
    { id: "3", username: "제보왕", message: "다른 출처도 찾아보고 있어요.", badge: "reporter" },
  ],

  // 액션 구현
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  closeResponseModal: () => set({ isResponseModalOpen: false }),
  showWarning: (count) => set({ isWarningVisible: true, warningCount: count }),
  closeWarning: () => set({ isWarningVisible: false }),

  // 커뮤니티 액션
  voteOnCard: (cardId, vote) =>
    set((state) => ({
      wantedCards: state.wantedCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              userVote: vote,
              votesTrue: vote === "true" ? card.votesTrue + 1 : card.votesTrue,
              votesFake: vote === "fake" ? card.votesFake + 1 : card.votesFake,
            }
          : card,
      ),
    })),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { id: Date.now().toString(), ...msg }],
    })),

  /**
   * 영상 정보를 설정
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
   * 영상 분석 시뮬레이션
   */
  startAnalysis: () => {
    const videoId = useCheckmateStore.getState().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting" });

    setTimeout(() => {
      set({ analysisStatus: "analyzing_transcript" });

      setTimeout(() => {
        set({ analysisStatus: "analyzing_claims" });

        setTimeout(() => {
          set({ analysisStatus: "verifying" });

          setTimeout(() => {
            const isWarningCase = videoId.includes("warn") || videoId === "1"; // 기본 시뮬레이션용
            const result = isWarningCase ? MOCK_ANALYSIS_RESULTS.warn : MOCK_ANALYSIS_RESULTS.default;

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
