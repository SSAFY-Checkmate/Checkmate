import { useState, useMemo, useRef, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";
import { ResponseModal } from "./response-modal";
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
    closePanel
  } = useCheckmateStore();
  
  const [isPressed, setIsPressed] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const isWatchPage = window.location.pathname === "/watch" || window.location.pathname.startsWith("/shorts");

  // Click outside to close (Optional - 확장된 카드를 닫을지 결정)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPanelOpen &&
        dashboardRef.current &&
        !dashboardRef.current.contains(event.target as Node)
      ) {
        // closePanel(); // 필요 시 활성화
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

  return (
    <div 
      ref={dashboardRef}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        width: "100%",
        fontFamily: "'DungGeunMo', monospace",
        marginBottom: "24px",
      }}
    >
      {/* --- 상단 메인 카드 영역 --- */}
      <div
        id="checkmate-main-card"
        style={{
          ...PIXEL_STYLES.border,
          width: "100%",
          margin: "16px 0 0 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          transition: "all 0.3s ease",
        }}
      >
        {isWarningVisible ? (
          /* 분석 결과 표시 상태 */
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ 
              padding: "24px 0 16px 0", 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              background: warningConfig[overallVerdict].gradient,
              borderBottom: "2px solid rgba(0,0,0,0.1)"
            }}>
              <div style={{ padding: "8px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", marginBottom: "12px" }}>
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
