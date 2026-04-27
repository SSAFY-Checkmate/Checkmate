import React, { useState } from "react";
import { useCheckmateStore } from "../../lib/store";
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
    icon: <Trash2 />,
    label: "이 영상 시청 기록 삭제",
    description: "YouTube 시청 기록에서 제거합니다",
  },
  {
    id: "block-channel",
    icon: <Ban />,
    label: "이 채널 차단 (추천 안함)",
    description: "더 이상 추천 피드에 표시되지 않습니다",
  },
  {
    id: "report-video",
    icon: <Flag />,
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        fontFamily: "var(--font-pixel)",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          border: "2px solid #3b82f6",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          maxWidth: "448px",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={closeResponseModal}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            padding: "4px",
            color: "#a1a1aa",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px",
            transition: "color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
        >
          <X style={{ width: "20px", height: "20px" }} />
        </button>

        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e4e4e7",
            backgroundColor: "#eff6ff",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <PixelOfficer mood={isProcessing ? "alert" : isComplete ? "happy" : "neutral"} size="sm" />
          <div>
            <h3 style={{ fontWeight: "bold", color: "black", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Shield style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
              보안관 긴급 출동!
            </h3>
            <p style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>피해를 최소화하기 위해 액션을 취합니다</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "16px" }}>
          {isComplete ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>✅</div>
              <p style={{ fontWeight: "bold", color: "#16a34a", margin: 0 }}>완료되었습니다!</p>
              <p style={{ fontSize: "12px", color: "#71717a", marginTop: "4px", margin: 0 }}>선택한 조치가 모두 처리되었습니다</p>
            </div>
          ) : (
            <>
              {/* Action Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                {actions.map((action) => {
                  const isSelected = selectedActions.includes(action.id);
                  return (
                    <button
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      disabled={isProcessing}
                      className="pixel-border"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid",
                        borderColor: isSelected ? "#3b82f6" : "#e4e4e7",
                        backgroundColor: isSelected ? "#eff6ff" : "white",
                        display: "flex",
                        alignItems: "start",
                        gap: "12px",
                        textAlign: "left",
                        transition: "all 0.2s",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isProcessing) e.currentTarget.style.backgroundColor = "#fafafa";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !isProcessing) e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid",
                          borderColor: isSelected ? "#3b82f6" : "#a1a1aa",
                          backgroundColor: isSelected ? "#3b82f6" : "transparent",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {isSelected && <Check style={{ width: "12px", height: "12px" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "flex", alignItems: "center", width: "16px", height: "16px", color: "#71717a" }}>
                            {action.icon}
                          </span>
                          <span style={{ fontWeight: 500, fontSize: "14px" }}>{action.label}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#71717a", marginTop: "2px", margin: 0 }}>{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={selectedActions.length === 0 || isProcessing}
                className="pixel-btn"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  cursor: (selectedActions.length === 0 || isProcessing) ? "not-allowed" : "pointer",
                  backgroundColor: (selectedActions.length === 0 || isProcessing) ? "#e4e4e7" : "#3b82f6",
                  color: (selectedActions.length === 0 || isProcessing) ? "#71717a" : "white",
                  border: "none",
                }}
              >
                {isProcessing ? (
                  <>
                    <div 
                      style={{ 
                        width: "16px", 
                        height: "16px", 
                        border: "2px solid white", 
                        borderTopColor: "transparent", 
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite" 
                      }} 
                    />
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
                style={{
                  width: "100%",
                  padding: "8px 0",
                  fontSize: "14px",
                  color: "#71717a",
                  backgroundColor: "transparent",
                  border: "none",
                  marginTop: "8px",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.color = "black"; }}
                onMouseLeave={(e) => { if (!isProcessing) e.currentTarget.style.color = "#71717a"; }}
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
