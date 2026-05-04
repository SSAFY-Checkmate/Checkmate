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
  const { isLoggedIn, setLoginStatus } = useCheckmateStore();

  // [추가] 앱 시작 시 인증 상태 복원
  useEffect(() => {
    initializeAuth();
  }, [setLoginStatus]);
  
  const isShorts = window.location.pathname.startsWith("/shorts");
  const isWatchPage = window.location.pathname === "/watch" || isShorts;

  if (!isWatchPage) return null;

  // [개선] 쇼츠의 경우 로그인 여부와 상관없이 항상 ShortsDashboard(동그란 버튼)를 먼저 보여줍니다.
  if (isShorts) return <ShortsDashboard />;

  // 로그인하지 않은 경우 공통 로그인 뷰 표시 (롱폼 등 일반 영상용)
  if (!isLoggedIn) {
    return (
      <div style={PIXEL_STYLES.dashboardContainer}>
        <LoginView />
      </div>
    );
  }

  return <LongFormDashboard />;
}
