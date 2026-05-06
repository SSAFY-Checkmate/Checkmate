import { useState } from "react";
import { useCheckmateStore } from "../../lib/store";
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const PIXEL_FONT = "'CheckmatePixel', 'DungGeunMo', 'Courier New', monospace !important";
const BORDER_COLOR = "#475569";
const SHADOW_COLOR = "#94a3b8";

const STYLES = {
  container: {
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    backgroundColor: "#f8fafc",
    minHeight: "100%",
    fontFamily: PIXEL_FONT,
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "normal" as const,
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: PIXEL_FONT,
  },
  pixelCard: {
    backgroundColor: "#ffffff",
    border: `3px solid ${BORDER_COLOR}`,
    boxShadow: `4px 4px 0px 0px ${SHADOW_COLOR}`,
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  gaugeContainer: {
    height: "28px",
    backgroundColor: "#f1f5f9",
    border: `3px solid ${BORDER_COLOR}`,
    display: "flex",
    position: "relative" as const,
    overflow: "hidden",
    boxShadow: "inset 2px 2px 0px 0px rgba(0,0,0,0.05)",
  },
  voteButton: (color: string, shadow: string, active: boolean) => ({
    flex: 1,
    padding: "12px",
    backgroundColor: active ? color : "#ffffff",
    color: active ? "#ffffff" : color,
    border: `3px solid ${active ? BORDER_COLOR : color}`,
    // active일 때 네온 광채(glow) 효과 추가
    boxShadow: active
      ? `0px 0px 15px ${color}, inset 3px 3px 0px 0px rgba(255,255,255,0.3)`
      : `3px 3px 0px 0px ${shadow}`,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    fontFamily: PIXEL_FONT,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: active ? "scale(1.05)" : "none", // 선택 시 살짝 커지는 효과
    zIndex: active ? 10 : 1,
  }),
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "normal" as const,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    fontFamily: PIXEL_FONT,
  },
  chatBox: {
    flex: 1,
    backgroundColor: "#334155",
    border: `3px solid ${BORDER_COLOR}`,
    boxShadow: `3px 3px 0px 0px ${SHADOW_COLOR}`,
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    minHeight: "120px",
  },
};

export function CommunityTab() {
  const { channelName, communityVotes, postReaction, isLoggedIn, analysisId, chatMessages, addChatMessage } =
    useCheckmateStore();
  const [newMsg, setNewMsg] = useState("");

  const votes = communityVotes || { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null };
  const totalVotes = votes.trueVotes + votes.fakeVotes;
  const truePercent = totalVotes > 0 ? Math.round((votes.trueVotes / totalVotes) * 100) : 50;
  const fakePercent = 100 - truePercent;

  const handleVote = (type: boolean) => {
    if (!isLoggedIn) {
      alert("판정에 참여하려면 로그인이 필요합니다! 상단 요원 아이콘을 눌러 로그인해 주세요.");
      return;
    }
    if (!analysisId) {
      alert("분석 결과를 불러오는 중이거나 결과가 없습니다. 분석 완료 후 다시 시도해 주세요.");
      return;
    }
    postReaction(analysisId, type);
  };

  const handleSend = () => {
    if (!newMsg.trim() || !isLoggedIn) return;
    addChatMessage({ username: "나", message: newMsg });
    setNewMsg("");
  };

  return (
    <div style={STYLES.container}>
      <h4 style={STYLES.headerTitle}>
        <Users size={20} color="#6366f1" />
        시민 배심원 판정 시스템
      </h4>

      {/* 메인 픽셀 카드 */}
      <div style={STYLES.pixelCard}>
        {/* 채널 정보 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#475569",
              border: `2px solid ${BORDER_COLOR}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `3px 3px 0px 0px ${SHADOW_COLOR}`,
            }}
          >
            <ShieldCheck size={28} color="#94a3b8" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal", fontFamily: PIXEL_FONT }}>
              수사 대상 채널
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "#334155",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: PIXEL_FONT,
              }}
            >
              {channelName || "감지 중..."}
            </div>
          </div>
        </div>

        {/* 픽셀 게이지 바 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", color: "#10b981", fontFamily: PIXEL_FONT }}>진실</span>
              <span style={{ fontSize: "20px", color: "#10b981", lineHeight: 1, fontFamily: PIXEL_FONT }}>
                {truePercent}%
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "12px", color: "#ef4444", fontFamily: PIXEL_FONT }}>허위</span>
              <span style={{ fontSize: "20px", color: "#ef4444", lineHeight: 1, fontFamily: PIXEL_FONT }}>
                {fakePercent}%
              </span>
            </div>
          </div>

          <div style={STYLES.gaugeContainer}>
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${truePercent}%` }}
              style={{ height: "100%", backgroundColor: "#10b981", borderRight: `3px solid ${BORDER_COLOR}` }}
            />
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${fakePercent}%` }}
              style={{ height: "100%", backgroundColor: "#ef4444" }}
            />
          </div>

          <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", fontFamily: PIXEL_FONT }}>
            참여 배심원 수: {totalVotes}명
          </div>
        </div>

        {/* 아케이드 스타일 버튼 */}
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => handleVote(true)}
            style={STYLES.voteButton("#10b981", "#6ee7b7", votes.userVote === true)}
          >
            <ThumbsUp size={22} color={votes.userVote === true ? "#ffffff" : "#10b981"} />
            <span style={{ fontSize: "14px", fontFamily: PIXEL_FONT }}>진실 증언</span>
          </button>
          <button
            onClick={() => handleVote(false)}
            style={STYLES.voteButton("#ef4444", "#fca5a5", votes.userVote === false)}
          >
            <ThumbsDown size={22} color={votes.userVote === false ? "#ffffff" : "#ef4444"} />
            <span style={{ fontSize: "14px", fontFamily: PIXEL_FONT }}>허위 고발</span>
          </button>
        </div>
      </div>

      {/* 상황실 채팅 섹션 */}
      <section style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <h4 style={STYLES.sectionTitle}>
          <MessageSquare size={16} color="#64748b" />
          실시간 수사 상황실
        </h4>
        <div style={STYLES.chatBox}>
          {(chatMessages || []).slice(-5).map((msg) => (
            <div key={msg.id} style={{ fontSize: "12px", lineHeight: 1.4, fontFamily: PIXEL_FONT }}>
              <span
                style={{
                  color: msg.badge === "verifier" ? "#10b981" : "#38bdf8",
                  marginRight: "6px",
                  fontFamily: PIXEL_FONT,
                }}
              >
                {msg.username}:
              </span>
              <span style={{ color: "#f1f5f9", fontFamily: PIXEL_FONT }}>{msg.message}</span>
            </div>
          ))}
          {(!chatMessages || chatMessages.length === 0) && (
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                textAlign: "center",
                marginTop: "20px",
                fontFamily: PIXEL_FONT,
              }}
            >
              수신된 데이터가 없습니다
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!isLoggedIn}
            placeholder={isLoggedIn ? "제보 내용을 입력하세요..." : "로그인이 필요합니다"}
            style={{
              flex: 1,
              padding: "10px 14px",
              backgroundColor: "#ffffff",
              border: `3px solid ${BORDER_COLOR}`,
              boxShadow: `3px 3px 0px 0px ${SHADOW_COLOR}`,
              fontSize: "13px",
              fontFamily: PIXEL_FONT,
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!isLoggedIn}
            style={{
              backgroundColor: BORDER_COLOR,
              color: "white",
              border: "none",
              padding: "0 16px",
              boxShadow: `3px 3px 0px 0px ${SHADOW_COLOR}`,
              cursor: isLoggedIn ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: PIXEL_FONT,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
