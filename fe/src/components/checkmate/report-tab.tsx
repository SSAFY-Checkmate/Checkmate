import { useCheckmateStore, type Verdict, type Claim } from "../../lib/store";
import { OneTouchReportButton } from "./one-touch-report-button";
import { AlertTriangle, CheckCircle, HelpCircle, FileSearch, ShieldCheck, Fingerprint } from "lucide-react";
import { formatTime } from "../../lib/utils/time";
import { FormattedExplanation } from "./formatted-explanation";

const pixelFont = "'CheckmatePixel', sans-serif";
const mainFont = "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif";

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    warning: {
      icon: AlertTriangle,
      label: "허위 정보",
      color: "#ef4444",
      bgColor: "#ffffff",
    },
    safe: {
      icon: CheckCircle,
      label: "사실 확인",
      color: "#10b981",
      bgColor: "#ffffff",
    },
    unknown: {
      icon: HelpCircle,
      label: "판단 보류",
      color: "#f59e0b",
      bgColor: "#ffffff",
    },
  };

  const { icon: Icon, label, color, bgColor } = config[verdict];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        fontSize: "11px",
        fontWeight: "900",
        borderRadius: "20px",
        backgroundColor: bgColor,
        color: color,
        border: `1.5px solid ${color}`,
        boxShadow: `0 2px 4px ${color}22`,
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
    if (score < 30) return "#ef4444";
    if (score < 60) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        padding: "14px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(4px)",
        border: "1.5px solid #e2e8f0",
        borderRadius: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "900", color: "#64748b", letterSpacing: "0.5px" }}>
          영상 신뢰지수
        </span>
        <span
          style={{
            fontSize: "18px",
            fontWeight: "900",
            color: score < 30 ? "#ef4444" : score < 60 ? "#f59e0b" : "#10b981",
          }}
        >
          {score}%
        </span>
      </div>
      <div style={{ display: "flex", gap: "4px", height: "12px" }}>
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: getBarColor(i),
              borderRadius: "2px",
              boxShadow: i < filledBars ? "inset 0 1px 1px rgba(255,255,255,0.4)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ClaimCard({ claim, index }: { claim: Claim; index: number }) {
  const parseEvidence = (text: string) => {
    const cleanText = text.replace(/\*\*/g, "").replace(/^-\s*/, "").trim();

    const parts = {
      original: claim.text,
      translatedClaim: "",
      verdict: claim.verdict,
      verdictText: "",
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
      parts.verdictText = vText;
    }

    return parts;
  };

  const parsed = parseEvidence(claim.evidence);
  const isWarning = parsed.verdict === "warning";
  const isUnknown = parsed.verdict === "unknown";

  const theme = isWarning
    ? { border: "#ef4444", bg: "#fff", accent: "#fff1f2", label: "#ef4444", shadow: "rgba(239, 68, 68, 0.08)" }
    : isUnknown
      ? { border: "#f59e0b", bg: "#fff", accent: "#fffbeb", label: "#f59e0b", shadow: "rgba(245, 158, 11, 0.08)" }
      : { border: "#10b981", bg: "#fff", accent: "#f0fdf4", label: "#10b981", shadow: "rgba(16, 185, 129, 0.08)" };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: `1.5px solid #e2e8f0`,
        borderRadius: "16px",
        marginBottom: "24px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: `0 10px 25px -5px ${theme.shadow}, 0 8px 10px -6px rgba(0,0,0,0.01)`,
      }}
    >
      {/* Evidence Header with Point Color */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          backgroundColor: theme.accent,
          borderBottom: `1.5px solid ${theme.border}22`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              backgroundColor: theme.border,
              color: "white",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "900",
              borderRadius: "8px",
            }}
          >
            {index + 1}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "900", color: "#1e293b", letterSpacing: "-0.2px" }}>
            증거물 정밀 판독
          </span>
        </div>
        <VerdictBadge verdict={parsed.verdict} />
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
        {/* Raw Data Section */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              paddingLeft: "4px",
            }}
          >
            <FileSearch size={16} color="#475569" />
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#475569", letterSpacing: "0.5px" }}>
              수집된 원본 데이터 (RAW DATA)
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#f1f5f9",
              padding: "18px 22px",
              borderRadius: "12px",
              borderLeft: "5px solid #cbd5e1",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: "#1e293b", // 더 짙은 색상
                fontWeight: "600", // Semi-bold
                lineHeight: "1.6",
                margin: 0,
                fontStyle: "italic",
                wordBreak: "break-all",
              }}
            >
              "{parsed.original}"
            </p>
          </div>
        </div>

        {/* Verdict Section */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
              paddingLeft: "4px",
            }}
          >
            <Fingerprint size={16} color={theme.border} />
            <span style={{ fontSize: "14px", fontWeight: "900", color: "#1e293b", letterSpacing: "0.5px" }}>
              분석관 최종 소견
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px 24px",
              borderRadius: "12px",
              border: "1.5px solid #f1f5f9",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                color: "#1e293b",
                margin: 0,
                lineHeight: "1.8",
                fontWeight: "600",
                wordBreak: "keep-all",
                fontFamily: mainFont,
              }}
            >
              <FormattedExplanation text={parsed.explanation} mainFont={mainFont} />
            </div>
          </div>
        </div>

        {/* Sources & Metadata - Bottom Area */}
        {/* <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px",
          }}
        >
          {claim.sources.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {claim.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    backgroundColor: "white",
                    padding: "5px 12px",
                    borderRadius: "30px",
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s",
                  }}
                >
                  <ExternalLink size={10} /> {source.label}
                </a>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

interface ReportTabProps {
  isCompact?: boolean;
}

export function ReportTab({ isCompact = false }: ReportTabProps) {
  const { trustScore, overallVerdict, claims, analysisScope } = useCheckmateStore();

  const verdictConfig = {
    warning: {
      title: "허위 정보 주의",
      color: "#ef4444",
      bg: "linear-gradient(135deg, #ef4444, #b91c1c)",
      lightBg: "#fff1f2",
      icon: AlertTriangle,
    },
    safe: {
      title: "신뢰할 수 있는 정보",
      color: "#10b981",
      bg: "linear-gradient(135deg, #10b981, #059669)",
      lightBg: "#f0fdf4",
      icon: ShieldCheck,
    },
    unknown: {
      title: "추가 검증 권고",
      color: "#f59e0b",
      bg: "linear-gradient(135deg, #f59e0b, #d97706)",
      lightBg: "#fffbeb",
      icon: HelpCircle,
    },
  };

  const current = verdictConfig[overallVerdict];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: isCompact ? "12px" : "24px",
        backgroundColor: "#f1f5f9", // 전체 배경에 슬레이트 톤을 주어 카드들을 띄움
        minHeight: "100%",
        fontFamily: mainFont,
      }}
    >
      {/* [신규] 상세 패널(isCompact)용 수사 범위 표시 영역 */}
      {isCompact && analysisScope && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1.5px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSearch size={14} color="#64748b" />
            <span style={{ fontSize: "12px", fontWeight: "900", color: "#64748b" }}>수사 범위</span>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#0ea5e9",
              backgroundColor: "#f0f9ff",
              padding: "2px 8px",
              borderRadius: "20px",
              border: "1px solid #bae6fd",
              fontFamily: pixelFont,
            }}
          >
            {analysisScope.type === "full"
              ? "전체 영상"
              : analysisScope.type === "at"
                ? `${formatTime(analysisScope.at || 0)} 지점`
                : `${formatTime(analysisScope.start || 0)} ~ ${formatTime(analysisScope.end || 0)}`}
          </span>
        </div>
      )}

      {/* Official Top Summary Card - 롱폼 상세 페이지에서만 노출 */}
      {!isCompact && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 15px 35px -5px rgba(0,0,0,0.05), 0 10px 15px -10px rgba(0,0,0,0.03)",
            border: "1px solid rgba(255,255,255,0.8)",
            marginBottom: "8px",
          }}
        >
          {/* Gradient Header Area */}
          <div
            style={{
              background: current.bg,
              padding: "30px 24px",
              textAlign: "center",
              color: "white",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.1,
              }}
            >
              <current.icon size={160} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    padding: "5px 14px",
                    fontSize: "11px",
                    fontWeight: "900",
                    borderRadius: "30px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    letterSpacing: "1.5px",
                    fontFamily: pixelFont,
                  }}
                >
                  CHECKMATE OFFICIAL REPORT
                </span>

                {analysisScope && (
                  <span
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      padding: "5px 14px",
                      fontSize: "11px",
                      fontWeight: "900",
                      borderRadius: "30px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FileSearch size={12} />
                    범위:{" "}
                    {analysisScope.type === "full"
                      ? "전체 영상"
                      : analysisScope.type === "at"
                        ? `${formatTime(analysisScope.at || 0)} 지점`
                        : `${formatTime(analysisScope.start || 0)} ~ ${formatTime(analysisScope.end || 0)}`}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "-0.8px", fontFamily: pixelFont }}>
                {current.title}
              </h2>
              <p style={{ fontSize: "12px", opacity: 0.8, fontWeight: "bold", fontFamily: pixelFont }}>
                영상 분석 일련번호: CM-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>

          {/* White Summary Area (TrustMeter only for Long-form) */}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <TrustMeter score={trustScore} />
            </div>
          </div>
        </div>
      )}

      {/* Claims Section - 핵심 증거 분석 자료 */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            padding: "0 6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "6px", height: "18px", backgroundColor: "#1e293b", borderRadius: "10px" }} />
            <h4 style={{ fontSize: "17px", fontWeight: "900", color: "#1e293b", margin: 0 }}>정밀 증거 판독 자료</h4>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>총 {claims.length}건</span>
        </div>

        {claims && claims.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {claims.map((claim, idx) => (
              <ClaimCard key={claim.id} claim={claim} index={idx} />
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "60px 24px",
              backgroundColor: "white",
              border: "2px dashed #cbd5e1",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
            }}
          >
            <HelpCircle size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
            <p style={{ margin: 0, fontSize: "15px", color: "#64748b", fontWeight: "bold" }}>
              발견된 결정적 증거물이 없습니다.
            </p>
          </div>
        )}

        {/* 리포트 기반 원터치 신고 버튼 (Siren Bar) */}
        <OneTouchReportButton />
      </section>

      {/* Footer Info */}
      <div style={{ textAlign: "center", padding: "10px 0 5px 0" }}>
        <p style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.6", fontWeight: "bold" }}>
          본 리포트는 Checkmate AI 감정 엔진에 의해 실시간 생성되었으며
          <br />
          수사 결과에 대한 최종 판단은 시청자의 몫입니다.
        </p>
      </div>
    </div>
  );
}
