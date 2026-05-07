import { useMemo, useRef } from "react";
import { useCheckmateStore, logoutAuth } from "../../lib/store";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PIXEL_STYLES } from "../../lib/constants/styles";

/**
 * [Checkmate 롱폼 전용 대시보드]
 * 기존 AnalysisDashboard의 로직을 그대로 유지합니다.
 */
export function LongFormDashboard() {
  const { 
    startAnalysis, 
    startDemoAnalysis,
    analysisStatus, 
    overallVerdict, 
    openPanel, 
    warningCount, 
    setActiveTab,
    isPanelOpen,
    closePanel,

    user,
    summary
  } = useCheckmateStore();
  
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  const getTheme = () => {
    if (analysisStatus !== "complete") {
      return {
        border: "#0ea5e9",
        shadowHover: "rgba(14, 165, 233, 0.1)",
        shadowOuter: "rgba(0, 110, 220, 0.1)",
        bgLight: "#e0f2fe",
        iconShadow: "#0284c7",
        textShadowColor: "#1e3a8a",
        titleColor: "#22d3ee",
        descColor: "#334155",
      };
    }
    switch (overallVerdict) {
      case "warning":
        return {
          border: "#ef4444",
          shadowHover: "rgba(239, 68, 68, 0.1)",
          shadowOuter: "rgba(220, 38, 38, 0.1)",
          bgLight: "#fee2e2",
          iconShadow: "#dc2626",
          textShadowColor: "#7f1d1d",
          titleColor: "#f87171",
          descColor: "#991b1b",
        };
      case "safe":
        return {
          border: "#22c55e",
          shadowHover: "rgba(34, 197, 94, 0.1)",
          shadowOuter: "rgba(22, 163, 74, 0.1)",
          bgLight: "#dcfce7",
          iconShadow: "#16a34a",
          textShadowColor: "#14532d",
          titleColor: "#4ade80",
          descColor: "#166534",
        };
      case "unknown":
      default:
        return {
          border: "#f59e0b",
          shadowHover: "rgba(245, 158, 11, 0.1)",
          shadowOuter: "rgba(217, 119, 6, 0.1)",
          bgLight: "#fef3c7",
          iconShadow: "#d97706",
          textShadowColor: "#78350f",
          titleColor: "#fbbf24",
          descColor: "#92400e",
        };
    }
  };

  const theme = getTheme();
  const pixelFont = "'CheckmatePixel', sans-serif";

  const togglePanel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPanelOpen) closePanel();
    else {
      if (overallVerdict === "unknown") setActiveTab("community");
      else setActiveTab("report");
      openPanel();
    }
  };

  return (
    <div 
      ref={dashboardRef}
      style={{
        ...PIXEL_STYLES.dashboardContainer,
        fontFamily: pixelFont
      }}
    >
      {/* --- 상단 메인 카드 영역 --- */}
      <div
        id="checkmate-main-card"
        style={{
          ...PIXEL_STYLES.border,
          ...PIXEL_STYLES.mainCard,
          position: "relative",
          background: "#ffffff",
          boxShadow: `0 10px 25px ${theme.shadowOuter}, inset 0 0 0 2px ${theme.shadowHover}`,
          border: `4px solid ${theme.border}`,
          borderRadius: "8px",
          padding: "16px", 
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          gap: "16px",
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
                backgroundColor: "#0ea5e9",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "900",
                fontSize: "16px",
                fontFamily: pixelFont,
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
                fontFamily: pixelFont,
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

        {analysisStatus === "complete" ? (
          <>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "4px",
                borderRadius: "4px",
                boxShadow: `0 4px 0 ${theme.iconShadow}`,
                marginTop: "16px"
              }}
            >
              <div
                style={{
                  backgroundColor: theme.bgLight,
                  border: `2px solid ${theme.border}`,
                  borderRadius: "2px",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "64px",
                  height: "64px"
                }}
              >
                {(() => {
                  const Icon = warningConfig[overallVerdict].icon;
                  return <Icon size={40} color={theme.border} />;
                })()}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "24px",
                  margin: 0,
                  color: theme.titleColor,
                  fontWeight: "900",
                  fontFamily: pixelFont,
                  letterSpacing: "2px",
                  textShadow: `
                    2px 0 0 ${theme.textShadowColor},
                    -2px 0 0 ${theme.textShadowColor},
                    0 2px 0 ${theme.textShadowColor},
                    0 -2px 0 ${theme.textShadowColor},
                    2px 2px 0 ${theme.textShadowColor},
                    -2px -2px 0 ${theme.textShadowColor},
                    2px -2px 0 ${theme.textShadowColor},
                    -2px 2px 0 ${theme.textShadowColor}
                  `,
                }}
              >
                {warningConfig[overallVerdict].prefix}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: theme.descColor,
                  lineHeight: "1.5",
                  margin: 0,
                  fontWeight: "bold",
                  fontFamily: pixelFont,
                }}
              >
                {warningConfig[overallVerdict].title}
                <br />
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "inline-block" }}>
                  {summary || warningConfig[overallVerdict].desc}
                </span>
              </p>
            </div>

            <div style={{ width: "100%", marginTop: "8px" }}>
              <PixelButton
                onClick={(e) => togglePanel(e)}
                colorType={isPanelOpen ? "neutral" : overallVerdict === "warning" ? "error" : "primary"}
                text={isPanelOpen ? "상세 정보 닫기" : warningConfig[overallVerdict].btnText}
                icon={isPanelOpen ? <ChevronUp size={20} color="#1e293b" strokeWidth={3} /> : <ChevronDown size={20} color="#ffffff" strokeWidth={3} />}
                size="md"
              />
            </div>
          </>
        ) : (
          <>
            {/* 경찰서 건물(항상 표시) + 분석 중 경찰관 오버레이 */}
            <div
              style={{ position: "relative", cursor: "pointer", marginTop: "16px" }}
              onClick={() => startAnalysis()}
            >
              {/* 경찰서 건물 배경 */}
              <PixelCharacter size="lg" />

              {/* 분석 중일 때 경찰관 오버레이 */}
              <AnimatePresence>
                {analysisStatus !== "idle" && analysisStatus !== "error" && (
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", bottom: "-10px", right: "-15px" }}
                  >
                    {/* 말풍선 */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "white",
                        border: "2px solid #0f172a",
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: "900",
                        color: "#0f172a",
                        boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                        fontFamily: pixelFont,
                      }}
                    >
                      {/* 말풍선 꼬리 외곽선 */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid #0f172a",
                        }}
                      />
                      {/* 말풍선 꼬리 내부 */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-3px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 0,
                          height: 0,
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderTop: "4px solid white",
                        }}
                      />
                      {statusMsg}
                    </div>
                    <PixelOfficer size="sm" mood="thinking" isWalking />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", minHeight: "44px", marginTop: "8px" }}>
              {analysisStatus === "idle" ? (
                <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <PixelButton
                      onClick={() => startAnalysis()}
                      colorType="primary"
                      text="팩트체크 수사 시작"
                    />
                  </div>
                  <button
                    onClick={() => startDemoAnalysis()}
                    title="API를 호출하지 않고 목업 데이터로 데모를 실행합니다"
                    style={{
                      backgroundColor: "#e2e8f0",
                      border: "2px solid #94a3b8",
                      borderRadius: "6px",
                      padding: "0 12px",
                      cursor: "pointer",
                      fontFamily: pixelFont,
                      fontWeight: "bold",
                      color: "#475569",
                      boxShadow: "0 4px 0 #94a3b8",
                      transition: "all 0.1s",
                      flexShrink: 0,
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "translateY(4px)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "0 4px 0 #94a3b8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow = "0 4px 0 #94a3b8";
                    }}
                  >
                    데모
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "14px", 
                    color: "#0ea5e9",
                    fontFamily: pixelFont,
                    fontWeight: "900",
                    textShadow: "1px 1px 0 rgba(14, 165, 233, 0.2)",
                  }}>
                    <span style={{ animation: "pulse 1.5s infinite" }}>{statusMsg}</span>
                    <span>
                      {analysisStatus === "detecting" ? "25%" : 
                       analysisStatus === "analyzing_transcript" ? "50%" : 
                       analysisStatus === "analyzing_claims" ? "75%" : "95%"}
                    </span>
                  </div>
                  
                  <div style={{ 
                    height: "24px", 
                    width: "100%", 
                    backgroundColor: "#0f172a", 
                    padding: "4px", 
                    border: "3px solid #475569",
                    boxShadow: "inset 0 4px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(255,255,255,0.1)",
                    display: "flex",
                    gap: "3px",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {Array.from({ length: 15 }).map((_, i) => {
                      const progress = 
                        analysisStatus === "detecting" ? 25 : 
                        analysisStatus === "analyzing_transcript" ? 50 : 
                        analysisStatus === "analyzing_claims" ? 75 : 95;
                      
                      const isFilled = (i + 1) <= (progress / 100) * 15;
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: isFilled ? 1 : 0.2, 
                            scale: isFilled ? 1 : 0.9,
                            backgroundColor: isFilled ? "#38bdf8" : "#1e293b" 
                          }}
                          style={{
                            flex: 1,
                            height: "100%",
                            boxShadow: isFilled ? "inset 2px 2px 0 rgba(255,255,255,0.5), inset -2px -2px 0 #0369a1" : "none",
                            position: "relative"
                          }}
                        >
                          {isFilled && (
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: i * 0.1 }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                pointerEvents: "none"
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
    </div>
  );
}
