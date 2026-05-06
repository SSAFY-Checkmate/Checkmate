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
  | "complete"
  | "error";

export interface User {
  id: number;
  name: string;
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
  summary: string;
  analysisId: number | null; // RDB PK
  claims: Claim[];

  // 커뮤니티 데이터
  communityVotes: { trueVotes: number; fakeVotes: number; userVote: boolean | null; userReactionId: number | null };
  wantedCards: WantedCard[];
  chatMessages: ChatMessage[];

  // 분석 결과 캐시
  analyzedVideos: Record<string, Partial<CheckmateState>>;

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => void;
  startAnalysisSync: () => void;
  startDemoAnalysis: () => void;
  setCurrentVideo: (id: string, title?: string, channel?: string) => void;
  fetchReactions: (analysisId: number) => Promise<void>;
  postReaction: (analysisId: number, reactionType: boolean) => Promise<void>;
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
  isWarningVisible: false,
  warningCount: 0,
  analysisStatus: "idle",
  videoTitle: "",
  channelName: "",
  currentVideoId: null,
  trustScore: 0,
  overallVerdict: "unknown",
  summary: "",
  analysisId: null,
  claims: [],
  communityVotes: { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null },
  analyzedVideos: {},

  // 인증 초기 상태
  isLoggedIn: false, // 실제 구현 시 초기화 함수에서 확인
  user: null,

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

  voteOnClaim: (claimId, vote) =>
    set((state) => ({
      claims: state.claims.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              userVote: vote,
              votesTrue: vote === "true" ? claim.votesTrue + 1 : claim.votesTrue,
              votesFake: vote === "fake" ? claim.votesFake + 1 : claim.votesFake,
            }
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
  setCurrentVideo: (id, title = "", channel = "") => {
    const state = get();
    // 이미 같은 영상이면 무시
    if (state.currentVideoId === id) return;

    const cachedData = state.analyzedVideos[id];

    if (cachedData) {
      // 캐시된 분석 결과가 있으면 복원
      set({
        currentVideoId: id,
        videoTitle: title || (cachedData.videoTitle as string) || "",
        channelName: channel || (cachedData.channelName as string) || "",
        isPanelOpen: false, // 영상 전환 시 서랍은 닫음
        ...cachedData,
      });
      if (cachedData.analysisId) {
        get().fetchReactions(cachedData.analysisId);
      }
    } else {
      // 새로운 영상이면 초기화
      set({
        currentVideoId: id,
        videoTitle: title,
        channelName: channel,
        analysisStatus: "idle",
        overallVerdict: "unknown",
        trustScore: 0,
        summary: "",
        analysisId: null,
        isWarningVisible: false,
        isPanelOpen: false,
        claims: [],
        warningCount: 0,
        communityVotes: { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null },
      });
    }
  },

  fetchReactions: async (analysisId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const currentUser = get().user;

    try {
      const res = await fetch(`${baseUrl}/community/reactions?analysisId=${analysisId}`, {
        method: "GET",
        credentials: "include",
      });
      const body = await res.json();
      if (body.status === 200 && Array.isArray(body.data)) {
        const reactions = body.data;
        const trueVotes = reactions.filter((r: any) => r.reactionType === true).length;
        const fakeVotes = reactions.filter((r: any) => r.reactionType === false).length;

        // 현재 사용자의 반응 찾기
        const myReaction = currentUser
          ? reactions.find((r: any) => r.userId === currentUser.id || r.userName === currentUser.name)
          : null;

        set({
          communityVotes: {
            trueVotes,
            fakeVotes,
            userVote: myReaction ? myReaction.reactionType : null,
            userReactionId: myReaction ? myReaction.id : null,
          },
        });
      }
    } catch (err) {
      console.error("[Reaction] Fetch failed", err);
    }
  },

  postReaction: async (analysisId, reactionType) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const { isLoggedIn, communityVotes, fetchReactions } = get();

    if (!isLoggedIn) return;

    const userReactionId = communityVotes.userReactionId;

    try {
      let res;
      if (userReactionId) {
        // 이미 반응이 있으면 수정 (PUT)
        res = await fetch(`${baseUrl}/community/reactions/${userReactionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
          credentials: "include",
        });
      } else {
        // 반응이 없으면 신규 등록 (POST)
        res = await fetch(`${baseUrl}/community/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId, reactionType }),
          credentials: "include",
        });
      }

      const body = await res.json();
      if (body.status === 201 || body.status === 200) {
        fetchReactions(analysisId);
      }
    } catch (err) {
      console.error("[Reaction] Operation failed", err);
    }
  },

  /**
   * 데모 분석 요청 (목업 데이터 사용, API 호출 안함)
   */
  startDemoAnalysis: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting", isWarningVisible: false });

    try {
      await new Promise((r) => setTimeout(r, 1000));
      set({ analysisStatus: "analyzing_transcript" });
      await new Promise((r) => setTimeout(r, 1000));
      set({ analysisStatus: "analyzing_claims" });
      await new Promise((r) => setTimeout(r, 1000));
      set({ analysisStatus: "verifying" });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = MOCK_ANALYSIS_RESULTS.warn;
      const finalState = {
        analysisStatus: "complete" as AnalysisStatus,
        videoTitle: "데모: 검증되지 않은 다이어트 보조제의 진실",
        channelName: "건강정보 팩트체크",
        overallVerdict: mockData.verdict,
        trustScore: mockData.score,
        summary:
          "이 영상은 검증되지 않은 다이어트 보조제에 대해 심각한 과장 광고를 포함하고 있을 가능성이 높습니다. 영상 내용의 신뢰도가 낮으므로 각별한 주의가 필요합니다.",
        isWarningVisible: mockData.verdict === "warning",
        warningCount: mockData.warningCount,
        claims: mockData.claims,
        analysisId: 999, // 데모용 ID 부여
        isLoggedIn: true, // 데모 테스트를 위해 로그인 상태 활성화
        communityVotes: { trueVotes: 42, fakeVotes: 12, userVote: null, userReactionId: null }, // 초기 투표값 설정
      };

      if (get().currentVideoId !== videoId) return;

      set((state) => ({
        ...finalState,
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: finalState,
        },
      }));
    } catch (error) {
      console.error("데모 분석 중 오류 발생:", error);
      set({ analysisStatus: "error" });
    }
  },

  /**
   * 영상 분석 요청 (동기 API 연동)
   */
  startAnalysis: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting", isWarningVisible: false });

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    const doFetch = async (input: RequestInfo | URL, init: RequestInit) => {
      const res = await fetch(input, init);
      if (res.status !== 401) return res;
      await initializeAuth();
      if (!get().isLoggedIn) return res;
      return fetch(input, init);
    };

    try {
      const apiPromise = doFetch(`${baseUrl}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ youtubeUrl: targetUrl }),
        signal: controller.signal,
      });

      await new Promise((r) => setTimeout(r, 800));
      set({ analysisStatus: "analyzing_transcript" });

      await new Promise((r) => setTimeout(r, 800));
      set({ analysisStatus: "analyzing_claims" });

      const response = await apiPromise;

      if (response.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().startAnalysis();
        throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      }

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const responseData = await response.json();
      console.log(responseData);
      if (responseData.status !== 202 || !responseData.data?.jobId) {
        throw new Error(responseData.message || "분석 요청 실패");
      }

      const jobId: string = responseData.data.jobId;
      const pollIntervalMs = 1500;
      let data: any | null = null;

      while (!controller.signal.aborted) {
        const pollRes = await doFetch(`${baseUrl}/analysis/${jobId}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        if (!pollRes.ok) throw new Error(`API 오류: ${pollRes.status}`);
        const pollBody = await pollRes.json();
        if (pollBody.status !== 200 || !pollBody.data) throw new Error(pollBody.message || "분석 상태 조회 실패");
        data = pollBody.data;
        if (data.status === "TRANSCRIPT_PROCESSING") set({ analysisStatus: "analyzing_transcript" });
        else if (data.status === "AI_PROCESSING") set({ analysisStatus: "analyzing_claims" });
        if (data.status === "COMPLETED" || data.status === "FAILED") break;
        await sleep(pollIntervalMs);
      }

      if (!data) throw new Error("분석 상태를 받지 못했습니다.");
      const analysisId = data.analysisId;

      if (data.status === "FAILED") {
        const activeReel = Array.from(document.querySelectorAll("ytd-reel-player-overlay-renderer")).find(
          (el) => (el as HTMLElement).getBoundingClientRect().width > 0,
        );
        const scrapedTitle =
          activeReel?.querySelector(".ytd-reel-player-header-renderer yt-formatted-string")?.textContent?.trim() ||
          document.querySelector("h1.ytd-watch-metadata")?.textContent?.trim() ||
          "알 수 없는 영상";
        const scrapedChannel =
          activeReel?.querySelector("#channel-name yt-formatted-string")?.textContent?.trim() ||
          document.querySelector("#text.ytd-channel-name a")?.textContent?.trim() ||
          "알 수 없는 채널";

        const failState = {
          analysisStatus: "complete" as AnalysisStatus,
          videoTitle: scrapedTitle,
          channelName: scrapedChannel,
          overallVerdict: "unknown" as Verdict,
          trustScore: 0,
          summary: "데이터 분석을 허용하지 않는 영상입니다. 하단의 버튼을 눌러 커뮤니티에서 직접 진위를 투표해 보세요!",
          isWarningVisible: false,
          warningCount: 0,
          claims: [],
        };

        if (get().currentVideoId !== videoId) return;

        set((state) => ({
          ...failState,
          analysisId,
          analyzedVideos: { ...state.analyzedVideos, [videoId]: { ...failState, analysisId } },
        }));
        if (analysisId) get().fetchReactions(analysisId);
        return;
      }

      set({ analysisStatus: "verifying" });
      await new Promise((r) => setTimeout(r, 1000));

      const resultObj = data.result || {};

      // 백엔드 응답(trustGrade) 매핑
      let mappedVerdict: Verdict = "unknown";
      if (resultObj.trustGrade === "SAFE" || resultObj.trustGrade === "GOOD") mappedVerdict = "safe";
      else if (resultObj.trustGrade === "WARNING" || resultObj.trustGrade === "DANGER") mappedVerdict = "warning";

      const violations = resultObj.violations || [];
      const claims: Claim[] = violations.map((v: any, idx: number) => ({
        id: `v-${idx}`,
        text: v.violationSentence || "내용 없음",
        verdict: "warning" as Verdict,
        evidence: v.reason || "",
        sources: [],
        votesTrue: 0,
        votesFake: 0,
      }));

      const youtubeInfo = resultObj || {};
      const finalState = {
        analysisStatus: "complete" as AnalysisStatus,
        videoTitle: youtubeInfo.videoTitle || data.videoTitle || get().videoTitle,
        channelName: youtubeInfo.channelName || data.channelName || get().channelName,
        overallVerdict: mappedVerdict,
        trustScore: resultObj.confidenceScore || 0,
        summary: resultObj.summary || "",
        isWarningVisible: mappedVerdict === "warning",
        warningCount: claims.length > 0 ? claims.length : mappedVerdict === "warning" ? 1 : 0,
        claims: claims,
      };

      // [개선] 결과 반영 전 현재 영상 ID가 여전히 동일한지 확인 (레이스 컨디션 방지)
      if (get().currentVideoId !== videoId) return;

      set((state) => ({
        ...finalState,
        analysisId,
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: { ...finalState, analysisId },
        },
      }));

      if (analysisId) {
        get().fetchReactions(analysisId);
      }
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      set({
        analysisStatus: "error",
        overallVerdict: "unknown",
        trustScore: 0,
        summary:
          error instanceof Error && error.name === "AbortError"
            ? "분석 시간이 너무 오래 걸려 중단되었습니다. 다시 시도해 주세요."
            : "",
        isWarningVisible: false,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Legacy sync API flow (kept for compatibility / fallback)
   * - POST /analysis/sync -> 200 + final result
   */
  startAnalysisSync: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting", isWarningVisible: false });

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${baseUrl}/analysis/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ youtubeUrl: targetUrl }),
        signal: controller.signal,
      });

      if (response.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().startAnalysisSync();
        throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      }

      if (!response.ok) throw new Error(`API 오류: ${response.status}`);

      const responseData = await response.json();
      if (responseData.status !== 200 || !responseData.data) {
        throw new Error(responseData.message || "분석 요청 실패");
      }

      const data = responseData.data;

      if (data.status === "FAILED") {
        set({
          analysisStatus: "complete",
          overallVerdict: "unknown",
          trustScore: 0,
          summary: "데이터 분석을 지원하지 않는 영상입니다. 판단은 커뮤니티에서 직접 진행해 주세요.",
          isWarningVisible: false,
          warningCount: 0,
          claims: [],
        });
        return;
      }

      const resultObj = data.result?.analysis?.analysisResult || {};

      let mappedVerdict: Verdict = "unknown";
      if (resultObj.trustGrade === "SAFE" || resultObj.trustGrade === "GOOD") mappedVerdict = "safe";
      else if (resultObj.trustGrade === "WARNING" || resultObj.trustGrade === "DANGER") mappedVerdict = "warning";

      const violations = data.result?.analysis?.violations || [];
      const claims: Claim[] = violations.map((v: any, idx: number) => ({
        id: `v-${idx}`,
        text: v.violationSentence || "내용 없음",
        verdict: "warning" as Verdict,
        evidence: v.reason || "",
        sources: [],
        votesTrue: 0,
        votesFake: 0,
      }));

      const youtubeInfo = data.result?.analysis?.youtubeInfo || {};
      const finalState = {
        analysisStatus: "complete" as AnalysisStatus,
        videoTitle: youtubeInfo.videoTitle || data.videoTitle || get().videoTitle,
        channelName: youtubeInfo.channelName || data.channelName || get().channelName,
        overallVerdict: mappedVerdict,
        trustScore: resultObj.confidenceScore || 0,
        summary: resultObj.summary || "",
        isWarningVisible: mappedVerdict === "warning",
        warningCount: claims.length > 0 ? claims.length : mappedVerdict === "warning" ? 1 : 0,
        claims: claims,
      };

      if (get().currentVideoId !== videoId) return;

      const analysisId = data.analysisId;

      set((state) => ({
        ...finalState,
        analysisId,
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: { ...finalState, analysisId },
        },
      }));

      if (analysisId) {
        get().fetchReactions(analysisId);
      }
    } catch (error) {
      console.error("분석 중 오류 발생:", error);
      set({
        analysisStatus: "error",
        overallVerdict: "unknown",
        trustScore: 0,
        summary:
          error instanceof Error && error.name === "AbortError"
            ? "분석 시간이 너무 오래 걸려 중단되었습니다. 다시 시도해 주세요."
            : "",
        isWarningVisible: false,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },

  setLoginStatus: (isLoggedIn, user = null) => {
    if (!isLoggedIn) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove("jwtToken");
      }
      localStorage.removeItem("jwtToken");
    }
    set({ isLoggedIn, user });
  },
}));

/**
 * 앱 로드 시 서버에 /auth/me 요청을 보내어 HttpOnly 쿠키 기반 인증 상태를 복원합니다.
 */
export const initializeAuth = async () => {
  const store = useCheckmateStore.getState();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.name) {
        store.setLoginStatus(true, { id: result.data.id, name: result.data.name });
        return;
      }
    } else if (response.status === 401 || response.status === 403) {
      // Access Token이 만료된 경우 (401/403) Refresh Token으로 재발급 시도
      const reissueResponse = await fetch(`${baseUrl}/auth/reissue`, {
        method: "POST",
        credentials: "include",
      });

      if (reissueResponse.ok) {
        // 토큰 재발급 성공 시 다시 내 정보 가져오기
        const retryResponse = await fetch(`${baseUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          if (retryResult.data && retryResult.data.name) {
            store.setLoginStatus(true, { id: retryResult.data.id, name: retryResult.data.name });
            return;
          }
        }
      } else {
        console.warn("리프레시 토큰 만료, 다시 로그인해야 합니다.");
      }
    }
    store.setLoginStatus(false, null);
  } catch (error) {
    console.error("인증 초기화 실패:", error);
    store.setLoginStatus(false, null);
  }
};

/**
 * 서버에 /auth/logout 요청을 보내어 HttpOnly 쿠키를 삭제하고 로그인 상태를 해제합니다.
 */
export const logoutAuth = async () => {
  const store = useCheckmateStore.getState();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  try {
    await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
  } finally {
    // 백엔드 요청 성공 여부와 무관하게 프론트엔드 상태는 초기화
    store.setLoginStatus(false, null);
  }
};
