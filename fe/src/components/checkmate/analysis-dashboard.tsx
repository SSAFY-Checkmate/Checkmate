import { useMemo } from "react";
import { useCheckmateStore } from "../../lib/store";
import { LongFormDashboard } from "./long-form-dashboard";
import { ShortsDashboard } from "./shorts-dashboard";
import { LoginView } from "./login-view";
import { PIXEL_STYLES } from "../../lib/constants/styles";

/**
 * [Checkmate 대시보드 - 라우터 버전]
 * 영상 타입(Long-form / Shorts)에 따라 최적화된 대시보드를 렌더링합니다.
 */
export function AnalysisDashboard() {
  const { isLoggedIn } = useCheckmateStore();
  
  const isWatchPage = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname === "/watch" || window.location.pathname.startsWith("/shorts");
  }, []);

  const isShorts = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/shorts");
  }, []);

  if (!isWatchPage) return null;

  // 로그인하지 않은 경우 공통 로그인 뷰 표시
  if (!isLoggedIn) {
    return (
      <div style={PIXEL_STYLES.dashboardContainer}>
        <LoginView />
      </div>
    );
  }

  // 영상 타입에 따른 대시보드 분기
  return isShorts ? <ShortsDashboard /> : <LongFormDashboard />;
}
