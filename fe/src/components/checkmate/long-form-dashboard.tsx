import { useMemo, useRef, useEffect, useState } from "react";
import { useCheckmateStore, logoutAuth, initializeAuth } from "../../lib/store";
import { useAnalysisMonitor } from "../../hooks/use-analysis-monitor";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, FileSearch, LogOut } from "lucide-react";
import { PIXEL_STYLES } from "../../lib/constants/styles";

/**
 * [Checkmate 롱폼 전용 대시보드]
 * 기존 AnalysisDashboard의 로직을 그대로 유지합니다.
 */
export function LongFormDashboard() {
  const {
    startAnalysis,
    analysisStatus,
    overallVerdict,
    trustScore,
    openPanel,
    warningCount,
    setActiveTab,
    isPanelOpen,
    closePanel,
    user,
    summary,
    startDemoAnalysis,
    errorMsg,
    setErrorMsg,
  } = useCheckmateStore();

  // 분석 모니터링 훅 (90초 타임아웃)
  useAnalysisMonitor(90000);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(232);

  // 컴포넌트 마운트 및 상태 변경 시 인증 초기화 및 너비 측정
  useEffect(() => {
    initializeAuth();
    if (barRef.current) {
      setBarWidth(barRef.current.offsetWidth);
    }
  }, [analysisStatus]);

  /**
   * 분석 상태에 따른 메시지 매핑
   */
  const statusMsg = useMemo(() => {
    switch (analysisStatus) {
      case "checking":
        return "분석 이력 확인 중...";
      case "detecting":
        return "영상 감지 중...";
      case "analyzing_transcript":
        return "자막 분석 중...";
      case "analyzing_claims":
        return "주장 추출 중...";
      case "verifying":
        return "신뢰도 검증 중...";
      case "complete":
        return "수사 완료!";
      case "error":
        return "수사 오류 발생";
      default:
        return "준비 중...";
    }
  }, [analysisStatus]);

  const tipMsg = useMemo(() => {
    switch (analysisStatus) {
      case "checking":
        return "데이터베이스에서 기존 분석 기록을 검색하고 있습니다.";
      case "detecting":
        return "영상 내 유료 광고 및 메타데이터 정보를 스캔 중입니다.";
      case "analyzing_transcript":
        return "자막의 문맥을 파악하여 핵심 수사 내용을 분석합니다.";
      case "analyzing_claims":
        return "추출된 주요 주장들의 논리적 타당성을 검토하고 있습니다.";
      case "verifying":
        return "공신력 있는 자료를 바탕으로 최종 검증을 수행 중입니다.";
      case "error":
        return "통신 상태를 확인하거나 잠시 후 다시 시도해주세요.";
      default:
        return "안전한 시청을 위해 팩트체크를 진행하고 있습니다.";
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

  const handleStartAnalysis = () => {
    setErrorMsg(null);
    startAnalysis();
  };

  return (
    <motion.div
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        ...PIXEL_STYLES.dashboardContainer,
        fontFamily: pixelFont,
      }}
    >
      {/* --- 상단 메인 카드 영역 --- */}
      <motion.div
        id="checkmate-main-card"
        layout
        transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
        style={{
          ...PIXEL_STYLES.border,
          position: "relative",
          background: analysisStatus === "complete" ? "white" : "#ffffff",
          boxShadow:
            analysisStatus === "complete" ? `0 15px 40px ${theme.shadowOuter}` : `0 10px 25px ${theme.shadowOuter}`,
          border: `4px solid ${theme.border}`,
          borderRadius: "16px",
          padding: analysisStatus === "complete" ? "0" : "16px", // 완료 시 패딩 제거 (내부 카드가 꽉 차게)
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          minHeight: "150px",
        }}
      >
        {/* 프리미엄 로그아웃 배지 UI */}
        {user?.name && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logoutAuth}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "1px solid #fecaca",
              color: "#ef4444",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.backgroundColor = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "#fecaca";
              e.currentTarget.style.backgroundColor = "#ffffff";
            }}
            title="로그아웃"
          >
            <LogOut size={12} strokeWidth={3} />
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {analysisStatus === "complete" ? (
            <motion.div
              key="result-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", display: "flex", flexDirection: "column" }}
            >
              {/* Gradient Header Area (merged with card top) */}
              <div
                style={{
                  background: warningConfig[overallVerdict].gradient,
                  padding: "32px 20px",
                  textAlign: "center",
                  color: "white",
                  position: "relative",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0.15,
                    pointerEvents: "none",
                  }}
                >
                  {(() => {
                    const Icon = warningConfig[overallVerdict].icon;
                    return <Icon size={140} />;
                  })()}
                </div>

                <div style={{ position: "relative", zIndex: 1, marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(4px)",
                        color: "white",
                        padding: "4px 12px",
                        fontSize: "10px",
                        fontWeight: "900",
                        borderRadius: "30px",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        letterSpacing: "1.5px",
                      }}
                    >
                      CHECKMATE OFFICIAL REPORT
                    </span>
                  </div>

                  <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
                    {warningConfig[overallVerdict].title}
                  </h2>
                  <p style={{ fontSize: "11px", opacity: 0.8, fontWeight: "bold" }}>
                    영상 분석 일련번호: CM-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* White Content Area */}
              <div
                style={{
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1px dashed #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ backgroundColor: theme.bgLight, padding: "6px", borderRadius: "8px" }}>
                      <FileSearch size={16} color={theme.border} />
                    </div>
                    <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                      수사 개요 및 총평
                    </h4>
                  </div>

                  {/* 영상 신뢰지수 배지 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "white",
                      padding: "4px 10px",
                      borderRadius: "30px",
                      border: `1.5px solid ${theme.border}33`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "900",
                        color: "#64748b",
                        letterSpacing: "0.5px",
                      }}
                    >
                      영상 신뢰지수
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "900", color: theme.border }}>{trustScore}</span>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: theme.border,
                          marginLeft: "2px",
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                    fontWeight: "bold",
                    lineHeight: "1.8",
                    margin: 0,
                    textAlign: "center",
                    wordBreak: "keep-all",
                  }}
                >
                  {summary || warningConfig[overallVerdict].desc}
                </p>

                {/* Detail Action Button (moved inside) */}
                <div style={{ width: "100%", marginTop: "8px" }}>
                  <PixelButton
                    onClick={(e) => togglePanel(e)}
                    colorType={isPanelOpen ? "neutral" : overallVerdict === "warning" ? "error" : "primary"}
                    text={isPanelOpen ? "상세 정보 닫기" : warningConfig[overallVerdict].btnText}
                    icon={
                      isPanelOpen ? (
                        <ChevronUp size={20} color="#1e293b" strokeWidth={3} />
                      ) : (
                        <ChevronDown size={20} color="#ffffff" strokeWidth={3} />
                      )
                    }
                    size="md"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing-view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
            >
              {/* 경찰서 건물 배경 + 오버레이 통합 관리 */}
              <div
                style={{ position: "relative", cursor: "pointer", marginTop: "16px" }}
                onClick={() => (analysisStatus === "idle" || analysisStatus === "error" ? handleStartAnalysis() : null)}
              >
                <PixelCharacter size="lg" />

                {/* 상태에 따른 경찰관 오버레이 (에러 상태 포함) */}
                {analysisStatus !== "idle" && (
                  <motion.div
                    key="officer-overlay"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", bottom: "-10px", right: "5px" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-26px",
                        right: "0",
                        backgroundColor: "white",
                        border: `2px solid ${analysisStatus === "error" ? "#ef4444" : "#0f172a"}`,
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: "900",
                        color: analysisStatus === "error" ? "#ef4444" : "#0f172a",
                        boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
                        fontFamily: pixelFont,
                        whiteSpace: "nowrap",
                        zIndex: 10,
                      }}
                    >
                      {/* 말풍선 꼬리 (우측 정렬에 맞춰 위치 조정) */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-6px",
                          right: "15px",
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: `6px solid ${analysisStatus === "error" ? "#ef4444" : "#0f172a"}`,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-3px",
                          right: "17px",
                          width: 0,
                          height: 0,
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderTop: "4px solid white",
                        }}
                      />

                      {analysisStatus === "loading"
                        ? "수사 기록 조회 중..."
                        : analysisStatus === "error"
                          ? "분석 오류 발생!"
                          : statusMsg}
                    </div>
                    <PixelOfficer
                      size="sm"
                      mood={analysisStatus === "error" ? "alert" : "thinking"}
                      isWalking={analysisStatus !== "error"}
                    />
                  </motion.div>
                )}
              </div>

              <div style={{ width: "100%", minHeight: "44px", marginTop: "8px" }}>
                {analysisStatus === "idle" || analysisStatus === "error" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                    {analysisStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, x: 0 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          x: [0, -2, 2, -2, 2, 0], // 미세한 쉐이크 효과
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          backgroundColor: "#fef2f2",
                          border: "2px solid #fecaca",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "4px",
                          boxShadow: "0 2px 4px rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        <div style={{ color: "#ef4444", flexShrink: 0 }}>
                          <AlertTriangle size={20} />
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              color: "#b91c1c",
                              fontWeight: "900",
                              fontFamily: pixelFont,
                            }}
                          >
                            {errorMsg || "알 수 없는 수사 오류"}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              fontSize: "11px",
                              color: "#ef4444",
                              fontWeight: "bold",
                              fontFamily: pixelFont,
                              opacity: 0.8,
                            }}
                          >
                            통신 상태를 확인하거나 잠시 후 다시 시도해 주세요.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    <PixelButton
                      onClick={() => handleStartAnalysis()}
                      colorType={analysisStatus === "error" ? "error" : "primary"}
                      text={analysisStatus === "error" ? "수사 재개하기" : "팩트체크 수사 시작"}
                    />
                    {analysisStatus === "idle" && (
                      <PixelButton
                        onClick={() => startDemoAnalysis()}
                        colorType="neutral"
                        text="데모 수사 시작 (토큰X)"
                      />
                    )}
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "12px" }}
                  >
                    <div ref={barRef} style={{ position: "relative", width: "100%", height: "24px" }}>
                      <div
                        style={{
                          height: "24px",
                          width: "100%",
                          backgroundColor: "rgba(15, 23, 42, 0.05)",
                          padding: "2px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        {(() => {
                          const progress =
                            analysisStatus === "loading"
                              ? 5
                              : analysisStatus === "checking"
                                ? 10
                                : analysisStatus === "detecting"
                                  ? 25
                                  : analysisStatus === "analyzing_transcript"
                                    ? 50
                                    : analysisStatus === "analyzing_claims"
                                      ? 75
                                      : 95;
                          const progressText = `${progress}% COMPLETE`;
                          const currentBarWidth = barWidth || 232;
                          return (
                            <>
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 1,
                                  fontSize: "12px",
                                  color: "#1e293b",
                                  fontWeight: "900",
                                  fontFamily: pixelFont,
                                  pointerEvents: "none",
                                }}
                              >
                                {progressText}
                              </div>
                              <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                  height: "100%",
                                  background: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
                                  borderRadius: "10px",
                                  position: "relative",
                                  zIndex: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${currentBarWidth}px`,
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "12px",
                                    fontWeight: "900",
                                    fontFamily: pixelFont,
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    pointerEvents: "none",
                                  }}
                                >
                                  {progressText}
                                </div>
                                <motion.div
                                  animate={{ x: ["-100%", "400%"] }}
                                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                    width: "100px",
                                    pointerEvents: "none",
                                  }}
                                />
                              </motion.div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div style={{ minHeight: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={tipMsg}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            fontFamily: pixelFont,
                            textAlign: "center",
                            background: "linear-gradient(110deg, #64748b 30%, #bae6fd 50%, #64748b 70%)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          <motion.div
                            animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                            style={{
                              background: "inherit",
                              WebkitBackgroundClip: "inherit",
                              WebkitTextFillColor: "inherit",
                            }}
                          >
                            {tipMsg}
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
              zIndex: 10,
            }}
          >
            <div style={{ height: "500px", display: "flex", flexDirection: "column" }}>
              <SidePanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
