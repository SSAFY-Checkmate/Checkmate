import { useCheckmateStore } from "../../lib/store";
import { X, FileText, Users, Play } from "lucide-react";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { ResponseModal } from "./response-modal";
import { COLORS, PIXEL_STYLES } from "../../lib/constants/styles";

export function SidePanel() {
  const { 
    activeTab, 
    setActiveTab,
    videoTitle,
    channelName,
    closePanel
  } = useCheckmateStore();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        fontFamily: "'DungGeunMo', monospace",
      }}
    >
      {/* Video Info Header */}
      <div
        style={{
          padding: "12px", // p-3
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: "rgba(241, 245, 249, 0.5)", // bg-muted/50
          display: "flex",
          alignItems: "center",
          gap: "12px", // gap-3
        }}
      >
        <div
          style={{
            width: "64px", // w-16
            height: "48px", // h-12
            backgroundColor: "#f1f5f9",
            ...PIXEL_STYLES.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Play style={{ width: "24px", height: "24px", color: "#64748b" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "black",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {videoTitle || "영상 제목이 없습니다"}
          </p>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            {channelName || "채널 정보 없음"}
          </p>
        </div>
      </div>

      {/* Tab Menu */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}` }}>
        <button
          onClick={() => setActiveTab("report")}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeTab === "report" ? COLORS.primary : "#f1f5f9",
            color: activeTab === "report" ? "white" : "#64748b",
          }}
        >
          <FileText size={16} />
          📊 리포트
        </button>
        <button
          onClick={() => setActiveTab("community")}
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: activeTab === "community" ? COLORS.primary : "#f1f5f9",
            color: activeTab === "community" ? "white" : "#64748b",
          }}
        >
          <Users size={16} />
          🤝 커뮤니티
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "report" ? <ReportTab /> : <CommunityTab />}
      </div>
    </div>
  );
}
