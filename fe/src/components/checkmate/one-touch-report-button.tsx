import { useCheckmateStore } from "../../lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

/**
 * [리포트 하단형 경광등 신고 버튼 - Premium Siren Bar]
 * 리포트의 결론 부분에 배치되어 사용자의 최종 결정을 돕습니다.
 */
export function OneTouchReportButton() {
  const { setReportModalOpen, reportingStatus } = useCheckmateStore();
  const isFlashing = reportingStatus === "loading" || reportingStatus === "success";
  const pixelFont = "'CheckmatePixel', sans-serif";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setReportModalOpen(true)}
      style={{
        marginTop: "24px",
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.8)",
        border: "2px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        fontFamily: pixelFont,
      }}
    >
      {/* 배경 번쩍임 효과 (신고 중) */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#ef4444",
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
        {/* 경광등 아이콘 */}
        <div style={{ position: "relative", width: "36px", height: "36px" }}>
          {isFlashing && (
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              style={{
                position: "absolute",
                inset: "-5px",
                borderRadius: "50%",
                backgroundColor: "#ff0000",
                filter: "blur(10px)",
              }}
            />
          )}
          <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <motion.div 
              animate={isFlashing ? { backgroundColor: ["#ff0000", "#0000ff", "#ff0000"] } : {}}
              transition={{ repeat: Infinity, duration: 0.4 }}
              style={{ width: "80%", height: "60%", backgroundColor: "#ef4444", borderRadius: "50% 50% 0 0", border: "2px solid #0f172a" }} 
            />
            <div style={{ width: "100%", height: "40%", backgroundColor: "#334155", border: "2px solid #0f172a", borderRadius: "0 0 4px 4px" }} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "900", color: "#1e293b", wordBreak: "keep-all" }}>
            {isFlashing ? "신고가 접수되었습니다!" : "유튜브에 직접 신고하기"}
          </p>
          <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#64748b", wordBreak: "keep-all" }}>
            {isFlashing ? "수사팀이 검토를 시작합니다." : "허위 정보 확산 방지에 동참해 주세요."}
          </p>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, flexShrink: 0, marginLeft: "8px" }}>
        <div style={{
          padding: "6px 12px",
          backgroundColor: "#fee2e2",
          borderRadius: "8px",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          fontWeight: "900",
          whiteSpace: "nowrap"
        }}>
          <ShieldAlert size={16} />
          <span>긴급 수사</span>
        </div>
      </div>
    </motion.div>
  );
}
