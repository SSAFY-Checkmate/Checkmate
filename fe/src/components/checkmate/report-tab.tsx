import { useCheckmateStore, type Verdict, type Claim } from "../../lib/store";
import { cn } from "../../lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, ExternalLink, Shield } from "lucide-react";

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    warning: {
      icon: AlertTriangle,
      label: "허위",
      className: "bg-red-50 text-red-600 border-red-200",
    },
    safe: {
      icon: CheckCircle,
      label: "사실",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    unknown: {
      icon: HelpCircle,
      label: "판단 보류",
      className: "bg-amber-50 text-amber-600 border-amber-200",
    },
  };

  const { icon: Icon, label, className } = config[verdict];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs border pixel-border", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function TrustMeter({ score }: { score: number }) {
  const bars = 10;
  const filledBars = Math.round((score / 100) * bars);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500">신뢰도:</span>
      <div className="flex gap-0.5">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-4",
              i < filledBars
                ? score < 30
                  ? "bg-red-500"
                  : score < 60
                    ? "bg-amber-500"
                    : "bg-green-500"
                : "bg-zinc-200",
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-sm font-bold",
          score < 30 ? "text-red-500" : score < 60 ? "text-amber-500" : "text-green-500",
        )}
      >
        {score}%
      </span>
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <div className="p-3 border border-zinc-200 bg-white pixel-border">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-black">{claim.text}</p>
        <VerdictBadge verdict={claim.verdict} />
      </div>
      <p className="text-xs text-zinc-600 mb-2 leading-relaxed">{claim.evidence}</p>
      {claim.sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {claim.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
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
      className: "bg-red-50 border-red-500 text-red-600",
    },
    safe: {
      icon: "✅",
      label: "신뢰할 수 있는 정보",
      className: "bg-green-50 border-green-500 text-green-600",
    },
    unknown: {
      icon: "🧐",
      label: "판단 보류 (추가 검증 필요)",
      className: "bg-amber-50 border-amber-500 text-amber-600",
    },
  };

  const { icon, label, className } =
    verdictConfig[overallVerdict as keyof typeof verdictConfig] || verdictConfig.unknown;

  return (
    <div className="flex flex-col gap-4 p-4 font-pixel">
      {/* Overall Verdict */}
      <div className={cn("p-4 border-2 pixel-border text-center", className)}>
        <div className="text-3xl mb-1">{icon}</div>
        <h3 className="text-lg font-bold">{label}</h3>
        <div className="mt-2">
          <TrustMeter score={trustScore} />
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-500">핵심 주장 분석</h4>
        {claims.length > 0 ? (
          claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)
        ) : (
          <p className="text-xs text-zinc-400 text-center py-4">분석된 주장 데이터가 없습니다.</p>
        )}
      </div>

      {/* Response Action Button */}
      <button
        onClick={openResponseModal}
        className="w-full py-3 px-4 bg-blue-500 text-white font-bold pixel-btn flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Shield className="w-5 h-5" />
        🚨 원터치 팩트체크 대응
      </button>
    </div>
  );
}
