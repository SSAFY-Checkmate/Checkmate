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
              analysisStatus === "complete"
                ? "linear-gradient(135deg, #34d399, #10b981)"
                : analysisStatus === "idle" || analysisStatus === "error"
                  ? "#f2f2f2"
                  : "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border:
              analysisStatus === "complete"
                ? "2px solid white" // 주황색 대신 화이트 테두리로 깔끔하게
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
              <>
                {/* 외곽 버스트 링 효과 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    border: "4px solid #34d399",
                    borderRadius: "50%",
                    zIndex: 5,
                  }}
                />
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
                  }}
                >
                  <Check size={32} strokeWidth={4} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "900",
            color: analysisStatus === "complete" ? "#10b981" : analysisStatus === "error" ? "#ef4444" : "#0f172a",
            textAlign: "center",
            lineHeight: "1.2",
            marginTop: "6px",
            padding: analysisStatus === "complete" ? "2px 8px" : "2px 2px",
            backgroundColor: analysisStatus === "complete" ? "rgba(16, 185, 129, 0.1)" : "transparent",
            borderRadius: "10px",
            whiteSpace: "nowrap",
            letterSpacing: "-0.5px",
            transition: "all 0.3s ease",
            border: analysisStatus === "complete" ? "1px solid rgba(16, 185, 129, 0.2)" : "none",
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
              backgroundColor: "#f8fafc", // 밝은 배경
              borderWidth: "6px",
              borderColor: "#e2e8f0", // 밝은 테두리
              padding: "0px",
              position: "relative",
              fontFamily: pixelFont,
              boxShadow: "0 25px 60px rgba(15, 23, 42, 0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#f1f5f9",
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Search size={14} color="#64748b" />
                <span style={{ color: "#475569", fontSize: "12px", fontWeight: "bold" }}>채널명: {channelName}</span>
              </div>
              <button
                onClick={() => setResultModalOpen(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
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
                    style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: 0, wordBreak: "keep-all" }}
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
                      backgroundColor: "white",
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
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>최종 수사 결과</div>
                        <div
                          style={{ fontSize: "18px", fontWeight: "900", color: verdictConfig[overallVerdict].color }}
                        >
                          {verdictConfig[overallVerdict].title}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>수사 신뢰도</div>
                      <div style={{ fontSize: "24px", fontWeight: "900", color: "#1e293b" }}>
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
                          <h3 style={{ fontSize: "14px", color: "#1e293b", margin: 0, fontWeight: "bold" }}>
                            수사 개요 및 총평
                          </h3>
                        </div>
                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "20px",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            position: "relative",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
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
                          marginTop: "12px",
                          padding: "5px",
                          backgroundColor: "#f1f5f9", // 밝은 테마용 배경
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveModalTab("report")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: "900",
                            fontFamily: pixelFont,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderRadius: "7px",
                            background:
                              activeModalTab === "report" ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "transparent",
                            color: activeModalTab === "report" ? "white" : "#64748b",
                            border: "none",
                            boxShadow:
                              activeModalTab === "report"
                                ? "0 4px 12px rgba(14, 165, 233, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)"
                                : "none",
                            transform: activeModalTab === "report" ? "translateY(0)" : "none",
                          }}
                        >
                          <FileText
                            size={15}
                            style={{
                              filter:
                                activeModalTab === "report" ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none",
                            }}
                          />
                          리포트
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalTab("community")}
                          style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: "900",
                            fontFamily: pixelFont,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderRadius: "7px",
                            background:
                              activeModalTab === "community"
                                ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                                : "transparent",
                            color: activeModalTab === "community" ? "white" : "#64748b",
                            border: "none",
                            boxShadow:
                              activeModalTab === "community"
                                ? "0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)"
                                : "none",
                            transform: activeModalTab === "community" ? "translateY(0)" : "none",
                          }}
                        >
                          <Search
                            size={15}
                            style={{
                              filter:
                                activeModalTab === "community" ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none",
                            }}
                          />
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
                              <h3 style={{ fontSize: "13px", color: "#1e293b", margin: 0, fontWeight: "bold" }}>
                                수사관 정밀 판독 결과 (증거 목록)
                              </h3>
                            </div>
                            <div
                              style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
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
                            <div
                              style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
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
                backgroundColor: "#f1f5f9",
                borderTop: "1px solid #e2e8f0",
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
