import { useCheckmateStore, initializeAuth } from "../../lib/store";
import { LongFormDashboard } from "./long-form-dashboard";
import { ShortsDashboard } from "./shorts-dashboard";
import { LoginView } from "./login-view";
import { ReportModal } from "./report-modal";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { useEffect } from "react";
import { motion } from "framer-motion";

const pixelFont = "'CheckmatePixel', sans-serif";

/**
 * [인증 확인 중 로딩 스켈레톤]
 * isAuthInitializing === true 일 때 표시. Flash 제거에 핵심.
 * - 캐시 히트 시: Phase 1 직후 isLoggedIn: true → 이 컴포넌트 렌더링 시간 거의 0ms
 * - 캐시 미스 시: 서버 응답 대기 동안 자연스러운 로딩 UI 표시
 */
const AuthLoadingSkeleton = () => (
  <div
    style={{
      ...PIXEL_STYLES.dashboardContainer,
      fontFamily: pixelFont,
    }}
  >
    <motion.div
      style={{
        ...PIXEL_STYLES.border,
        ...PIXEL_STYLES.mainCard,
        background: "#ffffff",
        border: "4px solid #0ea5e9",
        borderRadius: "8px",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {/* 스켈레톤 이미지 영역 */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#e0f2fe",
          border: "2px solid #bae6fd",
          borderRadius: "4px",
        }}
      />
      {/* 스켈레톤 텍스트 영역 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: "center" }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          style={{ width: "60%", height: "20px", backgroundColor: "#e0f2fe", borderRadius: "4px" }}
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
          style={{ width: "80%", height: "14px", backgroundColor: "#f0f9ff", borderRadius: "4px" }}
        />
      </div>
      {/* 스켈레톤 버튼 */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.6 }}
        style={{
          width: "100%",
          height: "44px",
          backgroundColor: "#e0f2fe",
          borderRadius: "6px",
          border: "2px solid #bae6fd",
        }}
      />
    </motion.div>
  </div>
);

const URL_CHECK_INTERVAL_MS = 2000;

/**
 * [Checkmate 대시보드 - 라우터 버전]
 * 영상 타입(Long-form / Shorts)에 따라 최적화된 대시보드를 렌더링합니다.
 */
export function AnalysisDashboard() {
  const {
    isLoggedIn,
    isAuthInitializing,
    setLoginStatus,
    currentVideoId,
    analysisStatus,
    checkAnalysisStatus,
    setCurrentVideo,
  } = useCheckmateStore();

  // 앱 시작 시 2-Phase 하이브리드 인증 복원
  useEffect(() => {
    initializeAuth();
  }, [setLoginStatus]);

  // 영상 변경 및 URL 변경 감지 (롱폼/쇼츠 통합 대응)
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const url = new URL(window.location.href);
        let videoId = "";

        if (url.pathname.startsWith("/shorts/")) {
          // 쇼츠 URL 파싱 (/shorts/videoId)
          videoId = url.pathname.split("/shorts/")[1]?.split("/")[0] || "";
        } else {
          // 롱폼 URL 파싱 (?v=videoId)
          videoId = url.searchParams.get("v") || "";
        }

        if (videoId && videoId !== currentVideoId) {
          setCurrentVideo(videoId);
        }
      } catch (err) {
        console.error("[Checkmate] URL 파싱 실패:", err);
      }
    };

    handleUrlChange();
    const interval = setInterval(handleUrlChange, URL_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentVideoId, setCurrentVideo]);

  // 분석 결과 자동 조회
  useEffect(() => {
    if (currentVideoId && !isAuthInitializing && analysisStatus === "idle") {
      checkAnalysisStatus();
    }
  }, [currentVideoId, analysisStatus, isAuthInitializing, checkAnalysisStatus]);

  if (typeof window === "undefined") return null;

  const isShorts = window.location.pathname.startsWith("/shorts");
  const isWatchPage = window.location.pathname === "/watch" || isShorts;

  if (!isWatchPage) return null;

  // [쇼츠 정책] 공간 협소 → 로그아웃 상태에서도 버튼은 항상 노출, 스켈레톤 없이 처리
  if (isShorts) {
    return (
      <>
        {/* [리뷰 반영] ReportModal은 전역 성격이므로 대시보드 안에서 1회 렌더링. */}
        <ReportModal />
        <ShortsDashboard />
      </>
    );
  }

  // [롱폼 정책 - 로딩] 인증 초기화 완료 전까지 스켈레톤 표시
  if (isAuthInitializing) {
    return <AuthLoadingSkeleton />;
  }

  // [롱폼 정책 - 미로그인] 인증 확인 완료 후 미로그인 확정 시 LoginView 표시
  if (!isLoggedIn) {
    return (
      <div style={PIXEL_STYLES.dashboardContainer}>
        <LoginView />
      </div>
    );
  }

  return (
    <>
      <ReportModal />
      <LongFormDashboard />
    </>
  );
}
