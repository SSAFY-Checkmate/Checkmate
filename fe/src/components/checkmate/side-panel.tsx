import { useCheckmateStore } from "../../lib/store";
import { cn } from "../../lib/utils";
import { X, FileText, Users, Play } from "lucide-react";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { ResponseModal } from "./response-modal";

export function SidePanel() {
  const { isPanelOpen, closePanel, activeTab, setActiveTab, videoTitle, channelName } = useCheckmateStore();

  if (!isPanelOpen) return null;

  // 인라인 스타일 정의 (Shadow DOM 안정성 및 유지보수 용이성)
  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: "56px",
    right: 0,
    width: "380px",
    height: "calc(100vh - 56px)",
    backgroundColor: "white",
    borderLeft: "3.5px solid #006edc",
    boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    zIndex: 2147483647,
  };

  const closeBtnStyle: React.CSSProperties = {
    position: "absolute",
    left: "-44px",
    top: "16px",
    width: "42px",
    height: "42px",
    backgroundColor: "white",
    border: "3.5px solid #006edc",
    color: "#006edc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2147483647,
  };

  const getTabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    transition: "all 0.2s ease",
    border: "none",
    backgroundColor: isActive ? "#006edc" : "#e8f0f8",
    color: isActive ? "white" : "#4b5563",
  });

  return (
    <>
      <div 
        style={{ 
          ...sidebarStyle, 
          fontFamily: "var(--font-pixel)" 
        }} 
        className="animate-in slide-in-from-right duration-300"
      >
        
        {/* Floating Close Button */}
        <button
          onClick={closePanel}
          style={closeBtnStyle}
          className="pixel-btn transition-all active:scale-95"
          title="닫기"
        >
          <X style={{ width: "28px", height: "28px" }} strokeWidth={4} />
        </button>

        {/* Video Info Header */}
        <div 
          style={{ 
            padding: "16px", 
            borderBottom: "2.5px solid #e2e8f0", 
            backgroundColor: "#f8fafc", 
            display: "flex", 
            alignItems: "center", 
            gap: "12px" 
          }}
        >
          <div 
            style={{ 
              width: "64px", 
              height: "48px", 
              backgroundColor: "#e2e8f0", 
              border: "2.5px solid #cbd5e1", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexShrink: 0 
            }}
          >
            <Play style={{ width: "32px", height: "32px", color: "#a1a1aa", fill: "#a1a1aa" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontWeight: "bold", color: "black", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {videoTitle || "영상을 선택하세요"}
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", margin: 0 }}>
              {channelName || "채널 정보 없음"}
            </p>
          </div>
        </div>

        {/* Tab Menu */}
        <div style={{ display: "flex", borderBottom: "2.5px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("report")}
            style={{ ...getTabStyle(activeTab === "report"), borderRight: "1px solid #e2e8f0" }}
            className="pixel-btn"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <FileText style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "18px" }}>📊</span>
            </div>
            리포트
          </button>
          <button
            onClick={() => setActiveTab("community")}
            style={getTabStyle(activeTab === "community")}
            className="pixel-btn"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Users style={{ width: "20px", height: "20px" }} />
              <span style={{ fontSize: "18px" }}>🤝</span>
            </div>
            커뮤니티
          </button>
        </div>

        {/* Tab Content */}
        <div 
          style={{ flex: 1, overflowY: "auto" }} 
          className="custom-scrollbar"
        >
          {activeTab === "report" ? <ReportTab /> : <CommunityTab />}
        </div>
      </div>

      <ResponseModal />
    </>
  );
}
