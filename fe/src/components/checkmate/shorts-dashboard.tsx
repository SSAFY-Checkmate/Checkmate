import { useState, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { PixelOfficer } from "./pixel-character";
import { PixelButton } from "../common/pixel-button";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle, Check, LogIn } from "lucide-react";
import { PIXEL_STYLES, COLORS } from "../../lib/constants/styles";
import { TrustMeter } from "./report-tab";
import { LoginView } from "./login-view";

/**
 * [Checkmate 쇼츠 전용 대시보드 - Direct Injection 버전]
 * 유튜브의 #actions 버튼 바 내부에 직접 삽입되어 렌더링됩니다.
 */
export function ShortsDashboard() {
  const { analysisStatus, startAnalysis, overallVerdict, trustScore, summary, videoTitle, channelName, isLoggedIn } =
    useCheckmateStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showCheckAnim, setShowCheckAnim] = useState(false);

  // 분석 완료 시 체크 애니메이션 트리거
  useEffect(() => {
    if (analysisStatus === "complete") {
      setShowCheckAnim(true);
      const timer = setTimeout(() => setShowCheckAnim(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [analysisStatus]);

  const pixelFont = "'CheckmatePixel', sans-serif";
  const verdictConfig = {
    safe: { icon: ShieldCheck, color: "#10b981", title: "검증 완료", theme: "#10b981" },
    warning: { icon: AlertTriangle, color: "#f59e0b", title: "주의 필요", theme: "#f59e0b" },
    // [개선] 주황색 대신 세련된 바이올렛 테마 적용
    unknown: { icon: HelpCircle, color: "#8b5cf6", title: "판단 보류", theme: "#8b5cf6" },
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
            if (!isLoggedIn) {
              setIsModalOpen(true);
              return;
            }
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
              overflow: "visible", // 로딩 링이 삐져나올 수 있도록
            }}
          >
            {/* 분석 중 로딩 링 (수사관 뒤에서 광채와 함께 회전) */}
            {analysisStatus !== "idle" && analysisStatus !== "complete" && (
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: "-6px",
                  border: "4px solid transparent",
                  borderTopColor: "#bbf7ff", // 밝은 아쿠아 블루
                  borderRadius: "50%",
                  zIndex: 0,
                  filter: "drop-shadow(0 0 5px rgba(191, 247, 255, 0.8))",
                }}
              />
            )}

            {/* 수사관 캐릭터 (앞으로 배치) */}
            <div style={{ zIndex: 1, position: "relative", display: "flex" }}>
              <PixelOfficer 
                size="xs" 
                mood={analysisStatus === "complete" ? "happy" : "thinking"} 
                isWalking={analysisStatus !== "idle" && analysisStatus !== "complete"}
              />
            </div>

            {/* 완료 시 나타났다 사라지는 체크 애니메이션 */}
            <AnimatePresence>
              {showCheckAnim && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    color: "#22c55e", // 전형적인 체크 그린 색상 적용
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    // 초록색 체크가 잘 보이도록 흰색 광채 효과 추가
                    filter: "drop-shadow(0 0 5px rgba(255,255,255,0.8))",
                  }}
                >
                  <Check size={36} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 하단 텍스트 캡션 */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: "900",
              color: "#ffffff",
              textShadow: "0px 1px 4px rgba(0,0,0,0.8), 0px 0px 2px rgba(0,0,0,1)",
              textAlign: "center",
              lineHeight: "1.2",
              marginTop: "4px",
              padding: "2px 6px",
              backgroundColor: "rgba(30, 58, 138, 0.7)",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {!isLoggedIn ? "로그인" : analysisStatus === "complete" ? "결과확인" : analysisStatus === "idle" ? "분석" : "분석중"}
          </span>

        </motion.div>
      </div>

      {/* --- 결과 모달 (모달은 여전히 fixed로 띄워야 함) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
              padding: "20px",
              backdropFilter: "blur(8px)",
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
                boxShadow: "20px 20px 0 rgba(0,0,0,0.2)",
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
                  color: "#ffffff",
                  padding: "4px 12px",
                  fontSize: "14px",
                  fontWeight: "900",
                  border: "4px solid #1e293b",
                  textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
                }}
              >
                {!isLoggedIn ? "CHECKMATE LOGIN" : `REPORT: ${channelName}`}
              </div>

              {!isLoggedIn ? (
                <div style={{ marginTop: "20px" }}>
                  <LoginView />
                </div>
              ) : (
                <>
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
                    <PixelButton text="확인" size="md" colorType="primary" onClick={() => setIsModalOpen(false)} />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
