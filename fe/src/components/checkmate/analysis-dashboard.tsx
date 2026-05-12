import { useCheckmateStore, initializeAuth } from '../../lib/store';
import { LongFormDashboard } from './long-form-dashboard';
import { ShortsDashboard } from './shorts-dashboard';
import { LoginView } from './login-view';
import { PIXEL_STYLES } from '../../lib/constants/styles';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

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
        background: '#ffffff',
        border: '4px solid #0ea5e9',
        borderRadius: '8px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* 스켈레톤 이미지 영역 */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#e0f2fe',
          border: '2px solid #bae6fd',
          borderRadius: '4px',
        }}
      />
      {/* 스켈레톤 텍스트 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
          style={{ width: '60%', height: '20px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.4 }}
          style={{ width: '80%', height: '14px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}
        />
      </div>
      {/* 스켈레톤 버튼 */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.6 }}
        style={{
          width: '100%',
          height: '44px',
          backgroundColor: '#e0f2fe',
          borderRadius: '6px',
          border: '2px solid #bae6fd',
        }}
      />
    </motion.div>
  </div>
);

/**
 * [Checkmate 대시보드 - 라우터 버전]
 * 영상 타입(Long-form / Shorts)에 따라 최적화된 대시보드를 렌더링합니다.
 *
 * 렌더링 우선순위:
 * 1. isAuthInitializing: true → AuthLoadingSkeleton (인증 확인 중)
 * 2. !isLoggedIn → LoginView (미로그인 확정)
 * 3. isLoggedIn → LongFormDashboard (대시보드)
 */
export function AnalysisDashboard() {
  const {
    isLoggedIn,
    isAuthInitializing,
    setLoginStatus,
    currentVideoId,
    analysisStatus,
    checkAnalysisStatus,
  } = useCheckmateStore();

  // 앱 시작 시 2-Phase 하이브리드 인증 복원
  useEffect(() => {
    initializeAuth();
  }, [setLoginStatus]);

  // 영상 변경 및 URL 변경 감지 (롱폼/쇼츠 통합 대응)
  useEffect(() => {
    const handleUrlChange = () => {
      const url = window.location.href;
      let videoId = "";

      if (url.includes("/shorts/")) {
        videoId = url.split("/shorts/")[1].split("?")[0];
      } else if (url.includes("v=")) {
        videoId = new URLSearchParams(window.location.search).get("v") || "";
      }

      if (videoId && videoId !== currentVideoId) {
        useCheckmateStore.getState().setCurrentVideo(videoId);
      }
    };

    handleUrlChange();
    const interval = setInterval(handleUrlChange, 2000);
    return () => clearInterval(interval);
  }, [currentVideoId]);

  // 분석 결과 자동 조회
  useEffect(() => {
    if (currentVideoId && analysisStatus === "idle") {
      checkAnalysisStatus();
    }
  }, [currentVideoId, analysisStatus, checkAnalysisStatus]);

  if (typeof window === 'undefined') return null;

  const isShorts = window.location.pathname.startsWith('/shorts');
  const isWatchPage = window.location.pathname === '/watch' || isShorts;

  if (!isWatchPage) return null;

  // [쇼츠 정책] 공간 협소 → 로그아웃 상태에서도 버튼은 항상 노출
  if (isShorts) return <ShortsDashboard />;

  // [롱폼 정책 - 로딩] 인증 초기화 완료 전까지 스켈레톤 표시
  // → 캐시 히트 시: Phase 1에서 즉시 isLoggedIn: true → 사실상 스켈레톤 노출 시간 = 0
  // → 캐시 미스 시: 서버 응답 대기 동안 자연스러운 로딩 UI
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

  return <LongFormDashboard />;
}
