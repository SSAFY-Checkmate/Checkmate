import { useState } from "react";
import { useCheckmateStore, type WantedCard as WantedCardType } from "../../lib/store";
import { cn } from "../../lib/utils";
import { ThumbsUp, ThumbsDown, ExternalLink, Plus, Send, Award, AlertTriangle } from "lucide-react";

function VoteBar({ votesTrue, votesFake }: { votesTrue: number; votesFake: number }) {
  const total = votesTrue + votesFake;
  const fakePercent = total > 0 ? (votesFake / total) * 100 : 50;

  return (
    <div className="w-full h-3 bg-zinc-200 flex overflow-hidden pixel-border">
      <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${100 - fakePercent}%` }} />
      <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${fakePercent}%` }} />
    </div>
  );
}

function WantedCard({ card }: { card: WantedCardType }) {
  const { voteOnCard } = useCheckmateStore();
  const hasVoted = !!card.userVote;

  return (
    <div className="p-3 border border-zinc-200 bg-white pixel-border">
      <div className="flex gap-3 mb-3">
        {/* Thumbnail placeholder */}
        <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center text-2xl pixel-border shrink-0">🎬</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black truncate mb-1">{card.claim}</p>
          <p className="text-xs text-zinc-500">제보: {`"${card.reporterComment}"`}</p>
        </div>
      </div>

      {/* Vote Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-zinc-500 mb-1">
          <span className="text-green-600">👍 {card.votesTrue}</span>
          <span className="text-red-600">👎 {card.votesFake}</span>
        </div>
        <VoteBar votesTrue={card.votesTrue} votesFake={card.votesFake} />
      </div>

      {/* Vote Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => !hasVoted && voteOnCard(card.id, "true")}
          disabled={hasVoted}
          className={cn(
            "flex-1 py-2 px-3 text-xs font-bold pixel-btn flex items-center justify-center gap-1 transition-all cursor-pointer disabled:cursor-default",
            hasVoted && card.userVote === "true"
              ? "bg-green-500 text-white"
              : hasVoted
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200",
          )}
        >
          <ThumbsUp className="w-3 h-3" />
          참이다
        </button>
        <button
          onClick={() => !hasVoted && voteOnCard(card.id, "fake")}
          disabled={hasVoted}
          className={cn(
            "flex-1 py-2 px-3 text-xs font-bold pixel-btn flex items-center justify-center gap-1 transition-all cursor-pointer disabled:cursor-default",
            hasVoted && card.userVote === "fake"
              ? "bg-red-500 text-white"
              : hasVoted
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
          )}
        >
          <ThumbsDown className="w-3 h-3" />
          거짓이다
        </button>
      </div>

      {/* Evidence Link */}
      <button className="w-full mt-2 py-1.5 px-3 text-xs text-blue-500 bg-blue-50 border border-blue-200 pixel-btn flex items-center justify-center gap-1 hover:bg-blue-100 transition-all cursor-pointer">
        <ExternalLink className="w-3 h-3" />
        반박 근거 제출
      </button>
    </div>
  );
}

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

  const getBadgeStyle = (badge?: "verifier" | "reporter") => {
    if (badge === "verifier") return "bg-blue-500 text-white";
    if (badge === "reporter") return "bg-amber-500 text-white";
    return "";
  };

  return (
    <div className="border border-zinc-200 bg-white pixel-border font-pixel">
      <div className="p-2 border-b border-zinc-200 bg-blue-50">
        <h4 className="text-sm font-bold flex items-center gap-2">
          💬 리뷰 채팅방
          <span className="text-xs text-zinc-500">({chatMessages.length}명 온라인)</span>
        </h4>
      </div>

      <div className="h-48 overflow-y-auto p-2 space-y-2">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="text-xs">
            <span className="font-bold text-black">
              {msg.badge && (
                <span className={cn("inline-block px-1 py-0.5 mr-1 text-[10px]", getBadgeStyle(msg.badge))}>
                  {msg.badge === "verifier" ? (
                    <Award className="w-2 h-2 inline" />
                  ) : (
                    <AlertTriangle className="w-2 h-2 inline" />
                  )}
                </span>
              )}
              {msg.username}:
            </span>{" "}
            <span className="text-zinc-600">{msg.message}</span>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-zinc-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="의견을 입력하세요..."
          className="flex-1 px-2 py-1 text-xs bg-zinc-50 border border-zinc-200 pixel-border focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={handleSend} className="px-3 py-1 bg-blue-500 text-white pixel-btn cursor-pointer">
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function CommunityTab() {
  const { wantedCards } = useCheckmateStore();

  return (
    <div className="flex flex-col gap-4 p-4 font-pixel">
      {/* Voting Section */}
      <div>
        <h4 className="text-sm font-bold text-zinc-500 mb-3 flex items-center gap-2">🧐 판단 보류/수배 중</h4>
        <div className="space-y-3">
          {wantedCards.map((card) => (
            <WantedCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Chat Room */}
      <ChatRoom />

      {/* Report Button */}
      <button className="w-full py-3 px-4 bg-amber-500 text-white font-bold pixel-btn flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
        <Plus className="w-5 h-5" />
        나도 허위 영상 제보하기
      </button>
    </div>
  );
}
