import { useCheckmateStore, initializeAuth } from "../../lib/store";
import { LongFormDashboard } from "./long-form-dashboard";
import { ShortsDashboard } from "./shorts-dashboard";
import { LoginView } from "./login-view";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { useEffect } from "react";

/**
 * [Checkmate 대시보드 - 라우터 버전]
 * 영상 타입(Long-form / Shorts)에 따라 최적화된 대시보드를 렌더링합니다.
 */
export function AnalysisDashboard() {
  const { isLoggedIn, setLoginStatus, currentVideoId, analysisStatus, checkAnalysisStatus } = useCheckmateStore();

  // [추가] 앱 시작 시 인증 상태 복원
  useEffect(() => {
    initializeAuth();
  }, [setLoginStatus]);

  // [추가] 영상 변경 시 기존 분석 결과 자동 조회
  useEffect(() => {
    if (currentVideoId && analysisStatus === "idle") {
      checkAnalysisStatus();
    }
  }, [currentVideoId, analysisStatus, checkAnalysisStatus]);

  // SSR 환경이나 브라우저 객체가 없는 환경에서의 방어 로직
  if (typeof window === "undefined") return null;
  
  const isShorts = window.location.pathname.startsWith("/shorts");
  const isWatchPage = window.location.pathname === "/watch" || isShorts;

  if (!isWatchPage) return null;

  // [쇼츠 정책]
  // - 공간 협소 및 빠른 전환을 고려하여 로그아웃 상태에서도 동그란 버튼은 항상 노출합니다.
  // - 실제 분석 버튼 클릭 시점에 로그인 여부를 체크하여 모달을 띄웁니다 (ShortsDashboard 내부 처리).
  if (isShorts) return <ShortsDashboard />;

  // [롱폼 정책]
  // - 로그인하지 않은 경우 대시보드 진입을 차단하고 로그인 전용 뷰를 표시합니다. (일반 영상용)
  if (!isLoggedIn) {
    return (
      <div style={PIXEL_STYLES.dashboardContainer}>
        <LoginView />
      </div>
    );
  }

  return <LongFormDashboard />;
}
