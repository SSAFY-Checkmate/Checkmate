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
  
  // URL이 바뀔 때마다 다시 계산되도록 window.location.pathname을 직접 참조하거나 의존성에 추가
  const isShorts = window.location.pathname.startsWith("/shorts");
  const isWatchPage = window.location.pathname === "/watch" || isShorts;

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
