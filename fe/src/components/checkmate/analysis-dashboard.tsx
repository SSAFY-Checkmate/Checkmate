import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCheckmateStore } from "../../lib/store";
import { cn } from "../../lib/utils";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { ANALYSIS_WARNING_CONFIG } from "../../lib/constants/mock-data";

type AnalysisDashboardProps = {
  className?: string;
  onClose?: () => void;
};

/**
 * [AnalysisDashboard 컴포넌트]
 * 실시간 영상 분석 상태와 결과를 보여주는 핵심 UI입니다.
 */
export const AnalysisDashboard = ({
  className,
  onClose,
}: AnalysisDashboardProps) => {
  // 스토어에서 상태와 액션을 가져옵니다.
  const {
    startAnalysis,
    analysisStatus,
    overallVerdict,
    openPanel,
    isWarningVisible,
    closeWarning,
    setActiveTab,
  } = useCheckmateStore();

  // 현재 분석 단계에 맞는 메시지를 결정합니다.
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
      case "idle":
      default:
        return "스캔 대기 중";
    }
  }, [analysisStatus]);

  /**
   * 결과 팝업(주의/안전/보류)에 대한 설정 데이터
   * [TODO: 목업 데이터 분리 완료] constants/mock-data.ts에서 가져옵니다.
   */
  const warningConfig = ANALYSIS_WARNING_CONFIG;

  /**
   * 결과 확인 버튼 클릭 시 동작
   */
  const handleAction = () => {
    closeWarning();
    if (overallVerdict === "unknown") {
      setActiveTab("community");
    } else {
      setActiveTab("report");
    }
    openPanel();
  };

  // 1. 분석 완료 후 결과 팝업이 띄워진 상태 (Warning/Safe View)
  if (isWarningVisible) {
    const {
      gradient,
      textColor,
      icon: Icon,
      prefix,
      title,
      desc,
      btnText,
    } = warningConfig[overallVerdict];

    return (
      <div
        className={cn(
          "bg-white pixel-border overflow-hidden flex flex-col relative transition-all duration-300",
          className,
        )}
      >
        {/* 상단 컬러 섹션 */}
        <div
          className={cn(
            "relative pt-8 pb-6 flex items-center justify-center border-b-[2px] border-black/20 bg-gradient-to-br",
            gradient,
          )}
        >
          <button
            onClick={closeWarning}
            className="absolute top-2 right-2 p-1 text-white hover:bg-black/20 transition-all cursor-pointer rounded-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-3 bg-black/20 rounded-md">
            <Icon className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* 텍스트 설명 섹션 */}
        <div className="flex flex-col items-center pt-5 pb-3 px-4 bg-zinc-50">
          <h3 className="text-[16px] text-black mb-2 flex items-center justify-center gap-2 text-center tracking-wide">
            <span
              className={cn(
                "inline-block px-1.5 py-0.5 text-[14px] font-bold",
                textColor,
              )}
            >
              [{prefix}]
            </span>
            <span className="font-bold">{title}</span>
          </h3>
          <div className="text-[12px] text-zinc-600 text-center leading-relaxed font-medium">
            {desc}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="p-4 pt-1 bg-zinc-50">
          <button
            onClick={handleAction}
            className="w-full bg-[#fde047] py-2.5 text-[15px] pixel-btn"
          >
            {btnText}
          </button>
        </div>
      </div>
    );
  }

  // 2. 기본 분석 대기/진행 상태 (Default/Scanning View)
  return (
    <div
      className={cn(
        "bg-white p-4 pixel-border flex flex-col items-center gap-1.5 relative",
        className,
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* 캐릭터 섹션 */}
      <div className="relative transition-transform active:scale-95 cursor-pointer mt-2">
        <PixelCharacter size="lg" />
        <AnimatePresence>
          {analysisStatus !== "idle" && (
            <motion.div
              initial={{ x: -60, scale: 0.8, opacity: 0 }}
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: -60 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute -bottom-1 -right-1"
            >
              <PixelOfficer
                size="sm"
                mood={
                  analysisStatus === "complete"
                    ? overallVerdict === "warning"
                      ? "alert"
                      : "happy"
                    : "thinking"
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 상태바 및 버튼 섹션 */}
      <div className="w-full flex flex-col justify-center min-h-[50px] mt-2">
        {/* A. 기본 상태 (IDLE) */}
        {analysisStatus === "idle" && (
          <button
            onClick={() => startAnalysis()}
            className="w-full bg-blue-500 text-white py-2.5 px-3 text-[14px] tracking-wide pixel-btn"
          >
            스캔 시작
          </button>
        )}

        {/* B. 진행 상태 (ANALYZING) */}
        {analysisStatus !== "idle" && analysisStatus !== "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1.5 px-1 pb-1"
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-900 px-0.5">
              <span className="animate-pulse font-bold tracking-widest">
                {statusMsg}
              </span>
            </div>
            <div className="h-4 w-full bg-zinc-200 p-0.5 border-[2px] border-black">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    analysisStatus === "detecting"
                      ? "25%"
                      : analysisStatus === "analyzing_transcript"
                        ? "50%"
                        : analysisStatus === "analyzing_claims"
                          ? "75%"
                          : "90%",
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-green-500 transition-all duration-300"
              />
            </div>
          </motion.div>
        )}

        {/* C. 완료 상태 (COMPLETE) */}
        {analysisStatus === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <button
              onClick={() => openPanel()}
              className="w-full bg-purple-500 text-white py-2.5 text-[14px] pixel-btn"
            >
              리포트 확인
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
