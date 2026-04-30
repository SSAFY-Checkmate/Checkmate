import { useState, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { PixelOfficer } from "./pixel-character";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { PIXEL_STYLES, COLORS } from "../../lib/constants/styles";
import { TrustMeter } from "./report-tab";

/**
 * [Checkmate 쇼츠 전용 대시보드 - Direct Injection 버전]
 * 유튜브의 #actions 버튼 바 내부에 직접 삽입되어 렌더링됩니다.
 */
export function ShortsDashboard() {
  const {
    analysisStatus,
    startAnalysis,
    overallVerdict,
    trustScore,
    summary,
    videoTitle,
    channelName,
  } = useCheckmateStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const pixelFont = "'CheckmatePixel', sans-serif";
  const verdictConfig = {
    safe: { icon: ShieldCheck, color: COLORS.success, title: "검증 완료", theme: "#22c55e" },
    warning: { icon: AlertTriangle, color: COLORS.destructive, title: "주의 필요", theme: "#ef4444" },
    unknown: { icon: HelpCircle, color: COLORS.warning, title: "판단 보류", theme: "#f59e0b" },
  };

  return (
    <>
      {/* --- 버튼 바 내부에 위치하는 수사관 버튼 --- */}
      <div
        style={{
          fontFamily: pixelFont,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "48px",
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            if (analysisStatus === "complete") setIsModalOpen(true);
            else startAnalysis();
          }}
          style={{
            width: "48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            gap: "6px",
            position: "relative",
          }}
        >
          {/* 유튜브 스타일 원형 버튼 */}
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor:
                analysisStatus === "complete" ? verdictConfig[overallVerdict].color : "rgba(0, 0, 0, 0.6)",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: analysisStatus === "complete" ? "2px solid white" : "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <PixelOfficer size="xs" mood={analysisStatus === "complete" ? "happy" : "thinking"} />

            {/* 분석 중 로딩 링 */}
            {analysisStatus !== "idle" && analysisStatus !== "complete" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: "-4px",
                  border: "3px solid transparent",
                  borderTopColor: "#0ea5e9",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>

          {/* 하단 텍스트 캡션 */}
          <span
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#ffffff",
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              textAlign: "center",
              lineHeight: "1.2",
            }}
          >
            {analysisStatus === "complete" ? "결과확인" : "팩트체크"}
          </span>

          {/* 분석 완료 배지 */}
          {analysisStatus === "complete" && (
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "0px",
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                padding: "2px",
                border: `2px solid ${verdictConfig[overallVerdict].color}`,
              }}
            >
              {(() => {
                const Icon = verdictConfig[overallVerdict].icon;
                return <Icon size={10} color={verdictConfig[overallVerdict].color} />;
              })()}
            </div>
          )}
        </motion.div>
      </div>

      {/* --- 결과 모달 (모달은 여전히 fixed로 띄워야 함) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
              padding: "20px",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "360px",
                backgroundColor: "#ffffff",
                ...PIXEL_STYLES.border,
                borderWidth: "6px",
                borderColor: verdictConfig[overallVerdict].color,
                padding: "24px",
                position: "relative",
                fontFamily: pixelFont,
                boxShadow: "20px 20px 0 rgba(0,0,0,0.3)",
              }}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "-15px",
                  right: "-15px",
                  background: "#ffffff",
                  border: "4px solid #1e293b",
                  padding: "4px",
                  cursor: "pointer",
                  boxShadow: "4px 4px 0 rgba(0,0,0,0.2)",
                }}
              >
                <X size={20} color="#1e293b" strokeWidth={4} />
              </button>
              <div
                style={{
                  position: "absolute",
                  top: "-15px",
                  left: "20px",
                  background: verdictConfig[overallVerdict].color,
                  color: "white",
                  padding: "4px 12px",
                  fontSize: "14px",
                  fontWeight: "900",
                  border: "4px solid #1e293b",
                }}
              >
                REPORT: {channelName}
              </div>
              <div style={{ marginTop: "15px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", color: "#1e293b", lineHeight: "1.4" }}>{videoTitle}</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f8fafc",
                    padding: "15px",
                    border: "2px dashed #cbd5e1",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: verdictConfig[overallVerdict].color,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "3px solid #1e293b",
                    }}
                  >
                    {(() => {
                      const Icon = verdictConfig[overallVerdict].icon;
                      return <Icon size={30} color="#ffffff" />;
                    })()}
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: verdictConfig[overallVerdict].color }}>
                      {verdictConfig[overallVerdict].title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>TRUST LEVEL: {trustScore}%</div>
                  </div>
                </div>
                <TrustMeter score={trustScore} />
                <div
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#f1f5f9",
                    padding: "15px",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {summary || "수사 결과 요약 정보를 불러오는 중입니다..."}
                </div>
                <PixelButton
                  text="확인"
                  size="md"
                  colorType="primary"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
