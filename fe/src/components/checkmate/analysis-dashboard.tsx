import React, { useState, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { SidePanel } from "./side-panel";
import { ResponseModal } from "./response-modal";
import { X, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { PixelOfficer } from "./pixel-character";
import { PIXEL_STYLES } from "../../lib/constants/styles";

export function AnalysisDashboard() {
  const { analysisStatus, overallVerdict, trustScore, isPanelOpen, openPanel, closePanel } =
    useCheckmateStore();
  const [showPopup, setShowPopup] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isDetailBtnHovered, setIsDetailBtnHovered] = useState(false);
  const [isDetailBtnPressed, setIsDetailBtnPressed] = useState(false);

  useEffect(() => {
    if (analysisStatus === "complete" && overallVerdict === "warning") {
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [analysisStatus, overallVerdict]);

  if (!isPanelOpen) {
    const warningConfig = {
      warning: { color: "#ef4444", icon: AlertTriangle, label: "허위 의심" },
      safe: { color: "#22c55e", icon: ShieldCheck, label: "안전" },
      unknown: { color: "#f59e0b", icon: HelpCircle, label: "검증 중" },
    };

    const currentConfig = warningConfig[overallVerdict] || warningConfig.unknown;
    const Icon = currentConfig.icon;

    return (
      <>
        {showPopup && (
          <div
            style={{
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "280px",
              backgroundColor: "white",
              ...PIXEL_STYLES.border,
              padding: "16px",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                color: "#a1a1aa",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...PIXEL_STYLES.border,
                }}
              >
                <AlertTriangle style={{ width: "24px", height: "24px", color: "#ef4444" }} />
              </div>
              <div>
                <p style={{ fontWeight: "bold", color: "#ef4444", fontSize: "14px", margin: 0 }}>허위 정보 감지!</p>
                <p style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>이 영상은 주의가 필요합니다.</p>
              </div>
            </div>
            <button
              onClick={openPanel}
              onMouseEnter={() => setIsDetailBtnHovered(true)}
              onMouseLeave={() => { setIsDetailBtnHovered(false); setIsDetailBtnPressed(false); }}
              onMouseDown={() => setIsDetailBtnPressed(true)}
              onMouseUp={() => setIsDetailBtnPressed(false)}
              style={{
                ...PIXEL_STYLES.btnBase,
                width: "100%",
                padding: "8px",
                fontSize: "13px",
                backgroundColor: "#ef4444",
                color: "white",
                boxShadow: isDetailBtnPressed ? PIXEL_STYLES.btnShadow.active : (isDetailBtnHovered ? PIXEL_STYLES.btnShadow.hover : PIXEL_STYLES.btnShadow.default),
                transform: isDetailBtnPressed ? "translate(2px, 2px)" : "none",
              }}
            >
              상세 리포트 보기
            </button>
          </div>
        )}

        {/* Floating Mini Toggle */}
        <button
          onClick={openPanel}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            ...PIXEL_STYLES.border,
            backgroundColor: "white",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 40,
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <PixelOfficer mood={overallVerdict === "warning" ? "alert" : "neutral"} size="sm" />
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon style={{ width: "14px", height: "14px", color: currentConfig.color }} />
              <span style={{ fontSize: "12px", fontWeight: "bold", color: currentConfig.color }}>
                {currentConfig.label}
              </span>
            </div>
            <div style={{ width: "80px", height: "6px", backgroundColor: "#f3f4f6", marginTop: "4px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${trustScore}%`,
                  backgroundColor: currentConfig.color,
                  transition: "width 1s ease-in-out",
                }}
              />
            </div>
          </div>
        </button>
      </>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        height: "100vh",
        backgroundColor: "white",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      <SidePanel />
      <ResponseModal />

      {/* Floating Close Button for Dashboard */}
      <button
        onClick={closePanel}
        style={{
          position: "absolute",
          top: "20px",
          left: "-50px",
          width: "40px",
          height: "40px",
          backgroundColor: isCloseHovered ? "#ef4444" : "white",
          ...PIXEL_STYLES.border,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          color: isCloseHovered ? "white" : "black",
        }}
        onMouseEnter={() => setIsCloseHovered(true)}
        onMouseLeave={() => setIsCloseHovered(false)}
      >
        <X style={{ width: "24px", height: "24px" }} />
      </button>
    </div>
  );
}
