import React, { useState } from "react";
import { useCheckmateStore, type WantedCard as WantedCardType } from "../../lib/store";
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
 * 현상수배 카드 컴포넌트 (인라인 스타일)
 */
function WantedCard({ card }: { card: WantedCardType }) {
  const { voteOnCard } = useCheckmateStore();
  const hasVoted = !!card.userVote;

  const cardStyle: React.CSSProperties = {
    padding: "16px",
    border: "2.5px solid #e2e8f0",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  const getVoteBtnStyle = (type: "true" | "fake"): React.CSSProperties => {
    const isThisVoted = card.userVote === type;
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
      gap: "8px",
      transition: "all 0.2s ease",
      cursor: hasVoted ? "default" : "pointer",
      border: `2px solid ${isThisVoted ? color : borderColor}`,
      backgroundColor: isThisVoted ? color : bgColor,
      color: isThisVoted ? "white" : color,
    };
  };

  return (
    <div style={cardStyle} className="pixel-border transition-transform hover:scale-[1.01]">
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "#f4f4f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            border: "2px solid #e4e4e7",
            flexShrink: 0,
          }}
          className="pixel-border"
        >
          🎬
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "900",
              color: "black",
              margin: 0,
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            {card.claim}
          </p>
          <p style={{ fontSize: "11px", color: "#71717a", fontStyle: "italic", margin: 0, lineHeight: 1.4 }}>
            제보: "{card.reporterComment}"
          </p>
        </div>
      </div>

      {/* Vote Stats */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            fontWeight: "bold",
            marginBottom: "6px",
          }}
        >
          <span style={{ color: "#16a34a" }}>👍 참이다 ({card.votesTrue})</span>
          <span style={{ color: "#dc2626" }}>👎 거짓이다 ({card.votesFake})</span>
        </div>
        <VoteBar votesTrue={card.votesTrue} votesFake={card.votesFake} />
      </div>

      {/* Vote Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => !hasVoted && voteOnCard(card.id, "true")}
          disabled={hasVoted}
          style={getVoteBtnStyle("true")}
          className="pixel-btn"
        >
          <ThumbsUp style={{ width: "14px", height: "14px" }} />참
        </button>
        <button
          onClick={() => !hasVoted && voteOnCard(card.id, "fake")}
          disabled={hasVoted}
          style={getVoteBtnStyle("fake")}
          className="pixel-btn"
        >
          <ThumbsDown style={{ width: "14px", height: "14px" }} />
          거짓
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
          justifyContent: "between",
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
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#f9fafb",
            border: "2.5px solid #e5e7eb",
            fontSize: "13px",
            outline: "none",
          }}
          className="pixel-border focus:border-blue-400"
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
          }}
          className="pixel-btn hover:bg-blue-600 transition-all"
        >
          <Send style={{ width: "16px", height: "16px" }} />
        </button>
      </div>
    </div>
  );
}

export function CommunityTab() {
  const { wantedCards } = useCheckmateStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px", paddingBottom: "112px" }}>
      {/* Wanted Section */}
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
          🧐 팩트체크 현상수배
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {wantedCards.map((card) => (
            <WantedCard key={card.id} card={card} />
          ))}
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
            boxShadow: "0 4px 0 #b45309",
            transition: "all 0.1s ease",
            cursor: "pointer",
          }}
          className="pixel-btn active:translate-y-[2px] active:shadow-[0_2px_0_#b45309] hover:brightness-110"
        >
          <Plus style={{ width: "24px", height: "24px" }} />
          나도 허위 영상 제보하기
        </button>
      </div>
    </div>
  );
}
