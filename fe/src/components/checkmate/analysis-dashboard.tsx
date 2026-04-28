import { useState, useMemo, useRef, useEffect } from "react";
import { useCheckmateStore, logoutAuth } from "../../lib/store";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";
import { ResponseModal } from "./response-modal";
import { LoginView } from "./login-view";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PIXEL_STYLES, COLORS } from "../../lib/constants/styles";

/**
 * [Checkmate 대시보드 - v3.0 확장형 카드 버전]
 */
export function AnalysisDashboard() {
  const { 
    startAnalysis, 
    analysisStatus, 
    overallVerdict, 
    openPanel, 
    isWarningVisible, 
    warningCount, 
    closeWarning, 
    setActiveTab,
    isPanelOpen,
    closePanel,
    isLoggedIn,
    user
  } = useCheckmateStore();
  
  const [isPressed, setIsPressed] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const isWatchPage = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname === "/watch" || window.location.pathname.startsWith("/shorts");
  }, []);

  // Click outside to close (외부 클릭 시 대시보드 닫기)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Shadow DOM 환경을 고려하여 composedPath() 사용
      const path = event.composedPath();
      if (
        isPanelOpen &&
        dashboardRef.current &&
        !path.includes(dashboardRef.current)
      ) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPanelOpen, closePanel]);

  const togglePanel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPanelOpen) closePanel();
    else {
      if (overallVerdict === "unknown") setActiveTab("community");
      else setActiveTab("report");
      openPanel();
    }
  };

  /**
   * 분석 상태에 따른 메시지 매핑
   */
  const statusMsg = useMemo(() => {
    switch (analysisStatus) {
      case "detecting": return "영상 감지 중...";
      case "analyzing_transcript": return "자막 분석 중...";
      case "analyzing_claims": return "주장 추출 중...";
      case "verifying": return "신뢰도 검증 중...";
      case "complete": return "수사 완료";
      default: return "";
    }
  }, [analysisStatus]);

  const warningConfig = {
    safe: {
      gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
      textColor: "#2563eb",
      icon: ShieldCheck,
      prefix: "신뢰",
      title: "검증된 신뢰 정보",
      desc: "분석 결과, 신뢰할 수 있는 사실로 확인되었습니다.",
      btnText: "결과 상세 보기",
    },
    warning: {
      gradient: "linear-gradient(135deg, #f87171, #dc2626)",
      textColor: "#dc2626",
      icon: AlertTriangle,
      prefix: "주의",
      title: "허위 정보 주의",
      desc: `${warningCount}건의 허위 의심 문장이 발견되었습니다.`,
      btnText: "판단 근거 보기",
    },
    unknown: {
      gradient: "linear-gradient(135deg, #fbbf24, #d97706)",
      textColor: "#d97706",
      icon: HelpCircle,
      prefix: "보류",
      title: "판단 보류",
      desc: "AI 판독이 어렵습니다. 커뮤니티에서 진위를 따져보세요.",
      btnText: "커뮤니티 이동",
    },
  };

  if (!isWatchPage) return null;

  // 로그인하지 않은 경우 진입 차단 및 로그인 뷰 표시
  if (!isLoggedIn) {
    return (
      <div style={PIXEL_STYLES.dashboardContainer}>
        <LoginView />
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef}
      style={PIXEL_STYLES.dashboardContainer}
    >
      {/* --- 상단 메인 카드 영역 --- */}
      <div
        id="checkmate-main-card"
        style={{
          ...PIXEL_STYLES.border,
          ...PIXEL_STYLES.mainCard,
          position: "relative",
        }}
      >
        {/* 우측 상단 유저 프로필 및 로그아웃 버튼 */}
        {user?.name && (
          <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", zIndex: 100 }}>
            <div 
              onClick={logoutAuth}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#0ea5e9", // 로그인 화면과 동일한 파란색
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "900",
                fontSize: "16px",
                fontFamily: "'CheckmatePixel', sans-serif",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                border: "2px solid white",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
              title={`${user.name} (클릭하여 로그아웃)`}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span 
              onClick={logoutAuth}
              style={{
                fontSize: "10px",
                fontFamily: "'CheckmatePixel', sans-serif",
                color: "#71717a",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              LOGOUT
            </span>
          </div>
        )}

        {isWarningVisible ? (
          /* 분석 결과 표시 상태 */
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={PIXEL_STYLES.warningHeader(warningConfig[overallVerdict].gradient)}>
              <div style={PIXEL_STYLES.warningIconContainer}>
                {(() => {
                  const Icon = warningConfig[overallVerdict].icon;
                  return <Icon size={32} color="white" />;
                })()}
              </div>
              <h3 style={{ fontSize: "15px", margin: 0, color: "white", fontWeight: "bold" }}>
                [{warningConfig[overallVerdict].prefix}] {warningConfig[overallVerdict].title}
              </h3>
            </div>
            
            <div style={{ padding: "16px", backgroundColor: "#fafafa", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#52525b", lineHeight: "1.5", margin: "0 0 12px 0" }}>
                {warningConfig[overallVerdict].desc}
              </p>
              <button 
                onClick={(e) => togglePanel(e)} 
                style={{ 
                  ...PIXEL_STYLES.btnBase, 
                  backgroundColor: isPanelOpen ? "#e4e4e7" : "#fde047", 
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {isPanelOpen ? "상세 정보 닫기" : warningConfig[overallVerdict].btnText}
                {isPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        ) : (
          /* 분석 대기/진행 상태 */
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => startAnalysis()}>
              <PixelCharacter size="lg" />
              <AnimatePresence>
                {analysisStatus !== "idle" && (
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", bottom: "-2px", right: "-10px" }}
                  >
                    <PixelOfficer size="sm" mood={analysisStatus === "complete" ? "happy" : "thinking"} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", minHeight: "44px" }}>
              {analysisStatus === "idle" ? (
                <button
                  onClick={() => startAnalysis()}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  style={{
                    ...PIXEL_STYLES.btnBase,
                    backgroundColor: COLORS.primary,
                    color: "white",
                    ...(isPressed ? PIXEL_STYLES.btnActive : {}),
                  }}
                >
                  팩트체크 수사 시작
                </button>
              ) : analysisStatus === "complete" ? (
                <button
                  onClick={(e) => togglePanel(e)}
                  style={{
                    ...PIXEL_STYLES.btnBase,
                    backgroundColor: "#a855f7", // 보라색 버튼
                    boxShadow: "2px 2px 0 0 rgba(0,0,0,0.3), inset -2px -2px 0 0 rgba(0,0,0,0.2), inset 2px 2px 0 0 rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  리포트 다시 보기
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#18181b" }}>
                    <span style={{ animation: "pulse 1.5s infinite" }}>{statusMsg}</span>
                  </div>
                  <div style={{ height: "12px", width: "100%", backgroundColor: "#e4e4e7", padding: "2px", ...PIXEL_STYLES.border }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          analysisStatus === "detecting" ? "25%" : 
                          analysisStatus === "analyzing_transcript" ? "50%" : 
                          analysisStatus === "analyzing_claims" ? "75%" : "90%",
                      }}
                      style={{ height: "100%", backgroundColor: "#22c55e" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- 하단 확장 영역 (리포트/커뮤니티) --- */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ 
              width: "100%", 
              overflow: "hidden",
              ...PIXEL_STYLES.border,
              borderTop: "none",
              backgroundColor: "white",
              zIndex: 10
            }}
          >
            <div style={{ height: "500px", display: "flex", flexDirection: "column" }}>
              <SidePanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ResponseModal />
    </div>
  );
}
