import { create } from "zustand";
import { MOCK_ANALYSIS_RESULTS } from "./constants/mock-data";
import { isUnknown, scrapeMetadata } from "./youtube-utils";
import { analysisApi, communityApi, authApi, reportApi } from "./api";

export type Tab = "report" | "community";
export type Verdict = "safe" | "warning" | "unknown";
export type AnalysisStatus =
  | "loading"
  | "idle"
  | "checking"
  | "detecting"
  | "analyzing_transcript"
  | "analyzing_claims"
  | "verifying"
  | "restoring"
  | "complete"
  | "error";

/**
 * [원터치 신고 사유 매핑 상수]
 */
export const REPORT_REASONS = [
  {
    id: "medical",
    label: "가짜 의료/건강 정보",
    reasonId: "M",
    secondaryReasonId: "",
    description: "잘못된 의료 정보 (잘못된 치료법 등)",
  },
  {
    id: "dangerous",
    label: "위험한 허위 정보",
    reasonId: "V",
    secondaryReasonId: "40",
    description: "기타 위험한 행위 (사회적 혼란 야기 등)",
  },
  {
    id: "defamation",
    label: "비방 및 명예훼손",
    reasonId: "H",
    secondaryReasonId: "",
    description: "특정인에 대한 허위 비방 및 폭로",
  },
];

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
  userId: number;
  username: string;
  message: string;
  badge?: "verifier" | "reporter";
  createdAt?: string;
  parentId?: string | null;
  replies?: ChatMessage[];
}

const mapCommentTree = (comment: any): ChatMessage => ({
  id: String(comment.id),
  userId: comment.userId,
  username: comment.userName,
  message: comment.content,
  createdAt: comment.createdAt,
  parentId: comment.parentCommentId == null ? null : String(comment.parentCommentId),
  replies: Array.isArray(comment.replies) ? comment.replies.map(mapCommentTree) : [],
});

const appendReplyToTree = (messages: ChatMessage[], parentId: string, reply: ChatMessage): ChatMessage[] =>
  messages.map((message) => {
    if (message.id === parentId) {
      return { ...message, replies: [...(message.replies || []), reply] };
    }
    return {
      ...message,
      replies: message.replies ? appendReplyToTree(message.replies, parentId, reply) : [],
    };
  });

const updateMessageTree = (messages: ChatMessage[], commentId: string, content: string): ChatMessage[] =>
  messages.map((message) => ({
    ...message,
    message: message.id === commentId ? content : message.message,
    replies: message.replies ? updateMessageTree(message.replies, commentId, content) : [],
  }));

const deleteMessageTree = (messages: ChatMessage[], commentId: string): ChatMessage[] =>
  messages
    .filter((message) => message.id !== commentId)
    .map((message) => ({
      ...message,
      replies: message.replies ? deleteMessageTree(message.replies, commentId) : [],
    }));

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
  analysisId: number | null; // RDB PK
  claims: Claim[];
  errorMsg: string | null;

  // 커뮤니티 데이터
  communityVotes: { trueVotes: number; fakeVotes: number; userVote: boolean | null; userReactionId: number | null };
  wantedCards: WantedCard[];
  chatMessages: ChatMessage[];

  // [영상 단위 커뮤니티 반응]
  /** 전체 반응 요약 */
  reactionSummary: { proCount: number; conCount: number };
  /** 현재 유저의 투표 여부 (true=찬성, false=반대, null=미투표) */
  myReaction: boolean | null;

  // 분석 결과 캐시
  analyzedVideos: Record<string, Partial<CheckmateState>>;

  // 신고 상태
  isReportModalOpen: boolean;
  reportingStatus: "idle" | "loading" | "success" | "error";

  // 페이지네이션 상태
  commentPagination: {
    currentPage: number;
    hasNext: boolean;
    totalPages: number;
    totalElements: number;
  };

  // 액션 (상태 변경 함수들)
  openPanel: () => void;
  closePanel: () => void;
  setActiveTab: (tab: Tab) => void;
  showWarning: (count: number) => void;
  closeWarning: () => void;
  startAnalysis: () => Promise<void>;
  startAnalysisSync: () => Promise<void>;
  startDemoAnalysis: () => void;
  checkExistingAnalysis: (videoId: string) => Promise<void>;
  pollAnalysisJob: (videoId: string, jobId: string) => Promise<void>;
  mapAnalysisResult: (videoId: string, data: any) => void;
  setCurrentVideo: (id: string, title?: string, channel?: string) => void;
  fetchReactions: (analysisId: number) => Promise<void>;
  postReaction: (analysisId: number, reactionType: boolean) => Promise<void>;
  voteOnCard: (cardId: string, vote: "true" | "fake") => void;
  voteOnClaim: (claimId: string, vote: "true" | "fake") => void;
  fetchComments: (analysisId: number, page?: number) => Promise<void>;
  addComment: (content: string, parentCommentId?: string | number | null) => Promise<void>;
  updateComment: (commentId: string | number, content: string) => Promise<void>;
  deleteComment: (commentId: string | number) => Promise<void>;
  addChatMessage: (msg: { username: string; message: string; badge?: "verifier" | "reporter" }) => void;
  setResultModalOpen: (open: boolean) => void;
  checkAnalysisStatus: () => Promise<void>;

  // 인증 액션
  setLoginStatus: (isLoggedIn: boolean, user?: User | null) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setErrorMsg: (msg: string | null) => void;

  // 신고 액션
  setReportModalOpen: (open: boolean) => void;
  submitReport: (reasonId: string, secondaryReasonId: string) => Promise<void>;
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
  analysisStatus: "loading",
  videoTitle: "",
  channelName: "",
  currentVideoId: null,
  trustScore: 0,
  overallVerdict: "unknown",
  summary: "",
  analysisId: null,
  claims: [],
  errorMsg: null,
  communityVotes: { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null },
  analyzedVideos: {},
  commentPagination: { currentPage: 0, hasNext: false, totalPages: 0, totalElements: 0 },

  // 커뮤니티 투표 초기 상태
  reactionSummary: { proCount: 0, conCount: 0 },
  myReaction: null,

  // 신고 초기 상태
  isReportModalOpen: false,
  reportingStatus: "idle",

  // 인증 초기 상태
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
    { id: "1", userId: 0, username: "팩트체커", message: "이 영상 3분 12초 부분 자막이 이상해요.", badge: "verifier" },
    { id: "2", userId: 0, username: "익명", message: "저도 그렇게 생각합니다." },
    { id: "3", userId: 0, username: "제보왕", message: "다른 출처도 찾아보고 있어요.", badge: "reporter" },
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
      chatMessages: [
        ...state.chatMessages,
        {
          id: Date.now().toString(),
          userId: 0,
          username: msg.username,
          message: msg.message,
          badge: msg.badge,
        },
      ],
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
        isResultModalOpen: false,
        errorMsg: null, // 캐시된 영상으로 돌아올 때도 에러 메시지 초기화
        ...cachedData,
      });

      if (cachedData.analysisId) {
        get().fetchReactions(cachedData.analysisId as number);
      }
    } else {
      // 새로운 영상이면 초기화
      set({
        currentVideoId: id,
        videoTitle: finalTitle,
        channelName: finalChannel,
        analysisStatus: "checking",
        overallVerdict: "unknown",
        trustScore: 0,
        summary: "",
        analysisId: null,
        isWarningVisible: false,
        isPanelOpen: false, // 영상 변경 시 패널 닫기
        isResultModalOpen: false, // 영상 변경 시 모달 닫기
        errorMsg: null, // 에러 메시지 초기화
        claims: [],
        warningCount: 0,
        chatMessages: [],
        commentPagination: { currentPage: 0, hasNext: false, totalPages: 0, totalElements: 0 },
        communityVotes: { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null },
        reactionSummary: { proCount: 0, conCount: 0 },
        myReaction: null,
      });

      // 서버에서 기존 분석 이력이 있는지 확인
      get().checkExistingAnalysis(id);
    }
  },

  /**
   * 분석 결과 데이터를 프런트엔드 상태로 매핑
   */
  mapAnalysisResult: (videoId: string, data: any) => {
    /**
     * 백엔드 AnalysisJobGetResponse.result 구조 (AI 워커 → Kafka → BE 저장):
     *   result: { videoId, videoTitle, channelName, trustGrade, confidenceScore, summary, violations }
     * 또는 레거시: result: { analysis: { trustGrade, ... }, transcript: {...} }
     * 방어적으로 여러 경로를 순서대로 탐색.
     */


    const rawResult = data.result || data;
    const resultObj =
      rawResult?.analysis ?? // 레거시 구조: result.analysis
      rawResult?.result?.analysis ?? // 중첩된 경우
      rawResult; // AI 워커 최종 payload 구조: result에 trustGrade 직접

    let mappedVerdict: Verdict = "unknown";

    if (resultObj.trustGrade === "SAFE" || resultObj.trustGrade === "GOOD") mappedVerdict = "safe";
    else if (resultObj.trustGrade === "WARNING" || resultObj.trustGrade === "DANGER") mappedVerdict = "warning";

    // violations: result.analysis.violations 또는 레거시 경로
    const violations = resultObj.violations || rawResult?.violations || [];
    const claims: Claim[] = violations.map((v: any, idx: number) => ({
      id: `v-${idx}`,
      text: v.violationSentence || "내용 없음",
      verdict: "warning" as Verdict,
      evidence: v.reason || "",
      sources: [],
      votesTrue: 0,
      votesFake: 0,
    }));

    // [개선] 제목/채널명: result.analysis.youtubeInfo 또는 다른 경로
    const youtubeInfo = rawResult?.analysis?.youtubeInfo || rawResult?.youtubeInfo || {};
    let finalTitle =
      youtubeInfo.videoTitle ||
      resultObj.videoTitle ||
      data.videoTitle ||
      get().videoTitle;
    let finalChannel =
      youtubeInfo.channelName ||
      resultObj.channelName ||
      data.channelName ||
      get().channelName;

    if (isUnknown(finalTitle) || isUnknown(finalChannel)) {
      const scraped = scrapeMetadata();
      if (isUnknown(finalTitle)) finalTitle = scraped.title;
      if (isUnknown(finalChannel)) finalChannel = scraped.channel;
    }

    // analysisId는 응답 구조의 여러 경로에서 탐색 (방어적 처리)
    const rawAnalysisId =
      data.analysisId ??
      resultObj.analysisId ??
      data.result?.analysisId ??
      null;
    const resolvedAnalysisId = rawAnalysisId != null ? Number(rawAnalysisId) : null;

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
      analysisId: resolvedAnalysisId,
    };

    if (get().currentVideoId !== videoId) return;

    set((state) => ({
      ...finalState,
      analyzedVideos: {
        ...state.analyzedVideos,
        [videoId]: finalState,
      },
    }));

    if (finalState.analysisId !== null) {
      get().fetchReactions(finalState.analysisId);
    }
  },

  checkExistingAnalysis: async (videoId: string) => {
    const { isLoggedIn, isAuthInitializing, currentVideoId } = get();

    // 인증 초기화 중이면 완료될 때까지 대기 (레이스 컨디션 방지)
    if (isAuthInitializing) {
      return;
    }

    // 로그인 상태가 아닐 때는 분석 내역 확인을 생략하고 대기 상태로 전환
    if (!isLoggedIn) {
      if (currentVideoId === videoId) {
        set({ analysisStatus: "idle" });
      }
      return;
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const response = await analysisApi.checkExisting(targetUrl);

      if (!response.ok) {
        if (response.status === 401) {
          get().setLoginStatus(false, null);
        }
        throw new Error(`API Error: ${response.status}`);
      }
      const body = await response.json();

      if (body.status === 200 && body.data) {
        const { isAnalyzed, jobId, jobStatus } = body.data;

        if (isAnalyzed && jobId) {
          if (jobStatus === "COMPLETED") {
            const resultBody = await analysisApi.getJobStatus(jobId);
            if (resultBody.status === 200 && resultBody.data) {
              const jobData = resultBody.data;

              // result가 비어있거나 trustGrade가 없는 경우 /result fallback
              const rawRes = jobData.result;
              const hasTrustGrade =
                rawRes?.trustGrade ||
                rawRes?.analysis?.trustGrade;

              if (!hasTrustGrade && jobData.analysisId) {
                // DB에서 직접 결과 조회 (Kafka 타이밍 문제 우회)
                console.warn('[Checkmate] result가 비어있음, /result fallback 시도');
                const reportBody = await analysisApi.getResult(jobId);
                if (reportBody.status === 200 && reportBody.data?.trustGrade) {
                  const d = reportBody.data;
                  // AnalysisReportResponse 구조를 mapAnalysisResult 호환 형태로 변환
                  const syntheticData = {
                    result: d,
                    analysisId: jobData.analysisId,
                  };
                  if (get().currentVideoId === videoId) set({ analysisStatus: "restoring" });
                  await new Promise((r) => setTimeout(r, 800));
                  get().mapAnalysisResult(videoId, syntheticData);
                  return;
                }
              }

              // 정상 경로
              if (get().currentVideoId === videoId) {
                set({ analysisStatus: "restoring" });
              }
              await new Promise((r) => setTimeout(r, 800));
              get().mapAnalysisResult(videoId, jobData);
              return;
            }
          } else if (jobStatus === "FAILED") {
            // AI 분석 실패 → "error" 상태로 전환 (분석 실패 UI 표시)
            console.log('[Checkmate] checkExistingAnalysis: FAILED job detected', jobId);
            if (get().currentVideoId === videoId) {
              set({
                analysisStatus: "error",
                errorMsg: "AI 분석 중 오류가 발생했습니다. 다시 시도하거나 커뮤니티에서 직접 투표해 보세요.",
              });
            }
            return;
          } else {
            // 아직 처리 중 → 폴링 시작
            get().pollAnalysisJob(videoId, jobId);
            return;
          }
        }
      }

      if (get().currentVideoId === videoId) {
        set({ analysisStatus: "idle" });
      }
    } catch (err) {
      console.error("[Checkmate] Check failed", err);
      if (get().currentVideoId === videoId) {
        set({ analysisStatus: "idle" });
      }
    }
  },

  /**
   * 분석 작업의 상태를 주기적으로 확인 (Polling)
   */
  pollAnalysisJob: async (videoId: string, jobId: string) => {
    const pollIntervalMs = 1500;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      let data: any | null = null;
      while (!controller.signal.aborted) {
        const pollBody = await analysisApi.getJobStatus(jobId, controller.signal);

        if (pollBody.status === 401) {
          await initializeAuth();
          if (!get().isLoggedIn) throw new Error("Unauthorized");
          continue;
        }

        if (pollBody.status !== 200 || !pollBody.data) throw new Error(pollBody.message || "분석 상태 조회 실패");

        data = pollBody.data;
        const beStatus = data.status;
        const currentUI = get().analysisStatus;

        // UI 상태가 건너뛰어지는 것을 방지하기 위한 인위적 순차 딜레이
        // 1) detecting (25%) 상태 유지
        if (currentUI === "detecting") {
          await sleep(2500); 
          if (beStatus !== "FAILED") {
            set({ analysisStatus: "analyzing_transcript" });
          }
        }

        // 2) analyzing_transcript (50%) 상태 유지
        if (get().analysisStatus === "analyzing_transcript" && (beStatus === "AI_PROCESSING" || beStatus === "COMPLETED")) {
          await sleep(4000); 
          set({ analysisStatus: "analyzing_claims" });
        }

        // 3) analyzing_claims (75%) 상태 유지 (COMPLETED 시 바로 95%로 넘어가는 것 방지)
        if (get().analysisStatus === "analyzing_claims" && beStatus === "COMPLETED") {
          await sleep(3000); 
        }

        // 혹시라도 건너뛰어진 상태가 있다면 보정
        if (beStatus === "TRANSCRIPT_PROCESSING" && get().analysisStatus !== "analyzing_transcript") {
          set({ analysisStatus: "analyzing_transcript" });
        } else if (beStatus === "AI_PROCESSING" && get().analysisStatus !== "analyzing_claims") {
          set({ analysisStatus: "analyzing_claims" });
        }

        if (beStatus === "COMPLETED" || beStatus === "FAILED") break;
        await sleep(pollIntervalMs);
      }

      if (controller.signal.aborted) return;
      if (!data) throw new Error("분석 상태를 받지 못했습니다.");

      if (data.status === "FAILED") {
        // AI 분석 실패 → "error" 상태로 전환 (분석 실패 UI 표시)
        if (get().currentVideoId === videoId) {
          set({
            analysisStatus: "error",
            errorMsg: "AI 분석 중 오류가 발생했습니다. 다시 시도하거나 커뮤니티에서 직접 투표해 보세요.",
          });
        }
        return;
      }

      set({ analysisStatus: "verifying" });
      await sleep(1000);

      // result가 비어있으면 /result 엔드포인트로 fallback
      const rawRes = data.result;
      const hasTrustGrade = rawRes?.trustGrade || rawRes?.analysis?.trustGrade;
      if (!hasTrustGrade && data.analysisId) {
        const reportBody = await analysisApi.getResult(jobId);
        if (reportBody.status === 200 && reportBody.data?.trustGrade) {
          get().mapAnalysisResult(videoId, { result: reportBody.data, analysisId: data.analysisId });
          return;
        }
      }

      get().mapAnalysisResult(videoId, data);
    } catch (error) {
      console.error("폴링 중 오류 발생:", error);
      if (get().currentVideoId === videoId) {
        set({ analysisStatus: "error" });
      }
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * 영상 분석 요청
   */
  startAnalysis: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting", isWarningVisible: false });

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const response = await analysisApi.requestAnalysis(targetUrl);

      if (!response.ok) {
        if (response.status === 401) {
          get().setLoginStatus(false, null);
        }
        throw new Error(`API 오류: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status !== 202 || !responseData.data?.jobId) {
        throw new Error(responseData.message || "분석 요청 실패");
      }

      const jobId: string = responseData.data.jobId;
      await get().pollAnalysisJob(videoId, jobId);
    } catch (error) {
      console.error("분석 시작 중 오류 발생:", error);
      set({ analysisStatus: "error" });
    }
  },

  /**
   * 현재 영상에 대한 커뮤니티 반응(투표) 목록을 가져옵니다.
   */
  fetchReactions: async (analysisId) => {
    const currentUser = get().user;

    try {
      const response = await communityApi.getReactions(analysisId);

      if (!response.ok) {
        if (response.status === 401) {
          get().setLoginStatus(false, null);
        }
        throw new Error(`API Error: ${response.status}`);
      }
      const body = await response.json();

      if (body.status === 200 && Array.isArray(body.data)) {
        const reactions = body.data;
        const proCount = reactions.filter((r: any) => r.reactionType === true).length;
        const conCount = reactions.filter((r: any) => r.reactionType === false).length;

        const myReactionObj = currentUser
          ? reactions.find((r: any) => String(r.userId) === String(currentUser.id))
          : null;

        set({
          reactionSummary: { proCount, conCount },
          myReaction: myReactionObj ? myReactionObj.reactionType : null,
          communityVotes: {
            trueVotes: proCount,
            fakeVotes: conCount,
            userVote: myReactionObj ? myReactionObj.reactionType : null,
            userReactionId: myReactionObj ? myReactionObj.id : null,
          },
        });
      }
    } catch (err) {
      console.error("[Reaction] Fetch failed", err);
    }
  },

  /**
   * 커뮤니티 반응(진실/허위)을 게시하거나 수정합니다.
   * 낙관적 업데이트(Optimistic UI)를 적용하여 즉각적인 피드백을 제공합니다.
   */
  postReaction: async (analysisId, reactionType) => {
    const { isLoggedIn, communityVotes, fetchReactions, myReaction, reactionSummary } = get();
    if (!isLoggedIn) return;

    // ─── 낙관적 업데이트 (Optimistic UI) ───────────────────────────────────────
    const prevState = { ...reactionSummary, myReaction };
    set((state) => {
      if (state.myReaction === reactionType) return state;
      const newPro = state.reactionSummary.proCount + (reactionType ? 1 : 0) - (state.myReaction === true ? 1 : 0);
      const newCon = state.reactionSummary.conCount + (!reactionType ? 1 : 0) - (state.myReaction === false ? 1 : 0);
      return {
        myReaction: reactionType,
        reactionSummary: { proCount: Math.max(0, newPro), conCount: Math.max(0, newCon) },
      };
    });
    // ──────────────────────────────────────────────────────────────────────────

    const userReactionId = communityVotes.userReactionId;

    try {
      let body;
      if (userReactionId) {
        body = await communityApi.putReaction(userReactionId, reactionType);
      } else {
        body = await communityApi.postReaction(analysisId, reactionType);
      }

      if (body.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().postReaction(analysisId, reactionType);
        return;
      }

      if (body.status === 201 || body.status === 200) {
        await fetchReactions(analysisId);
      } else {
        throw new Error("투표 요청 실패");
      }
    } catch (err) {
      console.error("[Reaction] Operation failed", err);
      // 에러 발생 시 이전 상태로 롤백
      set({
        myReaction: prevState.myReaction,
        reactionSummary: { proCount: prevState.proCount, conCount: prevState.conCount },
      });
      alert("투표 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  },

  fetchComments: async (analysisId, page = 0) => {
    try {
      const body = await communityApi.getComments(analysisId, page);
      if (body.status === 200 && body.data) {
        const { content, page: currentPage, hasNext, totalPages, totalElements } = body.data;

        const newComments = content.map(mapCommentTree).reverse();

        set((state) => ({
          chatMessages: page === 0 ? newComments : [...newComments, ...state.chatMessages],
          commentPagination: {
            currentPage,
            hasNext,
            totalPages,
            totalElements,
          },
        }));
      }
    } catch (err) {
      console.error("[Comment] Fetch failed", err);
    }
  },

  addComment: async (content: string, parentCommentId = null) => {
    const { isLoggedIn, analysisId } = get();
    if (!isLoggedIn || !analysisId) return;

    try {
      const body = await communityApi.postComment(analysisId, content, parentCommentId);

      if (body.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().addComment(content, parentCommentId);
        return;
      }

      if (body.status === 201 || body.status === 200) {
        const newC = body.data;
        if (newC) {
          const mapped = mapCommentTree(newC);
          set((state) => ({
            chatMessages: parentCommentId
              ? appendReplyToTree(state.chatMessages, String(parentCommentId), mapped)
              : [...state.chatMessages, mapped],
          }));
        }
      }
    } catch (err) {
      console.error("[Comment] Post failed", err);
    }
  },

  updateComment: async (commentId: string | number, content: string) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;

    try {
      const body = await communityApi.putComment(commentId, content);

      if (body.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().updateComment(commentId, content);
        return;
      }

      if (body.status === 200) {
        set((state) => ({
          chatMessages: updateMessageTree(state.chatMessages, String(commentId), content),
        }));
      }
    } catch (err) {
      console.error("[Comment] Update failed", err);
    }
  },

  deleteComment: async (commentId: string | number) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;

    try {
      const body = await communityApi.deleteComment(commentId);

      if (body.status === 401) {
        await initializeAuth();
        if (get().isLoggedIn) return get().deleteComment(commentId);
        return;
      }

      if (body.status === 200) {
        set((state) => ({
          chatMessages: deleteMessageTree(state.chatMessages, String(commentId)),
        }));
      }
    } catch (err) {
      console.error("[Comment] Delete failed", err);
    }
  },

  startDemoAnalysis: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "checking", isWarningVisible: false });

    try {
      await new Promise((r) => setTimeout(r, 4000));
      set({ analysisStatus: "detecting" });
      await new Promise((r) => setTimeout(r, 4000));
      set({ analysisStatus: "analyzing_transcript" });
      await new Promise((r) => setTimeout(r, 4000));
      set({ analysisStatus: "analyzing_claims" });
      await new Promise((r) => setTimeout(r, 4000));
      set({ analysisStatus: "verifying" });

      await new Promise((resolve) => setTimeout(resolve, 4000));

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
        analysisId: 999,
        communityVotes: { trueVotes: 42, fakeVotes: 12, userVote: null, userReactionId: null },
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

  startAnalysisSync: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;

    set({ analysisStatus: "detecting", isWarningVisible: false });

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await analysisApi.requestAnalysisSync(targetUrl, controller.signal);

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
        id: v.violationId?.toString() || `claim-${videoId}-${idx}`, // 고유 ID 보장
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

      const analysisId = data.analysisId ? Number(data.analysisId) : null;

      set((state) => ({
        ...finalState,
        analysisId,
        analyzedVideos: {
          ...state.analyzedVideos,
          [videoId]: { ...finalState, analysisId },
        },
      }));

      if (analysisId !== null) {
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
        chrome.storage.local.remove("checkmateUser");
      }
      localStorage.removeItem("jwtToken");
    }

    set({ isLoggedIn, user });

    if (isLoggedIn && get().analysisId) {
      get().fetchReactions(get().analysisId!);
    }
  },

  setAnalysisStatus: (status) => set({ analysisStatus: status }),

  setErrorMsg: (msg) => set({ errorMsg: msg }),

  setResultModalOpen: (open) => set({ isResultModalOpen: open }),

  setReportModalOpen: (open) => set({ isReportModalOpen: open }),

  submitReport: async (reasonId: string, secondaryReasonId: string) => {
    const videoId = get().currentVideoId;
    const analysisId = get().analysisId;
    if (!videoId) {
      console.error('[Report] videoId가 없습니다!');
      return;
    }

    set({ reportingStatus: "loading" });

    try {
      /**
       * YouTube reportAbuse API는 사용자의 Google OAuth 액세스 토큰이 필수입니다.
       * chrome.identity.getAuthToken으로 토큰을 획득하여 백엔드에 전달합니다.
       */
      const token: string = await new Promise((resolve, reject) => {
        if (typeof chrome === "undefined" || !chrome.runtime) {
          reject(new Error("Google 로그인이 필요합니다. 크롬 익스텐션 환경에서 실행해 주세요."));
          return;
        }
        
        chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error("익스텐션 내부 통신 에러: " + chrome.runtime.lastError.message));
          } else if (!response) {
            reject(new Error("인증 서버로부터 응답이 없습니다."));
          } else if (response.error) {
            reject(new Error("Google 인증 실패: " + response.error));
          } else if (!response.token) {
            reject(new Error("인증 토큰을 가져오지 못했습니다."));
          } else {
            resolve(response.token);
          }
        });
      });
      const res = await reportApi.submitReport(videoId, reasonId, secondaryReasonId, token);
      if (res.status === 200 || res.status === 201 || res.ok) {
        set({ reportingStatus: "success" });
        setTimeout(() => set({ reportingStatus: "idle", isReportModalOpen: false }), 2000);
      } else {
        throw new Error(res.message || "신고 처리에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("[Report] Failed", err);
      set({ reportingStatus: "error", errorMsg: err.message || "신고 중 오류가 발생했습니다." });
    }
  },

  checkAnalysisStatus: async () => {
    const videoId = get().currentVideoId;
    if (!videoId) return;
    await get().checkExistingAnalysis(videoId);
  },
}));

/**
 * 앱 로드 시 서버에 /auth/me 요청을 보내어 HttpOnly 쿠키 기반 인증 상태를 복원합니다.
 * [하이브리드 자동 로그인 전략 (2-Phase)]
 *
 * 해결 전략:
 *   Phase 1 - 즉시 복원 (0ms): chrome.storage.local에 캐시된 유저 정보가 있으면
 *             isLoggedIn: true로 즉시 설정하여 Flash 현상 제거.
 *   Phase 2 - 백그라운드 검증: 서버에 /auth/me를 요청하여 세션 유효성 확인 및 갱신.
 */
export const initializeAuth = async () => {
  const store = useCheckmateStore.getState();

  // Phase 1: chrome.storage.local 캐시 즉시 복원
  if (typeof chrome !== "undefined" && chrome.storage) {
    try {
      const cached = await new Promise<{ checkmateUser?: User }>((resolve) => {
        chrome.storage.local.get(["checkmateUser"], (items) => {
          resolve(items as { checkmateUser?: User });
        });
      });
      if (cached.checkmateUser) {
        useCheckmateStore.setState({ isLoggedIn: true, user: cached.checkmateUser });
      }
    } catch {}
  }

  // Phase 2: 서버 세션 유효성 백그라운드 검증
  try {
    const response = await authApi.getMe();

    if (response.ok) {
      const result = await response.json();
      if (result.data && result.data.name) {
        const userId = result.data.id || result.data.userId;
        store.setLoginStatus(true, { id: userId, name: result.data.name });

        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ checkmateUser: { id: userId, name: result.data.name } });
        }
        return;
      }
    }
    // doFetch가 reissue를 시도했음에도 여기까지 왔다면 로그인이 필요한 상태임
    store.setLoginStatus(false, null);
  } catch (error) {
    console.error("인증 초기화 실패:", error);
    const currentState = useCheckmateStore.getState();
    if (!currentState.isLoggedIn) {
      store.setLoginStatus(false, null);
    }
  } finally {
    useCheckmateStore.setState({ isAuthInitializing: false });
    // [수정] 분석이 이미 완료된 상태라면 불필요한 재조회를 생략 (루프 방지)
    const finalState = useCheckmateStore.getState();
    if (finalState.currentVideoId && finalState.analysisStatus !== "complete") {
      finalState.checkAnalysisStatus();
    }
  }
};

/**
 * 서버에 /auth/logout 요청을 보내어 HttpOnly 쿠키를 삭제하고 로그인 상태를 해제합니다.
 */
export const logoutAuth = async () => {
  const store = useCheckmateStore.getState();
  try {
    await authApi.logout();
  } catch (error) {
    console.error("로그아웃 요청 실패:", error);
  } finally {
    store.setLoginStatus(false, null);
  }
};
