import { useState } from "react";
import { useCheckmateStore, type Verdict, type Claim } from "../../lib/store";
import { AlertTriangle, CheckCircle, HelpCircle, ExternalLink, Shield } from "lucide-react";
import { COLORS, PIXEL_STYLES } from "../../lib/constants/styles";

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    warning: {
      icon: AlertTriangle,
      label: "허위",
      color: COLORS.destructive,
      bgColor: "rgba(239, 68, 68, 0.1)",
    },
    safe: {
      icon: CheckCircle,
      label: "사실",
      color: COLORS.success,
      bgColor: "rgba(34, 197, 94, 0.1)",
    },
    unknown: {
      icon: HelpCircle,
      label: "판단 보류",
      color: COLORS.warning,
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
  };

  const { icon: Icon, label, color, bgColor } = config[verdict];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        fontSize: "12px",
        borderRadius: "4px",
        backgroundColor: bgColor,
        color: color,
        border: `1px solid ${color}4d`, // 4d = 30% opacity
        imageRendering: "pixelated",
      }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function TrustMeter({ score }: { score: number }) {
  const bars = 10;
  const filledBars = Math.round((score / 100) * bars);

  const getBarColor = (i: number) => {
    if (i >= filledBars) return "#e4e4e7"; // bg-muted
    if (score < 30) return COLORS.destructive;
    if (score < 60) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "14px", color: "#64748b" }}>신뢰도:</span>
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "12px",
              height: "16px",
              backgroundColor: getBarColor(i),
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: score < 30 ? COLORS.destructive : score < 60 ? COLORS.warning : COLORS.success,
        }}
      >
        {score}%
      </span>
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "white",
        ...PIXEL_STYLES.border,
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
        <p style={{ fontSize: "14px", fontWeight: "500", color: "black", margin: 0, lineHeight: "1.4" }}>
          {claim.text}
        </p>
        <VerdictBadge verdict={claim.verdict} />
      </div>
      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", lineHeight: "1.5" }}>
        {claim.evidence}
      </p>
      {claim.sources.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {claim.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: COLORS.primary,
                textDecoration: "none",
              }}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} />
              {source.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportTab() {
  const { trustScore, overallVerdict, claims, openResponseModal } = useCheckmateStore();

  const verdictConfig = {
    warning: {
      icon: "🚫",
      label: "허위 정보 주의!",
      bgColor: "rgba(239, 68, 68, 0.1)",
      borderColor: COLORS.destructive,
      textColor: COLORS.destructive,
    },
    safe: {
      icon: "✅",
      label: "신뢰할 수 있는 정보",
      bgColor: "rgba(34, 197, 94, 0.1)",
      borderColor: COLORS.success,
      textColor: COLORS.success,
    },
    unknown: {
      icon: "🧐",
      label: "판단 보류 (추가 검증 필요)",
      bgColor: "rgba(245, 158, 11, 0.1)",
      borderColor: COLORS.warning,
      textColor: COLORS.warning,
    },
  };

  const { icon, label, bgColor, borderColor, textColor } = verdictConfig[overallVerdict];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
      {/* Overall Verdict Card */}
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          backgroundColor: bgColor,
          border: `2px solid ${borderColor}`,
          ...PIXEL_STYLES.border,
          boxShadow: `inset 0 0 0 2px ${bgColor}, ${PIXEL_STYLES.border.boxShadow.trim()}`,
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "4px" }}>{icon}</div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: textColor, margin: "0 0 8px 0" }}>{label}</h3>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrustMeter score={trustScore} />
        </div>
      </div>

      {/* Claims List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#64748b", margin: 0 }}>
          핵심 주장 분석
        </h4>
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>

      {/* Response Action Button */}
      <button
        onClick={openResponseModal}
        style={{
          ...PIXEL_STYLES.btnBase,
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        <Shield size={20} />
        🚨 원터치 팩트체크 대응
      </button>
    </div>
  );
}
