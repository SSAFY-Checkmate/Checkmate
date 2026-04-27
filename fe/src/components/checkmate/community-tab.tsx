import React, { useState } from "react";
import { useCheckmateStore, type Claim } from "../../lib/store";
import { ThumbsUp, ThumbsDown, Plus, Send, Award, AlertTriangle, MessageSquare } from "lucide-react";

/**
 * 투표 바 컴포넌트 (인라인 스타일)
 */
function VoteBar({ votesTrue, votesFake }: { votesTrue: number; votesFake: number }) {
  const total = votesTrue + votesFake;
  const fakePercent = total > 0 ? (votesFake / total) * 100 : 50;

  return (
    <div
      style={{
        width: "100%",
        height: "20px",
        backgroundColor: "#f4f4f5",
        display: "flex",
        overflow: "hidden",
        border: "2px solid #e4e4e7",
      }}
      className="pixel-border"
    >
      <div
        style={{
          height: "100%",
          backgroundColor: "#22c55e",
          transition: "all 0.5s ease",
          width: `${100 - fakePercent}%`,
        }}
      />
      <div
        style={{ height: "100%", backgroundColor: "#ef4444", transition: "all 0.5s ease", width: `${fakePercent}%` }}
      />
    </div>
  );
}

/**
 * 현재 영상의 주장에 대한 커뮤니티 투표 카드
 */
function ClaimVoteCard({ claim }: { claim: Claim }) {
  const { voteOnClaim } = useCheckmateStore();
  const hasVoted = !!claim.userVote;

  const verdictLabel = {
    safe: { text: "AI 판정: 사실", color: "#1e8e3e", bg: "#ecf7ed" },
    warning: { text: "AI 판정: 허위", color: "#dc2626", bg: "#fef2f2" },
    unknown: { text: "AI 판정: 보류", color: "#d97706", bg: "#fffbeb" },
  }[claim.verdict];

  const cardStyle: React.CSSProperties = {
    padding: "16px",
    border: "2.5px solid #e2e8f0",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const getVoteBtnStyle = (type: "true" | "fake"): React.CSSProperties => {
    const isThisVoted = claim.userVote === type;
    const color = type === "true" ? "#22c55e" : "#ef4444";
    const bgColor = type === "true" ? "#f0fdf4" : "#fef2f2";
    const borderColor = type === "true" ? "#bbf7d0" : "#fecaca";

    return {
      flex: 1,
      padding: "10px",
      fontSize: "13px",
      fontWeight: "900",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      cursor: hasVoted ? "default" : "pointer",
      border: `2px solid ${isThisVoted ? color : borderColor}`,
      backgroundColor: isThisVoted ? color : bgColor,
      color: isThisVoted ? "white" : color,
    };
  };

  return (
    <div style={cardStyle} className="pixel-border">
      {/* AI 판정 배지 + 주장 텍스트 */}
      <div>
        <span style={{ display: "inline-block", padding: "2px 8px", fontSize: "11px", fontWeight: "bold", backgroundColor: verdictLabel.bg, color: verdictLabel.color, marginBottom: "6px" }} className="pixel-border">
          {verdictLabel.text}
        </span>
        <p style={{ fontSize: "14px", fontWeight: "900", color: "black", margin: 0, lineHeight: 1.4 }}>
          {claim.text}
        </p>
        <p style={{ fontSize: "11px", color: "#71717a", margin: 0, marginTop: "4px", lineHeight: 1.4 }}>
          {claim.evidence}
        </p>
      </div>

      {/* 투표 현황 */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", marginBottom: "6px" }}>
          <span style={{ color: "#16a34a" }}>👍 사실이다 ({claim.votesTrue})</span>
          <span style={{ color: "#dc2626" }}>👎 거짓이다 ({claim.votesFake})</span>
        </div>
        <VoteBar votesTrue={claim.votesTrue} votesFake={claim.votesFake} />
      </div>

      {/* 투표 버튼 */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => !hasVoted && voteOnClaim(claim.id, "true")}
          disabled={hasVoted}
          style={getVoteBtnStyle("true")}
          className="pixel-btn"
        >
          <ThumbsUp style={{ width: "14px", height: "14px" }} />사실이다
        </button>
        <button
          onClick={() => !hasVoted && voteOnClaim(claim.id, "fake")}
          disabled={hasVoted}
          style={getVoteBtnStyle("fake")}
          className="pixel-btn"
        >
          <ThumbsDown style={{ width: "14px", height: "14px" }} />
          거짓이다
        </button>
      </div>
    </div>
  );
}

/**
 * 실시간 채팅방 (인라인 스타일)
 */
function ChatRoom() {
  const { chatMessages, addChatMessage } = useCheckmateStore();
  const [newMessage, setNewMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (newMessage.trim()) {
      addChatMessage({
        username: "나",
        message: newMessage.trim(),
      });
      setNewMessage("");
    }
  };

  return (
    <div
      style={{ border: "2.5px solid #e4e4e7", backgroundColor: "white", overflow: "hidden" }}
      className="pixel-border"
    >
      <div
        style={{
          padding: "10px",
          borderBottom: "2.5px solid #e4e4e7",
          backgroundColor: "#f0f9ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4
          style={{
            fontSize: "14px",
            fontWeight: "900",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#0369a1",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          <MessageSquare style={{ width: "16px", height: "16px" }} />
          집단지성 채팅
        </h4>
        <span style={{ fontSize: "11px", fontWeight: "bold", color: "#7dd3fc", marginLeft: "auto" }}>
          {chatMessages.length}명 참여 중
        </span>
      </div>

      <div
        style={{
          height: "220px",
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#fdfdfd",
        }}
      >
        {chatMessages.map((msg) => (
          <div key={msg.id} style={{ fontSize: "13px", lineHeight: 1.5 }}>
            <span style={{ fontWeight: "900", color: "#27272a" }}>
              {msg.badge && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 6px",
                    marginRight: "6px",
                    fontSize: "9px",
                    borderRadius: "2px",
                    backgroundColor: msg.badge === "verifier" ? "#eff6ff" : "#fffbeb",
                    color: msg.badge === "verifier" ? "#2563eb" : "#d97706",
                  }}
                >
                  {msg.badge === "verifier" ? (
                    <Award style={{ width: "10px", height: "10px", marginRight: "2px" }} />
                  ) : (
                    <AlertTriangle style={{ width: "10px", height: "10px", marginRight: "2px" }} />
                  )}
                  {msg.badge === "verifier" ? "검증단" : "제보자"}
                </span>
              )}
              {msg.username}:
            </span>{" "}
            <span style={{ color: "#52525b", fontWeight: "500" }}>{msg.message}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px",
          borderTop: "2.5px solid #e4e4e7",
          display: "flex",
          gap: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#f9fafb",
            border: "2.5px solid",
            borderColor: isFocused ? "#60a5fa" : "#e5e7eb",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          className="pixel-border"
        />
        <button
          onClick={handleSend}
          style={{
            padding: "0 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.1s",
          }}
          className="pixel-btn"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          <Send style={{ width: "16px", height: "16px" }} />
        </button>
      </div>
    </div>
  );
}

export function CommunityTab() {
  const { claims, analysisStatus } = useCheckmateStore();
  const [isBtnPressed, setIsBtnPressed] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px", paddingBottom: "112px" }}>
      {/* 현재 영상 팩트체크 투표 섹션 */}
      <div>
        <h4
          style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#a1a1aa",
            marginBottom: "12px",
            paddingLeft: "4px",
            textTransform: "uppercase",
            letterSpacing: "-0.025em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🧐 이 영상, 직접 판단해봐
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {analysisStatus !== "complete" ? (
            /* 분석 전 안내 메시지 */
            <div style={{ textAlign: "center", padding: "32px 16px", border: "2px dashed #e2e8f0", color: "#a1a1aa" }} className="pixel-border">
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
              <p style={{ fontSize: "13px", fontWeight: "bold", margin: 0 }}>아직 분석이 완료되지 않았어요</p>
              <p style={{ fontSize: "11px", margin: "4px 0 0 0" }}>리포트 탭에서 스캔을 시작해 보세요!</p>
            </div>
          ) : claims.length > 0 ? (
            claims.map((claim) => (
              <ClaimVoteCard key={claim.id} claim={claim} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", border: "2px dashed #e2e8f0", color: "#a1a1aa" }} className="pixel-border">
              <p style={{ fontSize: "13px", fontWeight: "bold", margin: 0 }}>분석된 주장이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <ChatRoom />

      {/* Report Button (Fixed at Bottom) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          backgroundColor: "white",
          borderTop: "2px solid #f4f4f5",
          zIndex: 20,
        }}
      >
        <button
          onMouseDown={() => setIsBtnPressed(true)}
          onMouseUp={() => setIsBtnPressed(false)}
          onMouseLeave={() => setIsBtnPressed(false)}
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: "#f59e0b",
            color: "white",
            fontWeight: "900",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            border: "none",
            boxShadow: isBtnPressed ? "0 2px 0 #b45309" : "0 4px 0 #b45309",
            transform: isBtnPressed ? "translateY(2px)" : "none",
            transition: "all 0.1s ease",
            cursor: "pointer",
          }}
          className="pixel-btn"
        >
          <Plus style={{ width: "24px", height: "24px" }} />
          나도 허위 영상 제보하기
        </button>
      </div>
    </div>
  );
}
