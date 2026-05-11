import { useState, useEffect } from "react";
import { useCheckmateStore, initializeAuth } from "../../lib/store";
import { PixelOfficer } from "./pixel-character";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle, Check, FileText, Search } from "lucide-react";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { LoginView } from "./login-view";
import { useAnalysisMonitor } from "../../hooks/use-analysis-monitor";

const pixelFont = "'CheckmatePixel', sans-serif";
const verdictConfig = {
  safe: { icon: ShieldCheck, color: "#10b981", title: "검증 완료", theme: "#10b981" },
  warning: { icon: AlertTriangle, color: "#f59e0b", title: "주의 필요", theme: "#f59e0b" },
  unknown: { icon: HelpCircle, color: "#8b5cf6", title: "판단 보류", theme: "#8b5cf6" },
};

/**
 * [Checkmate 쇼츠 전용 대시보드 - 버튼 인터페이스]
 */
export function ShortsDashboard() {
  const {
    analysisStatus,
    startAnalysis,
    overallVerdict,
    isLoggedIn,
    setResultModalOpen,
    setCurrentVideo,
    checkAnalysisStatus,
    currentVideoId,
    startDemoAnalysis,
    errorMsg,
    setErrorMsg,
  } = useCheckmateStore();

  // 숏폼 분석 모니터링 (3분 타임아웃)
  useAnalysisMonitor(180000);

  const [showCheckAnim, setShowCheckAnim] = useState(false);

  const handleStartAnalysis = () => {
    setErrorMsg(null);
    startAnalysis();
  };

  const handleStartDemo = () => {
    setErrorMsg(null);
    startDemoAnalysis();
  };

  // 쇼츠 분석 진행률(%) 계산
  const getProgressPercent = () => {
    switch (analysisStatus) {
      case "detecting":
        return "25%";
      case "analyzing_transcript":
        return "50%";
      case "analyzing_claims":
        return "75%";
      case "verifying":
        return "95%";
      case "checking":
        return "조회중";
      default:
        return "준비중";
    }
  };

  // 컴포넌트 마운트 시 인증 초기화 및 URL 변경 감지
  useEffect(() => {
    initializeAuth();

    const handleUrlChange = () => {
      const url = window.location.href;
      let videoId = "";

      if (url.includes("/shorts/")) {
        videoId = url.split("/shorts/")[1].split("?")[0];
      } else if (url.includes("v=")) {
        videoId = new URLSearchParams(window.location.search).get("v") || "";
      }

      if (videoId && videoId !== currentVideoId) {
        setCurrentVideo(videoId);
        checkAnalysisStatus();
      }
    };

    handleUrlChange();
    const interval = setInterval(handleUrlChange, 2000);
    return () => clearInterval(interval);
  }, [setCurrentVideo, checkAnalysisStatus, currentVideoId]);

  // 분석 완료 시 체크 애니메이션 트리거
  useEffect(() => {
    if (analysisStatus === "complete") {
      setShowCheckAnim(true);
      const timer = setTimeout(() => setShowCheckAnim(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [analysisStatus]);

  return (
    <div
      style={{ fontFamily: pixelFont, display: "flex", flexDirection: "column", alignItems: "center", width: "48px" }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => {
          if (!isLoggedIn) {
            setResultModalOpen(true);
            return;
          }

          if (analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error") return;

          if (analysisStatus === "complete" || analysisStatus === "error") setResultModalOpen(true);
          else handleStartAnalysis();
        }}
        style={{
          width: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor:
            analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error"
              ? "not-allowed"
              : "pointer",
          gap: "6px",
          position: "relative",
          opacity: analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error" ? 0.8 : 1,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background:
              analysisStatus === "idle" || analysisStatus === "complete" || analysisStatus === "error"
                ? "#f2f2f2"
                : "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border:
              analysisStatus === "complete"
                ? `2px solid ${verdictConfig[overallVerdict].color}`
                : analysisStatus === "error"
                  ? "2px solid #ef4444"
                  : "none",
            boxShadow: analysisStatus === "idle" ? "none" : "0 4px 12px rgba(37, 99, 235, 0.3)",
            position: "relative",
          }}
        >
          {analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error" && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{
                position: "absolute",
                inset: "-2px",
                border: "3px solid transparent",
                borderTopColor: "#bbf7ff",
                borderRadius: "50%",
                zIndex: 0,
                filter: "drop-shadow(0 0 3px rgba(191, 247, 255, 0.6))",
              }}
            />
          )}
          <div style={{ zIndex: 1, position: "relative", display: "flex" }}>
            <PixelOfficer
              size="xs"
              mood={analysisStatus === "complete" ? "happy" : "thinking"}
              isWalking={analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error"}
            />
          </div>
          <AnimatePresence>
            {analysisStatus !== "idle" && analysisStatus !== "complete" && analysisStatus !== "error" && (
              <motion.div
                initial={{ y: 5, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: "absolute",
                  top: "-26px",
                  right: "4px",
                  backgroundColor: "white",
                  border: "2px solid #0f172a",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: "900",
                  color: "#0f172a",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.2)",
                  whiteSpace: "nowrap",
                  zIndex: 20,
                  fontFamily: pixelFont,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "-5px",
                    right: "14px",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid #0f172a",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "16px",
                    width: 0,
                    height: 0,
                    borderLeft: "3px solid transparent",
                    borderRight: "3px solid transparent",
                    borderTop: "3px solid white",
                  }}
                />
                {getProgressPercent()}
              </motion.div>
            )}
          </AnimatePresence>
          {analysisStatus === "error" && (
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "18px",
                height: "18px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid white",
                zIndex: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <span style={{ color: "white", fontSize: "14px", fontWeight: "900", lineHeight: 1 }}>!</span>
            </div>
          )}
          <AnimatePresence>
            {showCheckAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                style={{
                  position: "absolute",
                  zIndex: 10,
                  color: "#22c55e",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))",
                }}
              >
                <Check size={36} strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "900",
            color: analysisStatus === "error" ? "#ef4444" : "#0f172a",
            textAlign: "center",
            lineHeight: "1.2",
            marginTop: "4px",
            padding: "2px 2px", // 좌우 패딩 축소
            whiteSpace: "nowrap", // 줄바꿈 방지
            letterSpacing: "-0.5px", // 자간 축소
            backgroundColor: "transparent",
          }}
        >
          {!isLoggedIn
            ? "로그인"
            : analysisStatus === "complete"
              ? "결과확인"
              : analysisStatus === "error"
                ? "오류발생"
                : analysisStatus === "idle"
                  ? "수사시작"
                  : "수사중"}
        </span>
      </motion.div>

      {/* 데모 버튼 추가 (idle 상태거나 error 상태일 때만 노출) */}
      <AnimatePresence>
        {(analysisStatus === "idle" || analysisStatus === "error") && isLoggedIn && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -10 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleStartDemo()}
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#f2f2f2",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid #94a3b8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Search size={18} color="#64748b" />
            </div>
            <span style={{ fontSize: "9px", fontWeight: "900", color: "#64748b" }}>데모</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * [Checkmate 쇼츠 글로벌 결과 모달]
 */
export function GlobalResultModal({ shadowHost }: { shadowHost?: HTMLElement }) {
  const {
    isResultModalOpen,
    setResultModalOpen,
    overallVerdict,
    trustScore,
    summary,
    channelName,
    isLoggedIn,
    analysisStatus,
  } = useCheckmateStore();

  const [activeModalTab, setActiveModalTab] = useState<"report" | "community">("report");

  useEffect(() => {
    if (!shadowHost) return;
    if (isResultModalOpen) {
      shadowHost.style.display = "block";
      shadowHost.classList.add("modal-open");
    } else {
      shadowHost.style.display = "none";
      shadowHost.classList.remove("modal-open");
    }
  }, [isResultModalOpen, shadowHost]);

  return (
    <AnimatePresence>
      {isResultModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2147483647,
            padding: "20px",
            backdropFilter: "blur(6px)",
            fontFamily: pixelFont,
            pointerEvents: "auto",
          }}
          onClick={() => setResultModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "95vw",
              height: "85vh",
              maxWidth: "520px",
              ...PIXEL_STYLES.border,
              backgroundColor: "#1e293b",
              borderWidth: "6px",
              borderColor: "#64748b",
              padding: "0px",
              position: "relative",
              fontFamily: pixelFont,
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#0f172a",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "4px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={14} color="#94a3b8" />
                <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "bold" }}>채널명: {channelName}</span>
              </div>
              <button
                onClick={() => setResultModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {analysisStatus === "error" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: "20px",
                    textAlign: "center",
                    color: "#ef4444",
                    padding: "40px 20px",
                  }}
                >
                  <AlertTriangle size={56} strokeWidth={1.5} />
                  <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>분석을 진행할 수 없습니다</h3>
                  <p
                    style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0, wordBreak: "keep-all" }}
                  >
                    {summary || "데이터 분석을 지원하지 않거나 분석 중 오류가 발생한 영상입니다."}
                  </p>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "10px" }}>
                    커뮤니티 탭에서 다른 사람들과 의견을 나누어 보세요!
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: `2px solid ${verdictConfig[overallVerdict].color}`,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: "6px",
                      boxShadow: `0 4px 15px ${verdictConfig[overallVerdict].color}11`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: verdictConfig[overallVerdict].color,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "4px",
                          border: "2px solid #0f172a",
                          flexShrink: 0,
                        }}
                      >
                        {(() => {
                          const Icon = verdictConfig[overallVerdict].icon;
                          return <Icon size={20} color="#fff" />;
                        })()}
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>최종 수사 결과</div>
                        <div
                          style={{ fontSize: "18px", fontWeight: "900", color: verdictConfig[overallVerdict].color }}
                        >
                          {verdictConfig[overallVerdict].title}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>수사 신뢰도</div>
                      <div style={{ fontSize: "24px", fontWeight: "900", color: "#fff" }}>
                        {trustScore}
                        <span style={{ fontSize: "14px", color: verdictConfig[overallVerdict].color }}>%</span>
                      </div>
                    </div>
                  </div>

                  {!isLoggedIn ? (
                    <LoginView />
                  ) : (
                    <>
                      <section>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                          <FileText size={16} color={verdictConfig[overallVerdict].color} />
                          <h3 style={{ fontSize: "14px", color: "#f1f5f9", margin: 0, fontWeight: "bold" }}>
                            수사 개요
                          </h3>
                        </div>
                        <div
                          style={{
                            backgroundColor: "#0f172a",
                            padding: "20px",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            color: "#cbd5e1",
                            border: "2px solid rgba(255,255,255,0.05)",
                            borderRadius: "2px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "4px",
                              height: "100%",
                              backgroundColor: verdictConfig[overallVerdict].color,
                            }}
                          ></div>
                          {summary || "수사 결과 요약 정보를 불러오는 중입니다..."}
                        </div>
                      </section>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          padding: "4px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                          border: "2px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModalTab("report")}
                          style={{
                            flex: 1,
                            padding: "8px",
                            fontSize: "13px",
                            fontWeight: "900",
                            fontFamily: pixelFont,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            transition: "all 0.1s",
                            borderRadius: "4px",
                            backgroundColor: activeModalTab === "report" ? "#0ea5e9" : "transparent",
                            color: activeModalTab === "report" ? "white" : "#64748b",
                            border: activeModalTab === "report" ? "2px solid #0284c7" : "2px solid transparent",
                            boxShadow: activeModalTab === "report" ? "0 3px 0 #0369a1" : "none",
                            transform: activeModalTab === "report" ? "translateY(-1px)" : "none",
                          }}
                        >
                          <FileText size={14} />
                          리포트
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab("community")}
                          style={{
                            flex: 1,
                            padding: "8px",
                            fontSize: "13px",
                            fontWeight: "900",
                            fontFamily: pixelFont,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            transition: "all 0.1s",
                            borderRadius: "4px",
                            backgroundColor: activeModalTab === "community" ? "#8b5cf6" : "transparent",
                            color: activeModalTab === "community" ? "white" : "#64748b",
                            border: activeModalTab === "community" ? "2px solid #7c3aed" : "2px solid transparent",
                            boxShadow: activeModalTab === "community" ? "0 3px 0 #6d28d9" : "none",
                            transform: activeModalTab === "community" ? "translateY(-1px)" : "none",
                          }}
                        >
                          <Search size={14} />
                          커뮤니티
                        </button>
                      </div>

                      <AnimatePresence mode="wait">
                        {activeModalTab === "report" ? (
                          <motion.section
                            key="report"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <FileText size={14} color={verdictConfig[overallVerdict].color} />
                              <h3 style={{ fontSize: "13px", color: "#f1f5f9", margin: 0, fontWeight: "bold" }}>
                                수사관 정밀 판독 결과 (증거 목록)
                              </h3>
                            </div>
                            <div
                              style={{
                                backgroundColor: "rgba(255,255,255,0.02)",
                                borderRadius: "8px",
                                overflow: "hidden",
                              }}
                            >
                              <ReportTab isCompact={true} />
                            </div>
                          </motion.section>
                        ) : (
                          <motion.section
                            key="community"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <Search size={14} color="#8b5cf6" />
                              <h3 style={{ fontSize: "13px", color: "#f1f5f9", margin: 0, fontWeight: "bold" }}>
                                수사 상황실 (커뮤니티)
                              </h3>
                            </div>
                            <div
                              style={{
                                backgroundColor: "rgba(255,255,255,0.02)",
                                borderRadius: "8px",
                                overflow: "hidden",
                              }}
                            >
                              <CommunityTab />
                            </div>
                          </motion.section>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </>
              )}
            </div>

            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                borderTop: "2px solid rgba(255,255,255,0.05)",
              }}
            >
              <PixelButton text="보고서 닫기" size="md" colorType="primary" onClick={() => setResultModalOpen(false)} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
