import { useState } from "react";
import { useCheckmateStore } from "../../lib/store";
import { Send, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const STYLES = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "16px",
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#94a3b8",
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  card: {
    padding: "16px",
    backgroundColor: "white",
    border: "2px solid #e2e8f0",
    marginBottom: "12px",
  },
  voteButton: {
    flex: 1,
    padding: "8px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.1s",
  },
  chatInput: {
    width: "100%",
    padding: "10px",
    border: "2px solid #cbd5e1",
    fontSize: "13px",
    outline: "none",
  }
};

export function CommunityTab() {
  const { wantedCards, chatMessages, voteOnCard, addChatMessage } = useCheckmateStore();
  const [newMsg, setNewMsg] = useState("");

  const handleSend = () => {
    if (!newMsg.trim()) return;
    addChatMessage({ username: "나", message: newMsg });
    setNewMsg("");
  };

  return (
    <div style={STYLES.container}>
      {/* Vote Section */}
      <div>
        <h4 style={STYLES.sectionTitle}>
          <ThumbsUp style={{ width: "16px", height: "16px" }} />
          팩트체크 수사 요청
        </h4>
        {wantedCards.map((card) => (
          <div key={card.id} style={STYLES.card}>
            <p style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 8px 0" }}>{card.claim}</p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0" }}>{card.reporterComment}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => voteOnCard(card.id, "true")}
                style={{
                  ...STYLES.voteButton,
                  borderColor: card.userVote === "true" ? "#22c55e" : "#e2e8f0",
                  backgroundColor: card.userVote === "true" ? "#ecf7ed" : "white",
                  color: card.userVote === "true" ? "#1e8e3e" : "#64748b",
                }}
              >
                <ThumbsUp style={{ width: "14px", height: "14px" }} />
                진실 {card.votesTrue}
              </button>
              <button
                onClick={() => voteOnCard(card.id, "fake")}
                style={{
                  ...STYLES.voteButton,
                  borderColor: card.userVote === "fake" ? "#ef4444" : "#e2e8f0",
                  backgroundColor: card.userVote === "fake" ? "#fef2f2" : "white",
                  color: card.userVote === "fake" ? "#ef4444" : "#64748b",
                }}
              >
                <ThumbsDown style={{ width: "14px", height: "14px" }} />
                허위 {card.votesFake}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <h4 style={STYLES.sectionTitle}>
          <MessageSquare style={{ width: "16px", height: "16px" }} />
          실시간 수사 상황실
        </h4>
        <div
          style={{
            flex: 1,
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "#f8fafc",
            border: "2px solid #e2e8f0",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {chatMessages.map((msg) => (
            <div key={msg.id} style={{ fontSize: "12px", lineHeight: 1.4 }}>
              <span style={{ fontWeight: "bold", color: "#3b82f6", marginRight: "6px" }}>
                [{msg.badge === "verifier" ? "검증자" : "제보자"}] {msg.username}
              </span>
              <span style={{ color: "#334155" }}>{msg.message}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="상황 보고..."
            style={STYLES.chatInput}
          />
          <button
            onClick={handleSend}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0 12px",
              cursor: "pointer",
            }}
          >
            <Send style={{ width: "18px", height: "18px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
