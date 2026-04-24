import { useCheckmateStore, type Verdict, type Claim } from "../../lib/store";
import { AlertTriangle, CheckCircle, HelpCircle, ExternalLink } from "lucide-react";

/**
 * 판단 배지 컴포넌트 (사실/허위/보류)
 */
function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    warning: {
      icon: AlertTriangle,
      label: "허위",
      style: { backgroundColor: "#fef2f2", color: "#ef4444", border: "1.5px solid #ef4444" },
    },
    safe: {
      icon: CheckCircle,
      label: "사실",
      style: { backgroundColor: "#e6f4ea", color: "#1e8e3e", border: "1.5px solid #1e8e3e" },
    },
    unknown: {
      icon: HelpCircle,
      label: "보류",
      style: { backgroundColor: "#fffbeb", color: "#d97706", border: "1.5px solid #d97706" },
    },
  };

  const { icon: Icon, label, style } = config[verdict];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: "bold",
        borderRadius: "2px",
        ...style,
      }}
      className="pixel-border"
    >
      <Icon style={{ width: "14px", height: "14px" }} strokeWidth={3} />
      {label}
    </span>
  );
}

function TrustMeter({ score }: { score: number }) {
  const bars = 10;
  const filledBars = Math.round((score / 100) * bars);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "14px", color: "#1e8e3e", fontWeight: "bold" }}>신뢰도:</span>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "18px",
              height: "18px",
              border: "1.5px solid rgba(0, 0, 0, 0.1)",
              backgroundColor:
                i < filledBars ? (score < 30 ? "#ef4444" : score < 60 ? "#f59e0b" : "#22c55e") : "#e5e7eb",
            }}
            className="pixel-border"
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "15px",
          fontWeight: "900",
          marginLeft: "4px",
          letterSpacing: "-0.025em",
          color: score < 30 ? "#ef4444" : score < 60 ? "#d97706" : "#22c55e",
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
        padding: "15px",
        border: "2.5px solid #e2e8f0",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
      className="pixel-border"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: "bold", color: "black", margin: 0, lineHeight: 1.25 }}>
          영상 내 주요 사실 정보 일치율
        </p>
        <VerdictBadge verdict={claim.verdict} />
      </div>
      <p
        style={{
          fontSize: "12px",
          color: "#52525b",
          marginBottom: "16px",
          margin: 0,
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {claim.evidence}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "4px" }}>
        <a
          href={claim.sources?.[0]?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "#2563eb",
            fontWeight: "bold",
            textDecoration: "none",
          }}
          className="hover:underline"
        >
          <ExternalLink style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />
          검증된 기사
        </a>
      </div>
    </div>
  );
}

export function ReportTab() {
  const { trustScore, overallVerdict, claims } = useCheckmateStore();

  const verdictConfig = {
    warning: {
      icon: "🚫",
      label: "허위 정보 주의!",
      cardStyle: { backgroundColor: "#fef2f2", border: "3.5px solid #ef4444", color: "#ef4444" },
      iconBg: { backgroundColor: "#ef4444", border: "2px solid #b91c1c" },
    },
    safe: {
      icon: <CheckCircle style={{ width: "40px", height: "40px", color: "white" }} strokeWidth={3} />,
      label: "신뢰할 수 있는 정보",
      cardStyle: { backgroundColor: "#ecf7ed", border: "3.5px solid #22c55e", color: "#1e8e3e" },
      iconBg: { backgroundColor: "#22c55e", border: "2px solid #166534" },
    },
    unknown: {
      icon: "🧐",
      label: "판단 보류 (추가 검증 필요)",
      cardStyle: { backgroundColor: "#fffbeb", border: "3.5px solid #f59e0b", color: "#d97706" },
      iconBg: { backgroundColor: "#f59e0b", border: "2px solid #b45309" },
    },
  };

  const { icon, label, cardStyle, iconBg } = verdictConfig[overallVerdict] || verdictConfig.unknown;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px", paddingBottom: "112px" }}>
      {/* Overall Verdict Card */}
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          ...cardStyle,
        }}
        className="pixel-border"
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            ...iconBg,
          }}
          className="pixel-border"
        >
          {typeof icon === "string" ? <span style={{ fontSize: "24px" }}>{icon}</span> : icon}
        </div>
        <h3 style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-0.05em", margin: 0, lineHeight: 1 }}>
          {label}
        </h3>
        <div style={{ marginTop: "4px", width: "100%", display: "flex", justifyContent: "center" }}>
          <TrustMeter score={trustScore} />
        </div>
      </div>

      {/* Claims List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#71717a", margin: 0, paddingLeft: "4px" }}>
          핵심 주장 분석
        </h4>
        {claims.length > 0 ? (
          claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#a1a1aa",
              fontSize: "13px",
              border: "2px dashed #e2e8f0",
            }}
            className="pixel-border"
          >
            분석된 핵심 주장이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
