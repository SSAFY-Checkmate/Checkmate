import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCheckmateStore, REPORT_REASONS } from "../../lib/store";
import { PixelButton } from "../common/pixel-button";
import { PixelConfirmModal } from "../common/pixel-confirm-modal";
import { PixelAlertModal } from "../common/pixel-alert-modal";

/**
 * [Checkmate 커스텀 픽셀 신고 모달]
 * 사용자가 리포트를 검토한 후 최종적으로 신고 사유를 선택하는 창입니다.
 * store.ts의 REPORT_REASONS 상수를 기반으로 동작합니다.
 */
export function ReportModal() {
  const { isReportModalOpen, setReportModalOpen, submitReport, reportingStatus } = useCheckmateStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false); // 최종 확인 모달 상태

  const PIXEL_FONT = "'CheckmatePixel', 'DungGeunMo', 'Courier New', monospace";

  const handleClose = () => {
    if (reportingStatus === "loading") return;
    setReportModalOpen(false);
    setSelectedId(null);
    setShowConfirm(false);
  };

  const handleOpenConfirm = () => {
    if (!selectedId) return;
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    const reason = REPORT_REASONS.find((r) => r.id === selectedId);
    if (!reason) return;

    console.log(`[Report] Submitting: reasonId=${reason.reasonId}, secondary=${reason.secondaryReasonId}`);
    await submitReport(reason.reasonId, reason.secondaryReasonId);
  };

  return (
    <AnimatePresence>
      {isReportModalOpen && (
        <div
          key="report-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483647,
            padding: "20px",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#ffffff",
              border: "4px solid #475569",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              fontFamily: PIXEL_FONT,
              boxShadow: "8px 8px 0 rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={20} color="#ef4444" strokeWidth={3} />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#334155", fontWeight: "bold" }}>수사 요청 (신고)</h3>
              </div>
              <div style={{ height: "2px", backgroundColor: "#e2e8f0", width: "100%" }} />
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                유튜브 커뮤니티 가이드 위반 사항을 신고합니다.
              </p>
            </div>

            {/* Content (REPORT_REASONS 상수 기반 렌더링) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reportingStatus === "idle" ? (
                REPORT_REASONS.map((reason) => (
                  <motion.div
                    key={reason.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedId(reason.id)}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: selectedId === reason.id ? "#fff1f2" : "#f8fafc",
                      border: `2px solid ${selectedId === reason.id ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#334155" }}>
                        {reason.label}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>{reason.description}</p>
                    </div>
                    <ChevronRight size={16} color={selectedId === reason.id ? "#ef4444" : "#94a3b8"} />
                  </motion.div>
                ))
              ) : (
                /* 결과 피드백 UI */
                <div
                  style={{
                    padding: "30px 0",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  {reportingStatus === "loading" && (
                    <>
                      <Loader2 size={40} color="#2563eb" className="animate-spin" />
                      <p style={{ fontWeight: "bold", color: "#334155" }}>증거물 제출 중...</p>
                    </>
                  )}
                  {reportingStatus === "success" && (
                    <>
                      <CheckCircle2 size={40} color="#10b981" />
                      <p style={{ fontWeight: "bold", color: "#10b981" }}>신고가 정상 접수되었습니다.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <div style={{ flex: 1 }}>
                <PixelButton
                  text="취소"
                  colorType="neutral"
                  size="sm"
                  onClick={handleClose}
                  disabled={reportingStatus === "loading"}
                />
              </div>
              <div style={{ flex: 1 }}>
                <PixelButton
                  text={reportingStatus === "idle" ? "신고하기" : "닫기"}
                  colorType="error"
                  size="sm"
                  disabled={reportingStatus === "idle" && !selectedId}
                  onClick={reportingStatus === "idle" ? handleOpenConfirm : handleClose}
                />
              </div>
            </div>
          </motion.div>

          {/* 최종 신고 확인 모달 */}
          <PixelConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleSubmit}
            title="신고 요청 확인"
            message="선택하신 사유로 해당 영상을 유튜브에 신고하시겠습니까? 이 작업은 취소할 수 없습니다."
            confirmText="신고하기"
            cancelText="취소"
            type="danger"
          />

          {/* 신고 실패 알림창 */}
          <PixelAlertModal
            isOpen={reportingStatus === "error"}
            onClose={() => useCheckmateStore.setState({ reportingStatus: "idle" })}
            title="신고 요청 실패"
            message="서버와의 통신에 실패했거나 권한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
            buttonText="확인"
            type="error"
          />
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AnimatePresence>
  );
}
