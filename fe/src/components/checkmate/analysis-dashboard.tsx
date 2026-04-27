import { useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { useCheckmateStore, type AnalysisStatus } from "../../lib/store";
import { cn } from "../../lib/utils";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";

type AnalysisDashboardProps = {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
};

const getStatusMessage = (status: AnalysisStatus): string => {
  // ... (기존 로직 유지)
  switch (status) {
    case "detecting":
      return "영상 감지 중...";
    case "analyzing_transcript":
      return "자막 분석 중...";
    case "analyzing_claims":
      return "주장 추출 중...";
    case "verifying":
      return "신뢰도 검증 중...";
    case "complete":
      return "수사 완료";
    case "idle":
    default:
      return "스캔 대기 중";
  }
};

export function AnalysisDashboard({ className = "", style, onClose }: AnalysisDashboardProps) {
  const {
    startAnalysis,
    analysisStatus,
    overallVerdict,
    openPanel,
    isWarningVisible,
    warningCount,
    closeWarning,
    setActiveTab,
  } = useCheckmateStore();

  const dashboardRef = useRef<HTMLDivElement>(null);

  // ... (handleClickOutside 로직 유지)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isWarningVisible || !dashboardRef.current) return;
      const path = event.composedPath();
      if (!path.includes(dashboardRef.current)) {
        closeWarning();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isWarningVisible, closeWarning]);

  const statusMsg = useMemo(() => {
    switch (analysisStatus) {
      case "detecting":
        return "영상 감지 중...";
      case "analyzing_transcript":
        return "자막 분석 중...";
      case "analyzing_claims":
        return "주장 추출 중...";
      case "verifying":
        return "신뢰도 검증 중...";
      case "complete":
        return "수사 완료";
      default:
        return "";
    }
  }, [analysisStatus]);

  const warningConfig = {
    safe: {
      gradient: "linear-gradient(to bottom right, #60a5fa, #2563eb)",
      textColor: "#2563eb",
      icon: ShieldCheck,
      prefix: "신뢰",
      title: "검증된 신뢰 정보",
      desc: "Checkmate 분석 결과, 신뢰할 수 있는 사실로 확인되었습니다.",
      btnText: "지금 확인",
    },
    warning: {
      gradient: "linear-gradient(to bottom right, #f87171, #dc2626)",
      textColor: "#dc2626",
      icon: AlertTriangle,
      prefix: "주의",
      title: "허위/과장 정보 주의",
      desc: (
        <>
          이 영상에서 <span style={{ fontWeight: "bold", color: "#dc2626" }}>{warningCount}건</span>의 허위 의심 문장이
          발견되었습니다.
        </>
      ),
      btnText: "판단 근거 보기",
    },
    unknown: {
      gradient: "linear-gradient(to bottom right, #fbbf24, #d97706)",
      textColor: "#d97706",
      icon: HelpCircle,
      prefix: "보류",
      title: "판단 보류 안내",
      desc: "확보된 정보만으로는 AI 판독이 어렵습니다. 커뮤니티 수배를 통해 다른 유저들과 함께 진위를 검증해 보세요.",
      btnText: "게시판으로 이동",
    },
  };

  const handleAction = () => {
    closeWarning();
    if (overallVerdict === "unknown") {
      setActiveTab("community");
    } else {
      setActiveTab("report");
    }
    openPanel();
  };

  // 1. 분석 완료 결과 팝업 (디자인 고도화 적용 상태)
  const renderPopup = () => {
    if (!isWarningVisible) return null;
    
    const config = warningConfig[overallVerdict as keyof typeof warningConfig] || warningConfig.unknown;
    const { gradient, textColor, icon: Icon, prefix, title, desc, btnText } = config;

    return (
      <div
        ref={dashboardRef}
        className={cn("pixel-border", className)}
        style={{
          ...style,
          backgroundColor: "white",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "var(--font-pixel)",
          transition: "all 0.3s ease",
        }}
      >
        <div 
          style={{ 
            position: "relative", 
            paddingTop: "32px", 
            paddingBottom: "24px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            borderBottom: "2px solid rgba(0,0,0,0.2)",
            backgroundImage: gradient 
          }}
        >
          <button 
            onClick={closeWarning} 
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              padding: "4px",
              color: "white",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
          <div style={{ padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
            <Icon style={{ width: "48px", height: "48px", color: "white" }} strokeWidth={2} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px", paddingBottom: "12px", paddingLeft: "16px", paddingRight: "16px", backgroundColor: "#fafafa" }}>
          <h3 style={{ fontSize: "16px", color: "black", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textAlign: "center", letterSpacing: "0.025em" }}>
            <span style={{ display: "inline-block", paddingLeft: "6px", paddingRight: "6px", paddingTop: "2px", paddingBottom: "2px", fontSize: "14px", fontWeight: "bold", color: textColor }}>[{prefix}]</span>
            <span style={{ fontWeight: "bold" }}>{title}</span>
          </h3>
          <div style={{ fontSize: "12px", color: "#52525b", textAlign: "center", lineHeight: "1.625", fontWeight: 500 }}>{desc}</div>
        </div>
        <div style={{ padding: "16px", paddingTop: "4px", backgroundColor: "#fafafa" }}>
          <button onClick={handleAction} className="w-full btn-yellow-pixel py-2.5 text-[15px] cursor-pointer pixel-btn">
            {btnText}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isWarningVisible ? (
        renderPopup()
      ) : (
        <div
          ref={dashboardRef}
          className={cn("light-border", className)}
          style={{
            ...style,
            backgroundColor: "white",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            position: "relative",
            fontFamily: "var(--font-pixel)",
          }}
        >
          {onClose && (
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                padding: "4px",
                color: "#a1a1aa",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          )}

          <button
            onClick={() => {
              openPanel();
              onClose?.();
            }}
            className="relative transition-transform active:scale-95 cursor-pointer mt-4"
            style={{ background: "none", border: "none", padding: 0, marginTop: "16px", position: "relative" }}
          >
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
                    mood={analysisStatus === "complete" ? (overallVerdict === "warning" ? "alert" : "happy") : "thinking"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {analysisStatus === "idle" && (
              <button
                onClick={() => startAnalysis()}
                className="w-full btn-blue-pixel py-3 px-4 text-[16px] cursor-pointer pixel-btn"
                style={{ width: "100%", padding: "12px 16px", fontSize: "16px" }}
              >
                스캔 시작
              </button>
            )}

            {analysisStatus !== "idle" && analysisStatus !== "complete" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "4px", paddingRight: "4px", paddingBottom: "4px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#18181b", paddingLeft: "2px", paddingRight: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.1em" }}>
                    <span className="animate-pulse">{statusMsg}</span>
                  </div>
                </div>
                <div className="pixel-border" style={{ height: "16px", width: "100%", backgroundColor: "#e4e4e7", padding: "2px" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        analysisStatus === "detecting" ? "25%" : analysisStatus === "analyzing_transcript" ? "50%" : analysisStatus === "analyzing_claims" ? "75%" : "90%",
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ height: "100%", backgroundColor: "#10b981", transition: "all 0.3s ease" }}
                  />
                </div>
              </motion.div>
            )}

            {analysisStatus === "complete" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => {
                    openPanel();
                    onClose?.();
                  }}
                  className="w-full btn-purple-pixel py-2.5 text-[15px] cursor-pointer pixel-btn"
                  style={{ width: "100%", padding: "10px 0", fontSize: "15px" }}
                >
                  리포트 확인
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
      <SidePanel />
    </>
  );
}
