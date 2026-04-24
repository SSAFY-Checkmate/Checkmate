import { useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import { useCheckmateStore, type AnalysisStatus } from "../../lib/store";
import { cn } from "../../lib/utils";
import { PixelOfficer, PixelCharacter } from "./pixel-character";
import { SidePanel } from "./side-panel";

type AnalysisDashboardProps = {
  className?: string;
  onClose?: () => void;
};

const getStatusMessage = (status: AnalysisStatus): string => {
  switch (status) {
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
};

export function AnalysisDashboard({ className = "", onClose }: AnalysisDashboardProps) {
  const {
    startAnalysis,
    analysisStatus,
    overallVerdict,
    openPanel,
    isWarningVisible,
    warningCount,
    closeWarning,
    setActiveTab,
  } = useCheckmateStore();

  const dashboardRef = useRef<HTMLDivElement>(null);

  // [이전 코드] Shadow DOM 미대응 상태로 잠시 복구
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isWarningVisible && dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        closeWarning();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isWarningVisible, closeWarning]);

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
      default:
        return "";
    }
  }, [analysisStatus]);

  const warningConfig = {
    safe: {
      gradient: "from-blue-400 to-blue-600",
      textColor: "text-blue-600",
      icon: ShieldCheck,
      prefix: "신뢰",
      title: "검증된 신뢰 정보",
      desc: "Checkmate 분석 결과, 신뢰할 수 있는 사실로 확인되었습니다.",
      btnText: "지금 확인",
    },
    warning: {
      gradient: "from-red-400 to-red-600",
      textColor: "text-red-600",
      icon: AlertTriangle,
      prefix: "주의",
      title: "허위/과장 정보 주의",
      desc: (
        <>
          이 영상에서 <span className="font-bold text-red-600">{warningCount}건</span>의 허위 의심 문장이
          발견되었습니다.
        </>
      ),
      btnText: "판단 근거 보기",
    },
    unknown: {
      gradient: "from-amber-400 to-amber-600",
      textColor: "text-amber-600",
      icon: HelpCircle,
      prefix: "보류",
      title: "판단 보류 안내",
      desc: "확보된 정보만으로는 AI 판독이 어렵습니다. 커뮤니티 수배를 통해 다른 유저들과 함께 진위를 검증해 보세요.",
      btnText: "게시판으로 이동",
    },
  };

  const handleAction = () => {
    closeWarning();
    if (overallVerdict === "unknown") {
      setActiveTab("community");
    } else {
      setActiveTab("report");
    }
    openPanel();
  };

  // 1. 분석 완료 결과 팝업 (디자인 고도화 적용 상태)
  if (isWarningVisible) {
    const config = warningConfig[overallVerdict as keyof typeof warningConfig] || warningConfig.unknown;
    const { gradient, textColor, icon: Icon, prefix, title, desc, btnText } = config;

    return (
      <div
        ref={dashboardRef}
        className={cn(
          "bg-white pixel-border overflow-hidden flex flex-col relative transition-all duration-300 font-pixel",
          className,
        )}
      >
        <div className={cn("relative pt-8 pb-6 flex items-center justify-center border-b-[2px] border-black/20 bg-gradient-to-br", gradient)}>
          <button onClick={closeWarning} className="absolute top-2 right-2 p-1 text-white hover:bg-black/20 transition-all cursor-pointer rounded-md">
            <X className="w-5 h-5" />
          </button>
          <div className="p-3 bg-black/20 rounded-md">
            <Icon className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>
        <div className="flex flex-col items-center pt-5 pb-3 px-4 bg-zinc-50">
          <h3 className="text-[16px] text-black mb-2 flex items-center justify-center gap-2 text-center tracking-wide">
            <span className={cn("inline-block px-1.5 py-0.5 text-[14px] font-bold", textColor)}>[{prefix}]</span>
            <span className="font-bold">{title}</span>
          </h3>
          <div className="text-[12px] text-zinc-600 text-center leading-relaxed font-medium">{desc}</div>
        </div>
        <div className="p-4 pt-1 bg-zinc-50">
          <button onClick={handleAction} className="w-full btn-yellow-pixel py-2.5 text-[15px] cursor-pointer pixel-btn">
            {btnText}
          </button>
        </div>
      </div>
    );
  }

  // 2. 기본 분석 대기/진행 상태 (디자인 고도화 적용 상태)
  return (
    <div
      ref={dashboardRef}
      className={cn("bg-white p-6 light-border flex flex-col items-center gap-4 relative font-pixel", className)}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => {
          openPanel();
          onClose?.();
        }}
        className="relative transition-transform active:scale-95 cursor-pointer mt-4"
        style={{ background: "none", border: "none", padding: 0 }}
      >
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
                mood={analysisStatus === "complete" ? (overallVerdict === "warning" ? "alert" : "happy") : "thinking"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="w-full flex flex-col justify-center">
        {analysisStatus === "idle" && (
          <button
            onClick={() => startAnalysis()}
            className="w-full btn-blue-pixel py-3 px-4 text-[16px] cursor-pointer pixel-btn"
          >
            스캔 시작
          </button>
        )}

        {analysisStatus !== "idle" && analysisStatus !== "complete" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5 px-1 pb-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-900 px-0.5">
              <div className="flex items-center gap-1.5 tracking-widest">
                <span className="animate-pulse">{statusMsg}</span>
              </div>
            </div>
            <div className="h-4 w-full bg-zinc-200 p-0.5 pixel-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    analysisStatus === "detecting" ? "25%" : analysisStatus === "analyzing_transcript" ? "50%" : analysisStatus === "analyzing_claims" ? "75%" : "90%",
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-green-500 transition-all duration-300"
              />
            </div>
          </motion.div>
        )}

        {analysisStatus === "complete" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
            <button
              onClick={() => {
                openPanel();
                onClose?.();
              }}
              className="w-full btn-purple-pixel py-2.5 text-[15px] cursor-pointer pixel-btn"
            >
              리포트 확인
            </button>
          </motion.div>
        )}
      </div>
      <SidePanel />
    </div>
  );
}
