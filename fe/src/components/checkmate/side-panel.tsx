import React, { useState } from "react";
import { useCheckmateStore } from "../../lib/store";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { FileText, Users, X, Shield } from "lucide-react";
import { PIXEL_STYLES } from "../../lib/constants/styles";

export function SidePanel() {
  const { activeTab, setActiveTab, closePanel } = useCheckmateStore();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const tabs = [
    { id: "report", label: "리포트", icon: FileText },
    { id: "community", label: "커뮤니티", icon: Users },
  ] as const;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#1e1b4b",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "4px solid #000",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Shield style={{ width: "24px", height: "24px", color: "#60a5fa" }} />
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              letterSpacing: "-0.05em",
              fontFamily: "var(--font-pixel)",
            }}
          >
            CHECKMATE
          </h2>
        </div>
        <button
          onClick={closePanel}
          style={{
            ...PIXEL_STYLES.btnBase,
            padding: "4px",
            backgroundColor: "transparent",
            color: "#94a3b8",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <X style={{ width: "24px", height: "24px" }} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#f8fafc",
          padding: "8px 8px 0 8px",
          gap: "4px",
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "report" | "community")}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                ...PIXEL_STYLES.btnBase,
                flex: 1,
                padding: "12px 8px",
                fontSize: "14px",
                backgroundColor: isActive ? "white" : (isHovered ? "#f1f5f9" : "transparent"),
                color: isActive ? "#1e1b4b" : "#64748b",
                borderBottom: "none",
                position: "relative",
                zIndex: isActive ? 2 : 1,
                boxShadow: isActive 
                  ? "0 -2px 0 0 #000, 2px 0 0 0 #000, -2px 0 0 0 #000" 
                  : "none",
                marginTop: isActive ? "0" : "2px",
              }}
            >
              <Icon
                style={{
                  width: "18px",
                  height: "18px",
                  marginRight: "8px",
                  color: isActive ? "#3b82f6" : "inherit",
                }}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
        }}
        className="custom-scrollbar"
      >
        {activeTab === "report" ? <ReportTab /> : <CommunityTab />}
      </div>
    </div>
  );
}
