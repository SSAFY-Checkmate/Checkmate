import { useState, useEffect } from "react";
import { useCheckmateStore } from "../../lib/store";
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Users } from "lucide-react";
import { motion } from "framer-motion";

const STYLES = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "16px",
    backgroundColor: "white",
    height: "100%",
    overflowY: "auto" as const,
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#94a3b8",
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.025em",
  },
  voteCard: {
    padding: "20px",
    backgroundColor: "#ffffff",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  gaugeContainer: {
    display: "flex",
    height: "12px",
    borderRadius: "9999px",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    width: "100%",
  },
  voteButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "900" as const,
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 10,
    position: "relative" as const,
  },
  chatInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "4px",
    border: "2px solid #e2e8f0",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#f8fafc",
    transition: "border-color 0.2s",
  },
  card: {
    padding: "16px",
    backgroundColor: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    marginBottom: "12px",
  },
};

export function CommunityTab() {
  const {
    isLoggedIn,
    analysisId,
    reactionSummary,
    myReaction,
    postReaction,
    fetchReactions, // [추가]
    analysisStatus,
    videoTitle,
    claims,
    chatMessages,
    voteOnClaim,
    addChatMessage,
  } = useCheckmateStore();
  const [newMsg, setNewMsg] = useState("");

  // [추가] 탭 진입 시 또는 로그인 상태 변경 시 투표 데이터 로드
  useEffect(() => {
    if (analysisId) {
      fetchReactions(analysisId);
    }
  }, [analysisId, fetchReactions, isLoggedIn]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    addChatMessage({ username: "나", message: newMsg });
    setNewMsg("");
  };

  const handleVote = async (type: boolean) => {
    console.log("handleVote 클릭됨:", { type, isLoggedIn, analysisId });
    if (!isLoggedIn) {
      alert("투표를 위해 로그인이 필요합니다.");
      return;
    }
    if (analysisId) {
      await postReaction(analysisId, type);
    } else {
      console.error("handleVote: analysisId가 없습니다.");
      // 영상 제목이나 스토어 상태를 통해 데모 여부 판별 (데모 버튼은 삭제했지만 기존 결과가 캐시되어 있을 수 있음)
      if (videoTitle.includes("데모")) {
        alert("데모 영상은 실제 투표가 불가능합니다. 실제 영상을 분석해 주세요.");
      } else {
        alert("분석 정보를 불러오는 중입니다. 잠시 후 다시 시도해 주세요. (ID Missing)");
      }
    }
  };

  // 게이지 비율 계산 (0명일 경우 50:50으로 표시)
  const proCount = reactionSummary.proCount;
  const conCount = reactionSummary.conCount;
  const total = proCount + conCount;
  const proPercent = total === 0 ? 50 : Math.round((proCount / total) * 100);
  const conPercent = total === 0 ? 50 : 100 - proPercent;

  return (
    <div style={STYLES.container}>
      {/* ─── 1. Citizens Investigation Vote Section ─── */}
      <div>
        <h4 style={STYLES.sectionTitle}>
          <Users style={{ width: "18px", height: "18px", color: "#6366f1" }} />
          시민 수사관 투표
        </h4>

        <div style={STYLES.voteCard}>
          {analysisStatus !== "complete" ? (
            <div
              style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: "13px", fontWeight: "bold" }}
            >
              분석 완료 후 시민 수사에 참여할 수 있습니다.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                <span style={{ color: "#10b981" }}>진실 {proPercent}%</span>
                <span style={{ color: "#ef4444" }}>허위 {conPercent}%</span>
              </div>

              <div style={STYLES.gaugeContainer}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proPercent}%` }}
                  style={{ backgroundColor: "#10b981", height: "100%" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${conPercent}%` }}
                  style={{ backgroundColor: "#ef4444", height: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => handleVote(true)}
                  style={{
                    ...STYLES.voteButton,
                    borderColor: myReaction === true ? "#10b981" : "#e2e8f0",
                    backgroundColor: myReaction === true ? "#ecfdf5" : "white",
                    color: myReaction === true ? "#059669" : "#64748b",
                    transform: myReaction === true ? "translateY(-2px)" : "none",
                    boxShadow: myReaction === true ? "0 4px 6px -1px rgba(16, 185, 129, 0.2)" : "none",
                  }}
                >
                  <ThumbsUp style={{ width: "16px", height: "16px" }} />
                  진실
                </button>
                <button
                  type="button"
                  onClick={() => handleVote(false)}
                  style={{
                    ...STYLES.voteButton,
                    borderColor: myReaction === false ? "#ef4444" : "#e2e8f0",
                    backgroundColor: myReaction === false ? "#fef2f2" : "white",
                    color: myReaction === false ? "#ef4444" : "#64748b",
                    transform: myReaction === false ? "translateY(-2px)" : "none",
                    boxShadow: myReaction === false ? "0 4px 6px -1px rgba(239, 68, 68, 0.2)" : "none",
                  }}
                >
                  <ThumbsDown style={{ width: "16px", height: "16px" }} />
                  허위
                </button>
              </div>

              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "12px",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                수사관님들의 실시간 투표로 영상의 신뢰도를 결정합니다.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ─── 2. 팩트체크 수사 요청 (Claims) ─── */}
      <div>
        <h4 style={STYLES.sectionTitle}>
          <ThumbsUp style={{ width: "16px", height: "16px" }} />
          팩트체크 수사 요청
        </h4>
        {claims.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: "bold",
              border: "2px dashed #e2e8f0",
              borderRadius: "4px",
            }}
          >
            📋 등록된 수사 요청이 없습니다
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} style={STYLES.card}>
              <p style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 6px 0", color: "#1e293b" }}>
                {claim.text}
              </p>
              {claim.evidence && (
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                  {claim.evidence}
                </p>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => voteOnClaim(claim.id, "true")}
                  style={{
                    ...STYLES.voteButton,
                    flex: 1,
                    borderColor: claim.userVote === "true" ? "#22c55e" : "#e2e8f0",
                    backgroundColor: claim.userVote === "true" ? "#ecf7ed" : "white",
                    color: claim.userVote === "true" ? "#1e8e3e" : "#64748b",
                  }}
                >
                  <ThumbsUp style={{ width: "14px", height: "14px" }} />
                  진실 {claim.votesTrue}
                </button>
                <button
                  type="button"
                  onClick={() => voteOnClaim(claim.id, "fake")}
                  style={{
                    ...STYLES.voteButton,
                    flex: 1,
                    borderColor: claim.userVote === "fake" ? "#ef4444" : "#e2e8f0",
                    backgroundColor: claim.userVote === "fake" ? "#fef2f2" : "white",
                    color: claim.userVote === "fake" ? "#ef4444" : "#64748b",
                  }}
                >
                  <ThumbsDown style={{ width: "14px", height: "14px" }} />
                  허위 {claim.votesFake}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── 3. 채팅 섹션 ─── */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <h4 style={STYLES.sectionTitle}>
          <MessageSquare style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
          실시간 수사 상황실
        </h4>
        <div
          style={{
            flex: 1,
            maxHeight: "350px",
            overflowY: "auto",
            backgroundColor: "#f8fafc",
            border: "2px solid #e2e8f0",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderRadius: "4px",
          }}
        >
          {chatMessages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                color: "#94a3b8",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              💬 아직 대화가 없습니다
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} style={{ fontSize: "12px", lineHeight: 1.5 }}>
                <span
                  style={{
                    fontWeight: "900",
                    color: msg.badge === "verifier" ? "#10b981" : "#3b82f6",
                    marginRight: "8px",
                    fontSize: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  [{msg.badge === "verifier" ? "검증자" : msg.badge === "reporter" ? "제보자" : "참여자"}]{" "}
                  {msg.username}
                </span>
                <span style={{ color: "#334155" }}>{msg.message}</span>
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="상황 보고 및 의견 공유..."
            style={STYLES.chatInput}
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="메시지 전송"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0 16px",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
          >
            <Send style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
