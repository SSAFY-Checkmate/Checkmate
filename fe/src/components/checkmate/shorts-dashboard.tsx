import { useState, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { PixelOfficer } from "./pixel-character";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle, Check } from "lucide-react";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { TrustMeter, ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { LoginView } from "./login-view";

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
  const { analysisStatus, startAnalysis, overallVerdict, isLoggedIn, setResultModalOpen } = useCheckmateStore();
  const [showCheckAnim, setShowCheckAnim] = useState(false);

  useEffect(() => {
    if (analysisStatus === "complete") {
      setShowCheckAnim(true);
      const timer = setTimeout(() => setShowCheckAnim(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [analysisStatus]);

  return (
    <div style={{ fontFamily: pixelFont, display: "flex", flexDirection: "column", alignItems: "center", width: "48px" }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => {
          if (!isLoggedIn) {
            setResultModalOpen(true);
            return;
          }
          if (analysisStatus === "complete") setResultModalOpen(true);
          else startAnalysis();
        }}
        style={{ width: "48px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: "6px", position: "relative" }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background:
              analysisStatus === "complete"
                ? verdictConfig[overallVerdict].color
                : analysisStatus === "idle"
                  ? "linear-gradient(135deg, #2563eb, #1e40af)"
                  : "linear-gradient(135deg, #0ea5e9, #2563eb)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: analysisStatus === "complete" ? "2px solid white" : "2px solid rgba(255,255,255,0.2)",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            position: "relative",
          }}
        >
          {analysisStatus !== "idle" && analysisStatus !== "complete" && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ position: "absolute", inset: "-6px", border: "4px solid transparent", borderTopColor: "#bbf7ff", borderRadius: "50%", zIndex: 0, filter: "drop-shadow(0 0 5px rgba(191, 247, 255, 0.8))" }}
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
            {showCheckAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                style={{ position: "absolute", zIndex: 10, color: "#22c55e", display: "flex", justifyContent: "center", alignItems: "center", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))" }}
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
            color: "#ffffff",
            textShadow: "0px 1px 4px rgba(0,0,0,0.8)",
            textAlign: "center",
            lineHeight: "1.2",
            marginTop: "4px",
            padding: "2px 6px",
            backgroundColor: "rgba(30, 58, 138, 0.7)",
            borderRadius: "4px",
          }}
        >
          {!isLoggedIn ? "로그인" : analysisStatus === "complete" ? "결과확인" : analysisStatus === "idle" ? "분석" : "분석중"}
        </span>
      </motion.div>
    </div>
  );
}

/**
 * [Checkmate 쇼츠 글로벌 결과 모달]
 */
export function GlobalResultModal({ shadowHost }: { shadowHost?: HTMLElement }) {
  const { isResultModalOpen, setResultModalOpen, overallVerdict, trustScore, summary, videoTitle, channelName, isLoggedIn } = useCheckmateStore();
  const [activeTab, setActiveTab] = useState<"summary" | "report" | "community">("summary");

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
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2147483647,
            padding: "20px",
            backdropFilter: "blur(12px)",
            fontFamily: pixelFont,
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setResultModalOpen(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "95vw",
              height: "90vh",
              maxWidth: "600px",
              maxHeight: "800px",
              ...PIXEL_STYLES.border,
              backgroundColor: "#1e293b",
              borderWidth: "6px",
              borderColor: verdictConfig[overallVerdict].color,
              padding: "32px 24px",
              position: "relative",
              fontFamily: pixelFont,
              boxShadow: "0 0 50px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => setResultModalOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255, 255, 255, 0.9)",
                border: "3px solid #1e293b",
                padding: "4px",
                cursor: "pointer",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.2)",
                zIndex: 20,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color="#1e293b" strokeWidth={4} />
            </button>
            
            <div
              style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: verdictConfig[overallVerdict].color,
                color: "#ffffff",
                padding: "4px 16px",
                fontSize: "12px",
                fontWeight: "900",
                border: "3px solid #1e293b",
                textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              {!isLoggedIn ? "CHECKMATE LOGIN" : `REPORT: ${channelName}`}
            </div>

            {!isLoggedIn ? (
              <div style={{ marginTop: "20px", height: "100%", overflowY: "auto" }}>
                <LoginView />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", height: "100%" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>
                  {[
                    { id: "summary", label: "요약" },
                    { id: "report", label: "상세" },
                    { id: "community", label: "커뮤니티" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        border: "none",
                        background: activeTab === tab.id ? verdictConfig[overallVerdict].color : "rgba(255,255,255,0.05)",
                        color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
                        fontFamily: pixelFont,
                        fontSize: "13px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        borderRadius: "4px",
                        transition: "all 0.2s",
                        boxShadow: activeTab === tab.id ? "0 4px 0 rgba(0,0,0,0.3)" : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                  {activeTab === "summary" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <h3 style={{ fontSize: "18px", color: "#f8fafc", lineHeight: "1.4", margin: 0, fontWeight: "bold" }}>{videoTitle}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.03)", padding: "20px", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                        <div style={{ width: "50px", height: "50px", backgroundColor: verdictConfig[overallVerdict].color, display: "flex", justifyContent: "center", alignItems: "center", border: "3px solid #1e293b" }}>
                          {(() => {
                            const Icon = verdictConfig[overallVerdict].icon;
                            return <Icon size={30} color="#ffffff" />;
                          })()}
                        </div>
                        <div>
                          <div style={{ fontSize: "22px", fontWeight: "900", color: verdictConfig[overallVerdict].color, textShadow: "2px 2px 0 rgba(0,0,0,0.5)" }}>{verdictConfig[overallVerdict].title}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold" }}>TRUST LEVEL: {trustScore}%</div>
                        </div>
                      </div>
                      <TrustMeter score={trustScore} />
                      <div style={{ backgroundColor: "#0f172a", color: "#cbd5e1", padding: "20px", fontSize: "14px", lineHeight: "1.7", ...PIXEL_STYLES.border, border: "2px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                        {summary || "수사 결과 요약 정보를 불러오는 중입니다..."}
                      </div>
                    </div>
                  )}
                  {activeTab === "report" && (
                    <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
                      <ReportTab />
                    </div>
                  )}
                  {activeTab === "community" && (
                    <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden" }}>
                      <CommunityTab />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "20px" }}>
                  <PixelButton text="확인" size="md" colorType="primary" onClick={() => setResultModalOpen(false)} />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
