import React, { useState } from "react";
import { useCheckmateStore } from "../../lib/store";
import { cn } from "../../lib/utils";
import { X, Check, Shield, Trash2, Ban, Flag } from "lucide-react";
import { PixelOfficer } from "./pixel-character";

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const actions: ActionItem[] = [
  {
    id: "delete-history",
    icon: <Trash2 className="w-4 h-4" />,
    label: "이 영상 시청 기록 삭제",
    description: "YouTube 시청 기록에서 제거합니다",
  },
  {
    id: "block-channel",
    icon: <Ban className="w-4 h-4" />,
    label: "이 채널 차단 (추천 안함)",
    description: "더 이상 추천 피드에 표시되지 않습니다",
  },
  {
    id: "report-video",
    icon: <Flag className="w-4 h-4" />,
    label: "유튜브 허위 정보로 신고",
    description: "YouTube에 콘텐츠 위반 신고를 제출합니다",
  },
];

export function ResponseModal() {
  const { isResponseModalOpen, closeResponseModal } = useCheckmateStore();
  const [selectedActions, setSelectedActions] = useState<string[]>(actions.map((a) => a.id));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const toggleAction = (id: string) => {
    setSelectedActions((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
    // Reset after showing completion
    setTimeout(() => {
      setIsComplete(false);
      closeResponseModal();
    }, 2000);
  };

  if (!isResponseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-pixel">
      <div className="bg-white border-2 border-primary shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={closeResponseModal}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-black transition-colors cursor-pointer rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-blue-50 flex items-center gap-3">
          <PixelOfficer mood={isProcessing ? "alert" : isComplete ? "happy" : "neutral"} size="sm" />
          <div>
            <h3 className="font-bold text-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              보안관 긴급 출동!
            </h3>
            <p className="text-xs text-zinc-500">피해를 최소화하기 위해 액션을 취합니다</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isComplete ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-green-600">완료되었습니다!</p>
              <p className="text-xs text-zinc-500 mt-1">선택한 조치가 모두 처리되었습니다</p>
            </div>
          ) : (
            <>
              {/* Action Items */}
              <div className="space-y-2 mb-4">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    disabled={isProcessing}
                    className={cn(
                      "w-full p-3 border pixel-border flex items-start gap-3 text-left transition-all cursor-pointer disabled:cursor-not-allowed",
                      selectedActions.includes(action.id)
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-zinc-200 hover:bg-zinc-50",
                      isProcessing && "opacity-50",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5",
                        selectedActions.includes(action.id)
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-zinc-400",
                      )}
                    >
                      {selectedActions.includes(action.id) && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <span className="font-medium text-sm">{action.label}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={selectedActions.length === 0 || isProcessing}
                className={cn(
                  "w-full py-3 px-4 font-bold pixel-btn flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed",
                  selectedActions.length === 0 || isProcessing
                    ? "bg-zinc-200 text-zinc-500"
                    : "bg-blue-500 text-white hover:opacity-90",
                )}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>👉 한 번에 해결하기</>
                )}
              </button>

              {/* Cancel */}
              <button
                onClick={closeResponseModal}
                disabled={isProcessing}
                className="w-full py-2 text-sm text-zinc-500 hover:text-black transition-colors mt-2 cursor-pointer disabled:cursor-not-allowed"
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
