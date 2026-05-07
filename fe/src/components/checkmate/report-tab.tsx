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
        border: `1px solid ${color}4d`,
        imageRendering: "pixelated",
      }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

export function TrustMeter({ score }: { score: number }) {
  const bars = 10;
  const filledBars = Math.round((score / 100) * bars);

  const getBarColor = (i: number) => {
    if (i >= filledBars) return "#cbd5e1";
    if (score < 30) return COLORS.destructive;
    if (score < 60) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
        maxWidth: "240px",
        padding: "10px",
        backgroundColor: "#f8fafc",
        border: "2px solid #94a3b8",
        borderRadius: "4px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: "900", color: "#475569", letterSpacing: "1px" }}>수사 신뢰도</span>
        <span
          style={{
            fontSize: "16px",
            fontWeight: "900",
            color: score < 30 ? COLORS.destructive : score < 60 ? COLORS.warning : COLORS.success,
          }}
        >
          {score}%
        </span>
      </div>
      <div style={{ display: "flex", gap: "4px", height: "12px" }}>
        {[...Array(bars)].map((_, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: getBarColor(i), borderRadius: "1px" }} />
        ))}
      </div>
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  // 전용 데이터 파서 함수
  const parseEvidence = (text: string) => {
    const cleanText = text.replace(/\*\*/g, "").replace(/^-\s*/, "").trim();

    const parts = {
      original: claim.text,
      translatedClaim: "",
      verdict: claim.verdict,
      verdictText: "", // AI가 보낸 원본 판정 문구 저장
      explanation: "",
    };

    const claimIdx = cleanText.indexOf("[주장]");
    const verdictIdx = cleanText.indexOf("[판정]");
    const explanationIdx = cleanText.indexOf("[설명]");

    if (claimIdx !== -1) {
      const endIdx = verdictIdx !== -1 ? verdictIdx : explanationIdx !== -1 ? explanationIdx : cleanText.length;
      parts.translatedClaim = cleanText.substring(claimIdx + 4, endIdx).trim();
    }

    if (explanationIdx !== -1) {
      parts.explanation = cleanText.substring(explanationIdx + 4).trim();
    } else {
      parts.explanation = cleanText;
    }

    if (verdictIdx !== -1) {
      const vText = cleanText
        .substring(verdictIdx + 4, explanationIdx !== -1 ? explanationIdx : cleanText.length)
        .trim();
      parts.verdictText = vText; // 원본 문구 보관

      const upperV = vText.toUpperCase();
      // 위험/허위 판별
      if (
        upperV.includes("WARNING") ||
        upperV.includes("DANGER") ||
        upperV.includes("FALSE") ||
        upperV.includes("MISINFORMATION") ||
        upperV.includes("FAKE")
      ) {
        parts.verdict = "warning";
      }
      // 안전/사실 판별
      else if (
        upperV.includes("SAFE") ||
        upperV.includes("GOOD") ||
        upperV.includes("TRUE") ||
        upperV.includes("FACT") ||
        upperV.includes("VALID")
      ) {
        parts.verdict = "safe";
      }
      // 보류 판별
      else if (upperV.includes("NOT_ENOUGH") || upperV.includes("UNKNOWN") || upperV.includes("PENDING")) {
        parts.verdict = "unknown";
      }
    }

    // [지능형 보정] 설명 내용에 "사실로 확인", "사실입니다" 등이 포함되어 있으면 safe로 판단
    if (
      parts.explanation.includes("사실로 확인") ||
      parts.explanation.includes("사실입니다") ||
      parts.explanation.includes("신뢰할 수 있")
    ) {
      parts.verdict = "safe";
    } else if (
      parts.explanation.includes("허위로 확인") ||
      parts.explanation.includes("거짓입니다") ||
      parts.explanation.includes("왜곡된")
    ) {
      parts.verdict = "warning";
    }

    return parts;
  };

  const parsed = parseEvidence(claim.evidence);
  const isWarning = parsed.verdict === "warning";
  const isUnknown = parsed.verdict === "unknown";

  const theme = isWarning
    ? { border: "#ef4444", bg: "rgba(254, 242, 242, 0.98)", label: "#b91c1c" } // 빨강, 진한 빨강
    : isUnknown
      ? { border: "#f59e0b", bg: "rgba(255, 251, 235, 0.98)", label: "#b45309" } // 주황, 진한 주황
      : { border: "#10b981", bg: "rgba(240, 253, 244, 0.98)", label: "#047857" }; // 초록, 진한 초록

  // 공통 라벨 스타일
  const labelStyle = (color: string) => ({
    backgroundColor: color,
    color: "#fff",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "bold",
    borderRadius: "2px",
    display: "inline-block",
    marginBottom: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  });

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        padding: "20px",
        border: `2px solid ${theme.border}`,
        borderRadius: "8px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        boxShadow: `0 4px 15px ${theme.border}15`,
      }}
    >
      {/* 1. 원문 섹션 */}
      <div>
        <span style={labelStyle("#475569")}>원문</span>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "12px 14px",
            borderLeft: `4px solid ${theme.border}44`,
            borderRadius: "4px",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: "bold", color: "#475569", margin: 0, lineHeight: "1.6" }}>
            {parsed.original}
          </p>
        </div>
      </div>

      <div style={{ width: "100%", height: "1px", backgroundColor: `${theme.border}22` }}></div>

      {/* 2. 주장 섹션 */}
      <div>
        <span style={labelStyle(theme.border)}>주장</span>
        <p style={{ fontSize: "16px", fontWeight: "900", color: "#1e293b", margin: "4px 0 0 4px", lineHeight: "1.5" }}>
          {parsed.translatedClaim}
        </p>
      </div>

      {/* 3. 판정 섹션 */}
      <div
        style={{
          padding: "12px 0",
          borderTop: `1px dashed ${theme.border}33`,
          borderBottom: `1px dashed ${theme.border}33`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ ...labelStyle(theme.label), marginBottom: 0 }}>판정</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <VerdictBadge verdict={parsed.verdict} />
          {parsed.verdictText && (
            <span style={{ fontSize: "12px", color: theme.label, fontStyle: "italic", fontWeight: "bold" }}>
              ({parsed.verdictText})
            </span>
          )}
        </div>
      </div>

      {/* 4. 설명 섹션 */}
      <div>
        <span style={labelStyle("#475569")}>설명</span>
        <p
          style={{
            fontSize: "14px",
            color: "#334155",
            margin: 0,
            lineHeight: "1.8",
            fontWeight: "bold",
            wordBreak: "keep-all",
          }}
        >
          {parsed.explanation}
        </p>
      </div>

      {/* 출처 */}
      {claim.sources.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "4px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
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
                fontWeight: "bold",
              }}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} /> {source.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportTabProps {
  isCompact?: boolean;
}

export function ReportTab({ isCompact = false }: ReportTabProps) {
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

  const currentVerdict = verdictConfig[overallVerdict];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: isCompact ? "4px" : "16px",
        fontFamily: "'CheckmatePixel', sans-serif",
      }}
    >
      {/* 롱폼에서만 보여주는 전체 결과 카드 */}
      {!isCompact && (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            backgroundColor: currentVerdict.bgColor,
            border: `2px solid ${currentVerdict.borderColor}`,
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "4px" }}>{currentVerdict.icon}</div>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: currentVerdict.textColor, margin: "0 0 8px 0" }}>
            {currentVerdict.label}
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <TrustMeter score={trustScore} />
          </div>
        </div>
      )}

      {/* 요약 섹션 (롱폼에서만 혹은 데이터가 있을 때) */}
      {!isCompact && summary && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#0ea5e9", margin: 0 }}>📋 AI 영상 요약</h4>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              border: "2px solid #cbd5e1",
              fontSize: "14px",
              color: "#334155",
              fontWeight: "bold",
              lineHeight: "1.6",
            }}
          >
            {summary}
          </div>
        </div>
      )}

      {/* 증거 목록 (공통) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {!isCompact && claims.length > 0 && (
          <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#ef4444", margin: 0 }}>🚨 핵심 주장 분석</h4>
        )}
        {claims && claims.length > 0 ? (
          claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        ) : (
          <div
            style={{
              padding: "32px 16px",
              backgroundColor: "rgba(15, 23, 42, 0.1)",
              border: "2px dashed rgba(0,0,0,0.1)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontWeight: "bold" }}>
              본문에서 발견된 결정적 증거가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
