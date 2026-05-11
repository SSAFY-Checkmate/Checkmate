import { useState, useEffect } from "react";
import { useCheckmateStore, type ChatMessage } from "../../lib/store";
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { PixelConfirmModal } from "../common/pixel-confirm-modal";

const PIXEL_FONT = "'CheckmatePixel', 'DungGeunMo', 'Courier New', monospace !important";
const BORDER_COLOR = "#475569";
const SHADOW_COLOR = "#94a3b8";

const STYLES = {
  container: {
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100%",
    fontFamily: PIXEL_FONT,
  },
  headerTitle: {
    fontSize: "15px",
    fontWeight: "900",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: PIXEL_FONT,
    marginBottom: "4px",
  },
  premiumCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
    position: "relative" as const,
    overflow: "hidden",
  },
  gaugeTrack: {
    height: "20px",
    backgroundColor: "#f1f5f9",
    borderRadius: "10px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "900",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    marginBottom: "4px",
    fontFamily: PIXEL_FONT,
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    minHeight: 0,
  },
  chatList: {
    flex: 1,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    paddingRight: "8px",
  },
  messageCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
};

export function CommunityTab() {
  const {
    channelName,
    communityVotes,
    postReaction,
    isLoggedIn,
    analysisId,
    chatMessages,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    commentPagination,
    user,
  } = useCheckmateStore();

  const [newMsg, setNewMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const votes = communityVotes || { trueVotes: 0, fakeVotes: 0, userVote: null, userReactionId: null };
  const totalVotes = votes.trueVotes + votes.fakeVotes;
  const truePercent = totalVotes > 0 ? Math.round((votes.trueVotes / totalVotes) * 100) : 50;
  const fakePercent = 100 - truePercent;

  useEffect(() => {
    if (analysisId) {
      fetchComments(analysisId);
    }
  }, [analysisId, fetchComments]);

  const handleVote = (type: boolean) => {
    if (!isLoggedIn) {
      alert("판정에 참여하려면 로그인이 필요합니다!");
      return;
    }
    if (analysisId) {
      postReaction(analysisId, type);
    }
  };

  const handleSend = () => {
    if (!newMsg.trim()) return;

    if (!isLoggedIn) {
      alert("제보를 남기려면 로그인이 필요합니다! 상단 요원 아이콘을 눌러 로그인해 주세요.");
      return;
    }

    if (!analysisId) {
      alert("분석이 완료된 영상에 대해서만 제보가 가능합니다. 분석 완료 후 다시 시도해 주세요.");
      return;
    }

    addComment(newMsg);
    setNewMsg("");
  };

  const startEditing = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditContent(msg.message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateComment(editingId, editContent);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await deleteComment(idToDelete);
      setIdToDelete(null);
    }
  };

  return (
    <div style={STYLES.container}>
      <header style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "4px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
          }}
        >
          <ShieldCheck size={28} color="#ffffff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: "900",
              marginBottom: "2px",
              letterSpacing: "0.5px",
            }}
          >
            수사 대상 채널
          </div>
          <h2
            style={{
              fontSize: "20px",
              color: "#1e293b",
              fontWeight: "900",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: PIXEL_FONT,
            }}
          >
            {channelName || "감지 중..."}
          </h2>
        </div>
      </header>

      <div style={STYLES.premiumCard}>
        {/* 시민 배심원 판정 시스템 (Moved inside card) */}
        <div style={{ borderBottom: "1px dashed #e2e8f0", paddingBottom: "16px" }}>
          <h4 style={{ ...STYLES.headerTitle, marginBottom: "4px" }}>
            <Users size={18} color="#6366f1" />
            사용자 실시간 찬반 투표
          </h4>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 0 28px", fontWeight: "bold" }}>
            이 영상, 정말 사실일까요? 의견을 투표해 주세요.
          </p>
        </div>

        {/* 사용자 투표 섹션 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "900", marginBottom: "4px" }}>진실</div>
              <div style={{ fontSize: "24px", color: "#10b981", fontWeight: "900", lineHeight: 1 }}>
                {truePercent}
                <span style={{ fontSize: "14px" }}>%</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#ef4444", fontWeight: "900", marginBottom: "4px" }}>허위</div>
              <div style={{ fontSize: "24px", color: "#ef4444", fontWeight: "900", lineHeight: 1 }}>
                {fakePercent}
                <span style={{ fontSize: "14px" }}>%</span>
              </div>
            </div>
          </div>

          <div style={STYLES.gaugeTrack}>
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${truePercent}%` }}
              style={{ height: "100%", backgroundColor: "#10b981", borderRight: "2px solid white" }}
            />
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: `${fakePercent}%` }}
              style={{ height: "100%", backgroundColor: "#ef4444" }}
            />
          </div>

          <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", fontWeight: "bold" }}>
            투표 참여자 수: {totalVotes}명
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => handleVote(true)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: votes.userVote === true ? "#10b981" : "#ffffff",
              color: votes.userVote === true ? "#ffffff" : "#10b981",
              border: `1.5px solid ${votes.userVote === true ? "#10b981" : "#10b98133"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: PIXEL_FONT,
              fontWeight: "900",
            }}
          >
            <ThumbsUp size={18} />
            <span style={{ fontSize: "12px" }}>진실</span>
          </button>
          <button
            onClick={() => handleVote(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: votes.userVote === false ? "#ef4444" : "#ffffff",
              color: votes.userVote === false ? "#ffffff" : "#ef4444",
              border: `1.5px solid ${votes.userVote === false ? "#ef4444" : "#ef444433"}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: PIXEL_FONT,
              fontWeight: "900",
            }}
          >
            <ThumbsDown size={18} />
            <span style={{ fontSize: "12px" }}>허위</span>
          </button>
        </div>
      </div>

      <section style={STYLES.chatContainer}>
        <h4 style={STYLES.sectionTitle}>
          <MessageSquare size={16} color="#475569" />
          실시간 의견 공유
        </h4>

        <div style={STYLES.chatList}>
          {commentPagination.hasNext && (
            <button
              onClick={() => fetchComments(analysisId!, commentPagination.currentPage + 1)}
              style={{
                padding: "8px",
                fontSize: "11px",
                color: "#94a3b8",
                backgroundColor: "transparent",
                border: "1px dashed #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: PIXEL_FONT,
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              --- 이전 수사 기록 더 보기 ({commentPagination.currentPage + 1}/{commentPagination.totalPages}) ---
            </button>
          )}

          {(chatMessages || []).map((msg) => (
            <div key={msg.id} style={STYLES.messageCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "900",
                    color: msg.badge === "verifier" ? "#10b981" : "#0ea5e9",
                    backgroundColor: msg.badge === "verifier" ? "#dcfce7" : "#e0f2fe",
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {msg.username}
                </span>

                {user && String(user.id) === String(msg.userId) && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span
                      onClick={() => startEditing(msg)}
                      style={{ cursor: "pointer", fontSize: "10px", color: "#94a3b8", textDecoration: "underline" }}
                    >
                      수정
                    </span>
                    <span
                      onClick={() => handleDelete(msg.id)}
                      style={{ cursor: "pointer", fontSize: "10px", color: "#fca5a5", textDecoration: "underline" }}
                    >
                      삭제
                    </span>
                  </div>
                )}
              </div>

              {editingId === msg.id ? (
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      fontFamily: PIXEL_FONT,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={saveEdit}
                      style={{
                        border: "none",
                        background: "#10b981",
                        color: "white",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "900",
                        cursor: "pointer",
                      }}
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEditing}
                      style={{
                        border: "none",
                        background: "#cbd5e1",
                        color: "white",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "900",
                        cursor: "pointer",
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#475569",
                    margin: "4px 0",
                    lineHeight: "1.6",
                    fontWeight: "bold",
                    wordBreak: "break-all",
                  }}
                >
                  {msg.message}
                </p>
              )}
            </div>
          ))}

          {(!chatMessages || chatMessages.length === 0) && (
            <div
              style={{
                backgroundColor: "white",
                border: "1px dashed #e2e8f0",
                borderRadius: "16px",
                padding: "48px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
              }}
            >
              <MessageSquare size={32} color="#cbd5e1" strokeWidth={1.5} />
              <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "bold" }}>
                이 영상에 대한 첫 번째 의견을 남겨주세요
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isLoggedIn ? "의견을 남겨주세요..." : "로그인이 필요합니다"}
            style={{
              flex: 1,
              padding: "8px 0",
              backgroundColor: "transparent",
              border: "none",
              fontSize: "13px",
              fontFamily: PIXEL_FONT,
              fontWeight: "bold",
              outline: "none",
              color: "#1e293b",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMsg.trim()}
            style={{
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              padding: "0 16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: !newMsg.trim() ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </section>

      <PixelConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="수사 기록 삭제"
        message="작성하신 수사 제보 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
