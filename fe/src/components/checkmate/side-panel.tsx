import { useCheckmateStore } from "../../lib/store";
import { FileText, Users } from "lucide-react";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";

const TAB_STYLE_BASE = {
  flex: 1,
  padding: "12px",
  fontSize: "15px",
  fontWeight: "900",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontFamily: "'CheckmatePixel', sans-serif",
  border: "none",
  borderRadius: "8px",
} as const;

export function SidePanel() {
  const { activeTab, setActiveTab } = useCheckmateStore();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
        fontFamily: "'CheckmatePixel', sans-serif",
      }}
    >
      {/* Premium Bright Tab Menu */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#f1f5f9",
          padding: "10px",
          gap: "10px",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <button
          type="button"
          aria-pressed={activeTab === "report"}
          onClick={() => setActiveTab("report")}
          style={{
            ...TAB_STYLE_BASE,
            background: activeTab === "report" ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "transparent",
            color: activeTab === "report" ? "white" : "#64748b",
            boxShadow:
              activeTab === "report"
                ? "0 4px 12px rgba(14, 165, 233, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)"
                : "none",
          }}
        >
          <FileText
            size={18}
            style={{ filter: activeTab === "report" ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none" }}
          />
          수사 리포트
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "community"}
          onClick={() => setActiveTab("community")}
          style={{
            ...TAB_STYLE_BASE,
            background: activeTab === "community" ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "transparent",
            color: activeTab === "community" ? "white" : "#64748b",
            boxShadow:
              activeTab === "community"
                ? "0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)"
                : "none",
          }}
        >
          <Users
            size={18}
            style={{ filter: activeTab === "community" ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))" : "none" }}
          />
          커뮤니티
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto", backgroundColor: "white" }}>
        {activeTab === "report" ? <ReportTab isCompact={true} /> : <CommunityTab />}
      </div>
    </div>
  );
}
