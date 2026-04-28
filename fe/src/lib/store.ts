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
  /** 커뮤니티 투표 데이터 */
  votesTrue: number;
  votesFake: number;
  userVote?: "true" | "fake";
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

export interface User {
  name: string;
  email: string;
  picture: string;
}

/**
 * Checkmate 전역 상태 스토어 인터페이스
 */
interface CheckmateState {
  // 인증 상태
  isLoggedIn: boolean;
  user: User | null;

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

  // 분석 결과 캐시
  analyzedVideos: Record<string, Partial<CheckmateState>>;

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  openResponseModal: () => void;
  closeResponseModal: () => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => void;
  setCurrentVideo: (id: string, title: string, channel: string) => void;
  voteOnCard: (cardId: string, vote: "true" | "fake") => void;
  voteOnClaim: (claimId: string, vote: "true" | "fake") => void;
  addChatMessage: (msg: { username: string; message: string; badge?: "verifier" | "reporter" }) => void;
  
  // 인증 액션
  setLoginStatus: (isLoggedIn: boolean, user?: User | null) => void;
}

/**
 * Zustand Store 구현
 */
export const useCheckmateStore = create<CheckmateState>((set, get) => ({
  // 초기 상태 설정
  isPanelOpen: false,
  activeTab: "report",
  isResponseModalOpen: false,
  isWarningVisible: false,
  warningCount: 0,
  analysisStatus: "idle",
  videoTitle: "",
  channelName: "",
  currentVideoId: null,
  trustScore: 0,
  overallVerdict: "unknown",
  claims: [],
  analyzedVideos: {},

  // 인증 초기 상태
  isLoggedIn: false,
  user: null,

  // 커뮤니티 초기 데이터 (목목)
  wantedCards: [
    { id: "w1", claim: "이 약만 먹으면 일주일 만에 10kg 감량?", reporterComment: "과장 광고가 의심됩니다.", votesTrue: 12, votesFake: 85 },
    { id: "w2", claim: "내일부터 모든 세금이 0원?", reporterComment: "가짜 뉴스인 것 같아요.", votesTrue: 3, votesFake: 142 },
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
  openResponseModal: () => set({ isResponseModalOpen: true }),
  closeResponseModal: () => set({ isResponseModalOpen: false }),
  showWarning: (count) => set({ isWarningVisible: true, warningCount: count }),
  closeWarning: () => set({ isWarningVisible: false }),

  // 커뮤니티 액션
  voteOnCard: (cardId, vote) =>
    set((state) => ({
      wantedCards: state.wantedCards.map((card) =>
        card.id === cardId
          ? { ...card, userVote: vote, votesTrue: vote === "true" ? card.votesTrue + 1 : card.votesTrue, votesFake: vote === "fake" ? card.votesFake + 1 : card.votesFake }
          : card,
      ),
    })),

  voteOnClaim: (claimId, vote) =>
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === claimId
          ? { ...claim, userVote: vote, votesTrue: vote === "true" ? claim.votesTrue + 1 : claim.votesTrue, votesFake: vote === "fake" ? claim.votesFake + 1 : claim.votesFake }
          : claim,
      ),
    })),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { id: Date.now().toString(), ...msg }],
    })),

  /**
   * 영상 정보를 설정하고 캐시를 확인하여 상태를 복원하거나 리셋
   */
  setCurrentVideo: (id, title, channel) => {
    const state = get();
    // 이미 같은 영상이면 무시
    if (state.currentVideoId === id) return;

    const cachedData = state.analyzedVideos[id];

    if (cachedData) {
      // 캐시된 분석 결과가 있으면 복원
      set({
        currentVideoId: id,
        videoTitle: title || state.videoTitle,
        channelName: channel || state.channelName,
        isPanelOpen: false, // 영상 전환 시 서랍은 닫음
        ...cachedData,
      });
      console.log(`[Checkmate] 영상(${id}) 캐시 복원됨:`, cachedData);
    } else {
      // 새로운 영상이면 초기화
      set({
        currentVideoId: id,
        videoTitle: title || state.videoTitle,
        channelName: channel || state.channelName,
        analysisStatus: "idle",
        overallVerdict: "unknown",
        trustScore: 0,
        isWarningVisible: false,
        isPanelOpen: false,
        claims: [],
        warningCount: 0,
      });
      console.log(`[Checkmate] 새로운 영상(${id}) 상태 초기화됨`);
    }
  },

  /**
   * 영상 분석 시뮬레이션
   */
  startAnalysis: () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting" });

    setTimeout(() => {
      set({ analysisStatus: "analyzing_transcript" });

      setTimeout(() => {
        set({ analysisStatus: "analyzing_claims" });

        setTimeout(() => {
          set({ analysisStatus: "verifying" });

          setTimeout(() => {
            const isWarningCase = videoId.includes("warn") || videoId === "1"; // 시뮬레이션
            const result = isWarningCase ? MOCK_ANALYSIS_RESULTS.warn : MOCK_ANALYSIS_RESULTS.default;

            const finalState = {
              analysisStatus: "complete" as AnalysisStatus,
              isWarningVisible: true,
              overallVerdict: result.verdict,
              trustScore: result.score,
              warningCount: result.warningCount,
              claims: result.claims,
            };

            // 상태 업데이트 및 캐시에 저장
            set((state) => ({
              ...finalState,
              analyzedVideos: {
                ...state.analyzedVideos,
                [videoId]: finalState,
              },
            }));
          }, 1500);
        }, 1200);
      }, 1000);
    }, 800);
  },

  setLoginStatus: (isLoggedIn, user = null) => set({ isLoggedIn, user }),
}));
