import { useState, useMemo, useRef, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";
import { ResponseModal } from "./response-modal";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { PIXEL_STYLES, COLORS } from "../../lib/constants/styles";

type AnalysisDashboardProps = {
  isPanelMode?: boolean;
};

/**
 * [Checkmate 대시보드 - 이벤트 기반 동기화 버전]
 */
export function AnalysisDashboard({ isPanelMode = false }: AnalysisDashboardProps) {
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
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const isWatchPage = window.location.pathname === "/watch" || window.location.pathname.startsWith("/shorts");

  // [커스텀 이벤트] 서랍 모드에서 이벤트 수신 대기
  useEffect(() => {
    if (isPanelMode) {
      const handleOpenEvent = () => {
        console.log("[Checkmate] SidePanel: Open Event Received");
        openPanel();
      };
      window.addEventListener("CHECKMATE_OPEN_PANEL", handleOpenEvent);
      return () => window.removeEventListener("CHECKMATE_OPEN_PANEL", handleOpenEvent);
    }
  }, [isPanelMode, openPanel]);

  // Click outside to close warning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isWarningVisible &&
        dashboardRef.current &&
        !dashboardRef.current.contains(event.target as Node)
      ) {
        closeWarning();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isWarningVisible, closeWarning]);

  // 서랍 열기 공통 로직 (이벤트 발송 포함)
  const triggerOpenPanel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log("[Checkmate] Triggering Open Panel");
    window.dispatchEvent(new CustomEvent("CHECKMATE_OPEN_PANEL"));
    openPanel();
  };

  // 1. 서랍 모드일 때 (Body에 주입됨)
  if (isPanelMode) {
    if (!isPanelOpen) return null;

    return (
      <div
        id="checkmate-side-panel-container"
        style={{
          position: "fixed",
          top: "56px",
          right: 0,
          width: "384px",
          height: "calc(100vh - 56px)",
          backgroundColor: "white",
          zIndex: 99999999,
          boxShadow: "-10px 0 25px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          borderLeft: `3px solid ${COLORS.primary}`,
          fontFamily: "'DungGeunMo', monospace",
          pointerEvents: "auto",
        }}
      >
        {/* Floating Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); closePanel(); }}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          style={{
            position: "absolute",
            left: "-48px",
            top: "16px",
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            ...PIXEL_STYLES.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 99999999,
            transition: "all 0.1s",
          }}
        >
          <X style={{ width: "24px", height: "24px", color: isCloseHovered ? "black" : "#71717a" }} />
        </button>
        <SidePanel />
        <ResponseModal />
      </div>
    );
  }

  // 2. 카드 모드일 때 (사이드바에 주입됨)
  if (!isWatchPage) return null;

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

  const handleAction = (e: React.MouseEvent) => {
    closeWarning();
    if (overallVerdict === "unknown") {
      setActiveTab("community");
    } else {
      setActiveTab("report");
    }
    triggerOpenPanel(e);
  };

  const warningConfig = {
    safe: {
      gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
      textColor: "#2563eb",
      icon: ShieldCheck,
      prefix: "신뢰",
      title: "검증된 신뢰 정보",
      desc: "Checkmate 분석 결과, 신뢰할 수 있는 사실로 확인되었습니다.",
      btnText: "지금 확인",
    },
    warning: {
      gradient: "linear-gradient(135deg, #f87171, #dc2626)",
      textColor: "#dc2626",
      icon: AlertTriangle,
      prefix: "주의",
      title: "허위/과장 정보 주의",
      desc: `이 영상에서 ${warningCount}건의 허위 의심 문장이 발견되었습니다.`,
      btnText: "판단 근거 보기",
    },
    unknown: {
      gradient: "linear-gradient(135deg, #fbbf24, #d97706)",
      textColor: "#d97706",
      icon: HelpCircle,
      prefix: "보류",
      title: "판단 보류 안내",
      desc: "확보된 정보만으로는 AI 판독이 어렵습니다. 커뮤니티 수배를 통해 함께 진위를 검증해 보세요.",
      btnText: "게시판으로 이동",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Warning Result Card */}
      {isWarningVisible ? (
        <div
          ref={dashboardRef}
          id="checkmate-warning-card"
          style={{
            ...PIXEL_STYLES.border,
            width: "100%",
            margin: "16px 0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'DungGeunMo', monospace",
            zIndex: 2147483640,
            backgroundColor: "white",
          }}
        >
          <div style={{ 
            position: "relative", 
            padding: "32px 0 24px 0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: warningConfig[overallVerdict].gradient,
            borderBottom: "2px solid rgba(0,0,0,0.1)"
          }}>
            <button onClick={(e) => { e.stopPropagation(); closeWarning(); }} style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", color: "white" }}>
              <X size={20} />
            </button>
            <div style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
              {(() => {
                const Icon = warningConfig[overallVerdict].icon;
                return <Icon size={48} color="white" />;
              })()}
            </div>
          </div>
          <div style={{ padding: "20px 16px 12px 16px", backgroundColor: "#fafafa", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span style={{ color: warningConfig[overallVerdict].textColor, fontWeight: "bold" }}>[{warningConfig[overallVerdict].prefix}]</span>
              <span style={{ fontWeight: "bold", color: "black" }}>{warningConfig[overallVerdict].title}</span>
            </h3>
            <p style={{ fontSize: "12px", color: "#52525b", lineHeight: "1.6", margin: 0 }}>
              {warningConfig[overallVerdict].desc}
            </p>
          </div>
          <div style={{ padding: "16px", paddingTop: "4px", backgroundColor: "#fafafa", display: "flex" }}>
            <button onClick={(e) => handleAction(e)} style={{ ...PIXEL_STYLES.btnBase, backgroundColor: "#fde047", color: "black" }}>
              {warningConfig[overallVerdict].btnText}
            </button>
          </div>
        </div>
      ) : (
        /* Main Analysis Card */
        <div
          ref={dashboardRef}
          id="checkmate-analysis-card"
          style={{
            ...PIXEL_STYLES.border,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            margin: "16px 0",
            fontFamily: "'DungGeunMo', monospace",
            backgroundColor: "white",
            width: "100%",
          }}
        >
          <div style={{ position: "relative", marginTop: "8px", cursor: "pointer" }} onClick={(e) => triggerOpenPanel(e)}>
            <PixelCharacter size="lg" />
            <AnimatePresence>
              {analysisStatus !== "idle" && (
                <motion.div
                  initial={{ x: -60, scale: 0.8, opacity: 0 }}
                  animate={{ x: 0, scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -60 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ position: "absolute", bottom: "-4px", right: "-4px" }}
                >
                  <PixelOfficer
                    size="sm"
                    mood={
                      analysisStatus === "complete"
                        ? overallVerdict === "warning" ? "alert" : "happy"
                        : "thinking"
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ width: "100%", minHeight: "50px", marginTop: "8px", display: "flex" }}>
            {analysisStatus === "idle" && (
              <button
                onClick={() => startAnalysis()}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                style={{
                  ...PIXEL_STYLES.btnBase,
                  ...(isPressed ? PIXEL_STYLES.btnActive : {}),
                }}
              >
                스캔 시작
              </button>
            )}

            {analysisStatus !== "idle" && analysisStatus !== "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "0 4px 4px 4px", width: "100%" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#18181b", padding: "0 2px" }}>
                  <span style={{ animation: "pulse 1.5s infinite" }}>{statusMsg}</span>
                </div>
                <div style={{ height: "16px", width: "100%", backgroundColor: "#e4e4e7", padding: "2px", ...PIXEL_STYLES.border }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        analysisStatus === "detecting" ? "25%" : 
                        analysisStatus === "analyzing_transcript" ? "50%" : 
                        analysisStatus === "analyzing_claims" ? "75%" : "90%",
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ height: "100%", backgroundColor: "#22c55e" }}
                  />
                </div>
              </motion.div>
            )}

            {analysisStatus === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
              >
                <button
                  onClick={(e) => triggerOpenPanel(e)}
                  style={{
                    ...PIXEL_STYLES.btnBase,
                    backgroundColor: "#a855f7",
                    boxShadow: "2px 2px 0 0 rgba(0,0,0,0.3), inset -2px -2px 0 0 rgba(0,0,0,0.2), inset 2px 2px 0 0 rgba(255,255,255,0.3)",
                  }}
                >
                  리포트 확인
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
