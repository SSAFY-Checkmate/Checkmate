import { useState } from "react";
import { useCheckmateStore, type Verdict, type Claim } from "../../lib/store";
import { AlertTriangle, CheckCircle, HelpCircle, ExternalLink } from "lucide-react";
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
  const isWarning = claim.verdict === "warning";
  const borderColor = isWarning ? "#ef4444" : "#0ea5e9";
  const bgColor = isWarning ? "#fef2f2" : "#f0f9ff";
  const textColor = isWarning ? "#991b1b" : "#0f172a";
  const reasonColor = isWarning ? "#b91c1c" : "#334155";

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: bgColor,
        ...PIXEL_STYLES.border,
        border: `3px solid ${borderColor}`,
        boxShadow: isWarning 
          ? "inset 0 0 0 2px rgba(239, 68, 68, 0.2), 0 4px 6px rgba(0,0,0,0.1)"
          : "inset 0 0 0 2px rgba(14, 165, 233, 0.2), 0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "16px",
        fontFamily: "'CheckmatePixel', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: `2px dashed ${borderColor}66`, paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertTriangle size={16} color={isWarning ? "#ef4444" : "#0ea5e9"} />
          <span style={{ fontSize: "14px", fontWeight: "bold", color: borderColor, letterSpacing: "1px" }}>
            의심 문장 발견
          </span>
        </div>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      <div style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.8)", 
        padding: "12px", 
        border: `2px solid ${borderColor}4d`,
        borderRadius: "4px",
        marginBottom: "12px"
      }}>
        <p style={{ 
          fontSize: "15px", 
          fontWeight: "900", 
          color: textColor, 
          margin: 0, 
          lineHeight: "1.5",
          wordBreak: "keep-all"
        }}>
          "{claim.text}"
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <div style={{ 
          backgroundColor: borderColor, 
          color: "white", 
          padding: "4px 6px", 
          fontSize: "11px", 
          fontWeight: "bold",
          marginTop: "2px",
          border: `1px solid ${isWarning ? "#991b1b" : "#0284c7"}`,
          boxShadow: `0 2px 0 ${isWarning ? "#991b1b" : "#0284c7"}`,
          borderRadius: "2px"
        }}>
          AI 판단 근거
        </div>
        <p style={{ 
          flex: 1,
          fontSize: "13px", 
          color: reasonColor, 
          margin: 0, 
          lineHeight: "1.6",
          fontWeight: "bold",
          wordBreak: "keep-all"
        }}>
          {claim.evidence}
        </p>
      </div>

      {claim.sources.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed #cbd5e1" }}>
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
                fontWeight: "bold"
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
  const { trustScore, overallVerdict, summary, claims } = useCheckmateStore();

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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", fontFamily: "'CheckmatePixel', sans-serif" }}>
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

      {/* Summary Area */}
      {summary && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          <h4 style={{ 
            fontSize: "16px", 
            fontWeight: "900", 
            color: "#0ea5e9", 
            margin: 0,
            fontFamily: "'CheckmatePixel', sans-serif",
            letterSpacing: "1px",
            textShadow: "1px 1px 0 rgba(14, 165, 233, 0.2)"
          }}>
            📋 AI 영상 요약
          </h4>
          <div style={{ 
            padding: "16px", 
            backgroundColor: "#f8fafc", 
            ...PIXEL_STYLES.border,
            border: "2px solid #cbd5e1",
            lineHeight: "1.6",
            fontSize: "14px",
            color: "#334155",
            fontFamily: "'CheckmatePixel', sans-serif",
            fontWeight: "bold",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.5)"
          }}>
            {summary}
          </div>
        </div>
      )}

      {/* Claims List Area */}
      {claims.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          <h4 style={{ 
            fontSize: "16px", 
            fontWeight: "900", 
            color: "#ef4444", 
            margin: 0,
            fontFamily: "'CheckmatePixel', sans-serif",
            letterSpacing: "1px",
            textShadow: "1px 1px 0 rgba(239, 68, 68, 0.2)"
          }}>
            🚨 핵심 주장 분석
          </h4>
          {claims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      ) : (
        !summary && (
          <div style={{ 
            padding: "24px", 
            backgroundColor: "#f8fafc", 
            border: "3px dashed #cbd5e1",
            borderRadius: "4px",
            textAlign: "center",
            fontFamily: "'CheckmatePixel', sans-serif",
            marginTop: "8px"
          }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: "1.6", fontWeight: "bold" }}>
              세부 영상 분석 데이터가 없습니다.<br/>
              상단의 <span style={{ color: "#0ea5e9" }}>전체 신뢰도 판별 결과</span>를 참고해 주세요.
            </p>
          </div>
        )
      )}
    </div>
  );
}
