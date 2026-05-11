import { create } from "zustand";
import { MOCK_ANALYSIS_RESULTS } from "./constants/mock-data";
import { isUnknown, scrapeMetadata } from "./youtube-utils";

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
  id: number; // [추가] 유저 식별자 (투표 연동용)
  name: string;
}

/**
 * Checkmate 전역 상태 스토어 인터페이스
 */
interface CheckmateState {
  // 인증 상태
  isLoggedIn: boolean;
  user: User | null;
  /**
   * [자동 로그인 초기화 진행 중 여부]
   * - true: initializeAuth()가 아직 실행 중 (로딩 스켈레톤 표시)
   * - false: 인증 확인 완료 (결과에 따라 LoginView 또는 대시보드 표시)
   */
  isAuthInitializing: boolean;

  // 패널 및 모달 상태
  isPanelOpen: boolean;
  isResultModalOpen: boolean;
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
  claims: Claim[];

  // 커뮤니티 데이터
  wantedCards: WantedCard[];
  chatMessages: ChatMessage[];

  // [영상 단위 커뮤니티 반응]
  /** 백엔드 분석 ID (커뮤니티 투표 연동에 필요) */
  analysisId: number | null;
  /** 전체 반응 요약 */
  reactionSummary: { proCount: number; conCount: number };
  /** 현재 유저의 투표 여부 (true=찬성, false=반대, null=미투표) */
  myReaction: boolean | null;

  // 분석 결과 캐시
  analyzedVideos: Record<string, Partial<CheckmateState>>;

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => Promise<void>;
  startAnalysisSync: () => Promise<void>;
  startDemoAnalysis: () => void;
  setCurrentVideo: (id: string, title?: string, channel?: string) => void;
  voteOnCard: (cardId: string, vote: "true" | "fake") => void;
  voteOnClaim: (claimId: string, vote: "true" | "fake") => void;
  addChatMessage: (msg: { username: string; message: string; badge?: "verifier" | "reporter" }) => void;
  setResultModalOpen: (open: boolean) => void;
  checkAnalysisStatus: () => Promise<void>;

  // 인증 액션
  setLoginStatus: (isLoggedIn: boolean, user?: User | null) => void;

  // [추가] 투표 연동 액션
  fetchReactions: (analysisId: number) => Promise<void>;
  postReaction: (analysisId: number, reactionType: boolean) => Promise<void>;
}

/**
 * Zustand Store 구현
 */
export const useCheckmateStore = create<CheckmateState>((set, get) => ({
  // 초기 상태 설정
  isPanelOpen: false,
  isResultModalOpen: false,
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
  claims: [],
  analyzedVideos: {},

  // 커뮤니티 투표 초기 상태
  analysisId: null,
  reactionSummary: { proCount: 0, conCount: 0 },
  myReaction: null,

  // 인증 초기 상태
  // [중요] isAuthInitializing: true로 시작 → initializeAuth() 완료 전까지 LoginView 표시 차단
  isLoggedIn: false,
  user: null,
  isAuthInitializing: true,

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

    let finalTitle = title;
    let finalChannel = channel;

    // [개선] 전달받은 정보가 부실하면(Unknown) DOM에서 직접 스크래핑 시도
    if (isUnknown(finalTitle) || isUnknown(finalChannel)) {
      const scraped = scrapeMetadata();
      if (isUnknown(finalTitle)) finalTitle = scraped.title;
      if (isUnknown(finalChannel)) finalChannel = scraped.channel;
    }

    const cachedData = state.analyzedVideos[id];

    if (cachedData) {
      // 캐시된 분석 결과가 있으면 복원 (단, Unknown이 아닐 때만 캐시값 우선)
      set({
        currentVideoId: id,
        videoTitle: !isUnknown(finalTitle) ? finalTitle : (cachedData.videoTitle as string) || "",
        channelName: !isUnknown(finalChannel) ? finalChannel : (cachedData.channelName as string) || "",
        isPanelOpen: false,
        ...cachedData,
      });

      // 캐시 복원 시 분석 ID가 있으면 반응 정보도 가져오기
      if (cachedData.analysisId) {
        get().fetchReactions(cachedData.analysisId as number);
      }
    } else {
      // 새로운 영상이면 초기화
      set({
        currentVideoId: id,
        videoTitle: finalTitle,
        channelName: finalChannel,
        analysisStatus: "idle",
        overallVerdict: "unknown",
        trustScore: 0,
        summary: "",
        isWarningVisible: false,
        isPanelOpen: false,
        claims: [],
        warningCount: 0,
        analysisId: null,
        reactionSummary: { proCount: 0, conCount: 0 },
        myReaction: null,
      });
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
      // UX를 위한 시뮬레이션 지연
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
      };

      // [개선] 결과 반영 전 현재 영상 ID가 여전히 동일한지 확인 (레이스 컨디션 방지)
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

    // 1단계: 감지 시작
    set({ analysisStatus: "detecting", isWarningVisible: false });

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 60초 타임아웃 설정 (영상이 길거나 서버 부하가 있을 경우 고려)
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
      // API 요청 시작 (결과는 나중에 기다림)
      const apiPromise = doFetch(`${baseUrl}/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ youtubeUrl: targetUrl }),
        signal: controller.signal,
      });

      // 시각적 피드백을 위해 각 단계별 최소 대기 시간 부여
      await new Promise((r) => setTimeout(r, 800));
      set({ analysisStatus: "analyzing_transcript" });

      await new Promise((r) => setTimeout(r, 800));
      set({ analysisStatus: "analyzing_claims" });

      // API 응답 대기
      const response = await apiPromise;

      // [추가] 401 Unauthorized 처리: 토큰 만료 시 재발급 시도
      if (response.status === 401) {
        await initializeAuth();
        // 재발급 후 로그인 상태가 되었다면 분석 다시 시도
        if (get().isLoggedIn) {
          return get().startAnalysis();
        }
        throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요.");
      }

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData);

      // Kafka async contract: POST /analysis returns 202 + jobId, then poll GET /analysis/{jobId}
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

        if (!pollRes.ok) {
          throw new Error(`API 오류: ${pollRes.status}`);
        }

        const pollBody = await pollRes.json();
        if (pollBody.status !== 200 || !pollBody.data) {
          throw new Error(pollBody.message || "분석 상태 조회 실패");
        }

        data = pollBody.data;
        if (data.status === "TRANSCRIPT_PROCESSING") set({ analysisStatus: "analyzing_transcript" });
        else if (data.status === "AI_PROCESSING") set({ analysisStatus: "analyzing_claims" });

        if (data.status === "COMPLETED" || data.status === "FAILED") break;
        await sleep(pollIntervalMs);
      }

      if (!data) throw new Error("분석 상태를 받지 못했습니다.");
      console.log(responseData);

      if (false && (responseData.status !== 200 || !responseData.data)) {
        throw new Error(responseData.message || "분석 요청 실패");
      }

      // const data = responseData.data;

      // [추가] 분석 실패(FAILED) 케이스 처리
      if (data.status === "FAILED") {
        const { title: scrapedTitle, channel: scrapedChannel } = scrapeMetadata();

        const failState = {
          analysisStatus: "error" as AnalysisStatus, // idle에서 error로 변경
          videoTitle: scrapedTitle,
          channelName: scrapedChannel,
          overallVerdict: "unknown" as Verdict,
          trustScore: 0,
          summary: "데이터 분석을 허용하지 않는 영상입니다. 하단의 버튼을 눌러 커뮤니티에서 직접 진위를 투표해 보세요!",
          isWarningVisible: false,
          warningCount: 0,
          claims: [],
          isResultModalOpen: true, // 에러 발생 시 즉시 모달 오픈
        };

        if (get().currentVideoId !== videoId) return;

        set((state) => ({
          ...failState,
          analyzedVideos: {
            ...state.analyzedVideos,
            [videoId]: failState,
          },
        }));
        return;
      }

      set({ analysisStatus: "verifying" });
      await new Promise((r) => setTimeout(r, 1000));

      // [핵심 수정] 폴링 API의 응답 구조(래퍼 유무) 차이 완벽 대응
      const resultObj = data.result?.analysis?.analysisResult || data.result?.analysis || data.result || {};

      // [보완] 실제 분석 데이터가 유효한지 다시 한 번 확인
      if (!resultObj.summary && !resultObj.trustGrade && !resultObj.confidenceScore) {
        set({ analysisStatus: "idle" });
        return;
      }

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

      // [개선] 백엔드에서 정보가 없거나(Unknown) 부족할 경우 로컬 데이터 또는 DOM 스크래핑 데이터 사용
      let finalTitle = youtubeInfo.videoTitle || data.videoTitle || get().videoTitle;
      let finalChannel = youtubeInfo.channelName || data.channelName || get().channelName;

      if (isUnknown(finalTitle) || isUnknown(finalChannel)) {
        const scraped = scrapeMetadata();
        if (isUnknown(finalTitle)) finalTitle = scraped.title;
        if (isUnknown(finalChannel)) finalChannel = scraped.channel;
      }

      const finalState = {
        analysisStatus: "complete" as AnalysisStatus,
        videoTitle: finalTitle,
        channelName: finalChannel,
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
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: finalState,
        },
      }));
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
          analysisStatus: "error",
          overallVerdict: "unknown",
          trustScore: 0,
          summary:
            "데이터 분석을 지원하지 않거나 분석 중 오류가 발생한 영상입니다. 판단은 커뮤니티에서 직접 진행해 주세요.",
          isWarningVisible: false,
          warningCount: 0,
          claims: [],
        });
        return;
      }

      // [핵심 수정] 동기 API의 응답 구조(래퍼 유무) 차이 완벽 대응
      const resultObj = data.result?.analysis?.analysisResult || data.result?.analysis || data.result || {};

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

      // [보완] 신뢰도 점수(trustScore) 추출 로직 강화 (checkAnalysisStatus와 통일)
      const rawScore = resultObj.confidenceScore ?? resultObj.confidence_score;
      const rawGrade = resultObj.trustGrade ?? resultObj.trust_grade;

      let extractedScore = 0;
      if (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) {
        extractedScore = Number(rawScore);
      } else if (rawGrade !== undefined && rawGrade !== null && !isNaN(Number(rawGrade))) {
        extractedScore = Number(rawGrade);
      }

      const youtubeInfo = data.result?.analysis?.youtubeInfo || {};
      const finalState = {
        analysisStatus: "complete" as AnalysisStatus,
        videoTitle: resultObj.videoTitle || youtubeInfo.videoTitle || data.videoTitle || get().videoTitle,
        channelName: resultObj.channelName || youtubeInfo.channelName || data.channelName || get().channelName,
        overallVerdict: mappedVerdict,
        trustScore: extractedScore,
        summary: resultObj.summary || "",
        isWarningVisible: mappedVerdict === "warning",
        warningCount: claims.length > 0 ? claims.length : mappedVerdict === "warning" ? 1 : 0,
        claims: claims,
      };

      // 분석 ID 추출 (백엔드 수정 반영: data.analysisId 확인)
      const finalAnalysisId = data.analysisId || data.id || resultObj.analysisId || resultObj.id || null;

      if (get().currentVideoId !== videoId) {
        return;
      }

      set((state) => ({
        ...finalState,
        analysisId: finalAnalysisId,
        // 분석 완료 시 반응 상태 초기화
        reactionSummary: { proCount: 0, conCount: 0 },
        myReaction: null,
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: { ...finalState, analysisId: finalAnalysisId },
        },
      }));

      // 분석 완료 즉시 투표 정보 조회
      if (finalAnalysisId) {
        get().fetchReactions(finalAnalysisId as number);
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
   * 로그인 상태 변경 + chrome.storage.local 캐시 동기화
   * - 로그인 성공 시: 유저 정보를 로컬에 캐시하여 다음 페이지 로드 시 즉시 복원
   * - 로그아웃 시: 캐시 및 토큰 전부 삭제
   */
  setLoginStatus: (isLoggedIn, user = null) => {
    if (isLoggedIn && user) {
      // [핵심] 로그인 성공 시 유저 정보를 chrome.storage.local에 캐시
      // → 다음 페이지 로드 시 네트워크 없이 즉시 복원 가능
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ checkmateUser: user });
      }
    } else {
      // 로그아웃 시 캐시 완전 삭제
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove(["jwtToken", "checkmateUser"]);
      }
      localStorage.removeItem("jwtToken");
    }
    set({ isLoggedIn, user });
  },

  setResultModalOpen: (open) => set({ isResultModalOpen: open }),

  checkAnalysisStatus: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // [핵심 수정] /check 대신 /latest를 호출하여 전체 분석 결과 데이터(JSON)를 가져옵니다.
      let response = await fetch(`${baseUrl}/analysis/latest?youtubeUrl=${encodeURIComponent(targetUrl)}`, {
        method: "GET",
        credentials: "include",
      });

      // [추가] 401 Unauthorized 처리: 새로고침 직후 인증이 풀려있을 경우 복구
      if (response.status === 401) {
        // 동적으로 상단 스코프의 initializeAuth 사용 (store.ts 하단에 선언되어 있음)
        const { initializeAuth } = await import("./store");
        await initializeAuth();

        if (get().isLoggedIn) {
          // 복구 성공 시 다시 요청
          response = await fetch(`${baseUrl}/analysis/latest?youtubeUrl=${encodeURIComponent(targetUrl)}`, {
            method: "GET",
            credentials: "include",
          });
        }
      }

      if (!response.ok) {
        console.log("checkAnalysisStatus: response not ok", response.status);
        set({ analysisStatus: "idle" });
        return;
      }

      const responseData = await response.json();
      console.log("checkAnalysisStatus: responseData", responseData);

      if (responseData.status === 200 && responseData.data) {
        const data = responseData.data;
        console.log("checkAnalysisStatus: data", data);

        if (data.status === "FAILED") {
          console.log("checkAnalysisStatus: data.status is FAILED");
          set({
            analysisStatus: "error",
            overallVerdict: "unknown",
            trustScore: 0,
            summary:
              "데이터 분석을 지원하지 않거나 분석 중 오류가 발생한 영상입니다. 판단은 커뮤니티에서 직접 진행해 주세요.",
            isWarningVisible: false,
            warningCount: 0,
            claims: [],
          });
          return;
        }

        // [핵심 수정] /sync API와 /latest API의 응답 구조(래퍼 유무) 차이 완벽 대응
        const resultObj = data.result?.analysis?.analysisResult || data.result?.analysis || data.result || {};
        console.log("checkAnalysisStatus: resultObj", resultObj);

        if (!resultObj.summary && !resultObj.trustGrade && !resultObj.confidenceScore) {
          console.log("checkAnalysisStatus: missing summary/trustGrade/confidenceScore");
          set({ analysisStatus: "idle" });
          return;
        }

        let mappedVerdict: Verdict = "unknown";
        const grade = (resultObj.trustGrade || "").toUpperCase();
        if (grade === "SAFE" || grade === "GOOD") mappedVerdict = "safe";
        else if (grade === "WARNING" || grade === "DANGER") mappedVerdict = "warning";

        const violations = data.result?.analysis?.violations || resultObj.violations || [];
        const claims: Claim[] = violations.map((v: any, idx: number) => ({
          id: `v-${idx}`,
          text: v.violationSentence || "내용 없음",
          verdict: "warning" as Verdict,
          evidence: v.reason || "",
          sources: [],
          votesTrue: 0,
          votesFake: 0,
        }));

        const rawScore = resultObj.confidenceScore ?? resultObj.confidence_score;
        const rawGrade = resultObj.trustGrade ?? resultObj.trust_grade;

        let extractedScore = 0;
        if (rawScore !== undefined && rawScore !== null && !isNaN(Number(rawScore))) {
          extractedScore = Number(rawScore);
        } else if (rawGrade !== undefined && rawGrade !== null && !isNaN(Number(rawGrade))) {
          extractedScore = Number(rawGrade);
        }

        const youtubeInfo = data.result?.analysis?.youtubeInfo || {};
        const finalState = {
          analysisStatus: "complete" as AnalysisStatus,
          videoTitle: resultObj.videoTitle || youtubeInfo.videoTitle || data.videoTitle || get().videoTitle,
          channelName: resultObj.channelName || youtubeInfo.channelName || data.channelName || get().channelName,
          overallVerdict: mappedVerdict,
          trustScore: extractedScore,
          summary: resultObj.summary || "",
          isWarningVisible: mappedVerdict === "warning",
          warningCount: claims.length > 0 ? claims.length : mappedVerdict === "warning" ? 1 : 0,
          claims: claims,
        };

        // 분석 ID 추출 (백엔드 수정 반영: data.analysisId 확인)
        const finalAnalysisId = data.analysisId || data.id || resultObj.analysisId || resultObj.id || null;

        set((state) => ({
          ...finalState,
          analysisId: finalAnalysisId,
          // 영상 변경 시 반응 상태 초기화
          reactionSummary: { proCount: 0, conCount: 0 },
          myReaction: null,
          analyzedVideos: { ...state.analyzedVideos, [videoId]: { ...finalState, analysisId: finalAnalysisId } },
        }));

        // ID가 있으면 즉시 투표 현황 조회
        if (finalAnalysisId) {
          get().fetchReactions(finalAnalysisId as number);
        }
      }
    } catch (error) {
      console.error("분석 상태 체크 실패:", error);
      set({ analysisStatus: "idle" });
    }
  },

  fetchReactions: async (analysisId) => {
    console.log("fetchReactions 호출:", analysisId);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    try {
      const response = await fetch(`${baseUrl}/community/reactions?analysisId=${analysisId}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        console.log("fetchReactions 결과:", result);
        const reactions: any[] = result.data || [];

        const proCount = reactions.filter((r) => r.reactionType === true).length;
        const conCount = reactions.filter((r) => r.reactionType === false).length;

        const myUser = get().user;
        const myReactionObj = myUser ? reactions.find((r) => String(r.userId) === String(myUser.id)) : null;

        set({
          reactionSummary: { proCount, conCount },
          myReaction: myReactionObj ? myReactionObj.reactionType : null,
        });
      }
    } catch (error) {
      console.error("반응 조회 실패:", error);
    }
  },

  postReaction: async (analysisId, reactionType) => {
    console.log("postReaction 호출:", { analysisId, reactionType });
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    // Optimistic UI
    const prevState = { ...get().reactionSummary, myReaction: get().myReaction };
    set((state) => {
      if (state.myReaction === reactionType) return state;
      const newPro = state.reactionSummary.proCount + (reactionType ? 1 : 0) - (state.myReaction === true ? 1 : 0);
      const newCon = state.reactionSummary.conCount + (!reactionType ? 1 : 0) - (state.myReaction === false ? 1 : 0);
      return {
        myReaction: reactionType,
        reactionSummary: { proCount: Math.max(0, newPro), conCount: Math.max(0, newCon) },
      };
    });

    try {
      const response = await fetch(`${baseUrl}/community/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ analysisId, reactionType }),
      });

      if (!response.ok) throw new Error("투표 요청 실패");
      await get().fetchReactions(analysisId);
    } catch (error) {
      console.error("투표 실패:", error);
      set({
        myReaction: prevState.myReaction,
        reactionSummary: { proCount: prevState.proCount, conCount: prevState.conCount },
      });
      alert("투표 중 오류가 발생했습니다. (ID Missing 이슈가 지속되면 재로그인 해주세요)");
    }
  },
}));

/**
 * 앱 로드 시 서버에 /auth/me 요청을 보내어 HttpOnly 쿠키 기반 인증 상태를 복원합니다.
 */
/**
 * [하이브리드 자동 로그인 전략]
 *
 * 기존 문제: isLoggedIn 초기값이 false이므로, initializeAuth()의 비동기 응답(~1~2초)
 * 완료 전에 LoginView가 항상 먼저 렌더링되는 Flash(깜빡임) 현상 발생.
 *
 * 해결 전략 (2-Phase):
 *   Phase 1 - 즉시 복원 (0ms): chrome.storage.local에 캐시된 유저 정보가 있으면
 *             네트워크 요청 없이 isLoggedIn: true로 즉시 설정 → Flash 완전 제거
 *   Phase 2 - 백그라운드 검증 (비동기): 서버에 /auth/me를 요청하여 세션 유효성 확인.
 *             토큰이 만료된 경우 /auth/reissue로 재발급 시도.
 *             최종적으로 서버 검증 실패 시에만 강제 로그아웃 + 캐시 삭제.
 */
export const initializeAuth = async () => {
  const store = useCheckmateStore.getState();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // ─── Phase 1: chrome.storage.local 캐시 즉시 복원 ───────────────────────────
  // 목적: 네트워크 대기 없이 이전 세션의 유저 정보로 UI를 즉시 렌더링
  // 효과: LoginView Flash(깜빡임) 완전 제거
  if (typeof chrome !== "undefined" && chrome.storage) {
    try {
      const cached = await new Promise<{ checkmateUser?: User }>((resolve) => {
        chrome.storage.local.get(["checkmateUser"], (items) => {
          resolve(items as { checkmateUser?: User });
        });
      });
      if (cached.checkmateUser) {
        // 캐시 히트: 서버 응답 전에 즉시 로그인 상태로 전환
        // isAuthInitializing은 아직 true → 서버 검증 완료 후 false로 변경
        useCheckmateStore.setState({ isLoggedIn: true, user: cached.checkmateUser });
      }
    } catch {
      // chrome.storage 접근 실패 시 조용히 무시하고 Phase 2로 진행
    }
  }

  // ─── Phase 2: 서버 세션 유효성 백그라운드 검증 ──────────────────────────────
  // 목적: 캐시가 있더라도 실제 서버 세션이 유효한지 반드시 확인
  // 실패 시: 캐시 삭제 + 강제 로그아웃 (보안 보장)
  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.name) {
        // 서버 검증 성공: 최신 유저 정보로 갱신 (백엔드 필드 userId 대응)
        store.setLoginStatus(true, { id: result.data.userId, name: result.data.name });
        return;
      }
    } else if (response.status === 401 || response.status === 403) {
      // Access Token 만료 → Refresh Token으로 재발급 시도
      const reissueResponse = await fetch(`${baseUrl}/auth/reissue`, {
        method: "POST",
        credentials: "include",
      });

      if (reissueResponse.ok) {
        // 재발급 성공 → 유저 정보 재요청
        const retryResponse = await fetch(`${baseUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (retryResponse.ok) {
          const retryResult = await retryResponse.json();
          if (retryResult.data && retryResult.data.name) {
            // 백엔드 필드 userId 대응
            store.setLoginStatus(true, { id: retryResult.data.userId, name: retryResult.data.name });
            return;
          }
        }
      } else {
        console.warn("[Checkmate] 리프레시 토큰 만료 → 재로그인 필요");
      }
    }

    // 서버 검증 최종 실패 → 캐시 삭제 + 로그아웃
    store.setLoginStatus(false, null);
  } catch (error) {
    // 네트워크 오류(백엔드 다운 등) 시 처리
    // 캐시로 이미 복원된 상태라면 오프라인 허용 (강제 로그아웃 하지 않음)
    const currentState = useCheckmateStore.getState();
    if (!currentState.isLoggedIn) {
      // 캐시도 없고 서버도 실패 → 로그아웃 상태 확정
      store.setLoginStatus(false, null);
    } else {
      console.warn("[Checkmate] 서버 검증 실패, 캐시 세션 유지 (네트워크 오류)");
    }
  } finally {
    // Phase 2 완료: 로딩 스켈레톤 해제
    useCheckmateStore.setState({ isAuthInitializing: false });
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
