/**
 * Checkmate API Service
 * 모든 백엔드 API 호출을 담당합니다.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * 기본 fetch 래퍼 (인증 헤더 및 공통 처리)
 */
async function doFetch(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });
  return response;
}

/**
 * 분석 관련 API
 */
export const analysisApi = {
  /** 해당 영상의 분석 이력 확인 */
  checkExisting: async (youtubeUrl: string) => {
    const res = await doFetch(`/analysis/check?youtubeUrl=${encodeURIComponent(youtubeUrl)}`);
    return res.json();
  },

  /** 분석 요청 (비동기) */
  requestAnalysis: async (youtubeUrl: string) => {
    const res = await doFetch("/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
    });
    return res;
  },

  /** 분석 상태 조회 (Polling용) */
  getJobStatus: async (jobId: string, signal?: AbortSignal) => {
    const res = await doFetch(`/analysis/${jobId}`, { signal });
    return res.json();
  },

  /** 분석 결과 상세 조회 */
  getResult: async (jobId: string) => {
    const res = await doFetch(`/analysis/${jobId}/result`);
    return res.json();
  },

  /** 분석 요청 (동기 - Legacy) */
  requestAnalysisSync: async (youtubeUrl: string, signal?: AbortSignal) => {
    const res = await doFetch("/analysis/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
      signal,
    });
    return res;
  },
};

/**
 * 커뮤니티 투표 관련 API
 */
export const communityApi = {
  /** 반응 목록 조회 */
  getReactions: async (analysisId: number) => {
    const res = await doFetch(`/community/reactions?analysisId=${analysisId}`);
    return res.json();
  },

  /** 반응 단건 조회 */
  getReaction: async (reactionId: number) => {
    const res = await doFetch(`/community/reactions/${reactionId}`);
    return res.json();
  },

  /** 반응 등록 */
  postReaction: async (analysisId: number, reactionType: boolean) => {
    const res = await doFetch("/community/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId, reactionType }),
    });
    return res.json();
  },

  /** 댓글 목록 조회 */
  getComments: async (analysisId: number, page: number = 0) => {
    const res = await doFetch(`/community/comments?analysisId=${analysisId}&page=${page}`);
    return res.json();
  },

  /** 댓글 단건 조회 */
  getComment: async (commentId: string | number) => {
    const res = await doFetch(`/community/comments/${commentId}`);
    return res.json();
  },

  /** 댓글 생성 */
  postComment: async (analysisId: number, content: string, parentCommentId?: string | number | null) => {
    const res = await doFetch("/community/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId, parentCommentId: parentCommentId ?? null, content }),
    });
    return res.json();
  },

  /** 댓글 수정 */
  putComment: async (commentId: string | number, content: string) => {
    const res = await doFetch(`/community/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  /** 댓글 삭제 */
  deleteComment: async (commentId: string | number) => {
    const res = await doFetch(`/community/comments/${commentId}`, {
      method: "DELETE",
    });
    return res.json();
  },

  /** 반응 수정 */
  putReaction: async (reactionId: number, reactionType: boolean) => {
    const res = await doFetch(`/community/reactions/${reactionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reactionType }),
    });
    return res.json();
  },
};

/**
 * 인증 관련 API
 */
export const authApi = {
  /** 현재 사용자 정보 조회 */
  getMe: async () => {
    const res = await doFetch("/auth/me");
    return res;
  },

  /** 토큰 재발급 */
  reissue: async () => {
    const res = await doFetch("/auth/reissue", { method: "POST" });
    return res;
  },

  /** 로그아웃 */
  logout: async () => {
    const res = await doFetch("/auth/logout", { method: "POST" });
    return res;
  },
};
