import { useCheckmateStore } from "../../lib/store";
import { FileText, Users } from "lucide-react";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";


export function SidePanel() {
  const { 
    activeTab, 
    setActiveTab,
  } = useCheckmateStore();

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
      {/* Tab Menu */}
      <div style={{ display: "flex", backgroundColor: "#e2e8f0", padding: "8px", gap: "8px", borderBottom: "4px solid #cbd5e1" }}>
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.1s",
            fontFamily: "'CheckmatePixel', sans-serif",
            backgroundColor: activeTab === "report" ? "#0ea5e9" : "#cbd5e1",
            color: activeTab === "report" ? "white" : "#64748b",
            border: activeTab === "report" ? "2px solid #0284c7" : "2px solid #94a3b8",
            boxShadow: activeTab === "report" ? "0 4px 0 #0369a1" : "none",
            borderRadius: "4px",
            transform: activeTab === "report" ? "translateY(-2px)" : "none",
          }}
        >
          <FileText size={18} />
          리포트
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("community")}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            transition: "all 0.1s",
            fontFamily: "'CheckmatePixel', sans-serif",
            backgroundColor: activeTab === "community" ? "#0ea5e9" : "#cbd5e1",
            color: activeTab === "community" ? "white" : "#64748b",
            border: activeTab === "community" ? "2px solid #0284c7" : "2px solid #94a3b8",
            boxShadow: activeTab === "community" ? "0 4px 0 #0369a1" : "none",
            borderRadius: "4px",
            transform: activeTab === "community" ? "translateY(-2px)" : "none",
          }}
        >
          <Users size={18} />
          커뮤니티
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "report" ? <ReportTab /> : <CommunityTab />}
      </div>
    </div>
  );
}
