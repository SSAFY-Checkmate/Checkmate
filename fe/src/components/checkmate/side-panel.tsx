import { useCheckmateStore } from "../../lib/store";
import { cn } from "../../lib/utils";
import { X, FileText, Users, Play } from "lucide-react";
import { ReportTab } from "./report-tab";
import { CommunityTab } from "./community-tab";
import { ResponseModal } from "./response-modal";

export function SidePanel() {
  const { isPanelOpen, closePanel, activeTab, setActiveTab, videoTitle, channelName } = useCheckmateStore();

  if (!isPanelOpen) return null;

  return (
    <>
      <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full max-w-sm bg-white border-l-2 border-blue-500 shadow-2xl z-[100000000] flex flex-col font-pixel">
        {/* Floating Close Button (Desktop/Tablet - 패널 왼쪽에 플로팅 위치) */}
        <button
          onClick={closePanel}
          className="absolute -left-12 top-4 w-10 h-10 border-2 border-blue-500 bg-white pixel-btn text-zinc-500 hover:text-black hover:bg-zinc-50 active:scale-95 transition-all shadow-md cursor-pointer z-[61] hidden sm:flex items-center justify-center"
        >
          <X className="w-6 h-6" strokeWidth={2} />
        </button>

        {/* Video Info */}
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center gap-3">
          <div className="w-16 h-12 bg-zinc-100 pixel-border flex items-center justify-center shrink-0">
            <Play className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">{videoTitle || "영상을 선택하세요"}</p>
            <p className="text-xs text-zinc-500">{channelName || "채널 정보 없음"}</p>
          </div>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("report")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
              activeTab === "report" ? "bg-blue-500 text-white" : "bg-zinc-50 text-zinc-500 hover:text-black",
            )}
          >
            <FileText className="w-4 h-4" />
            📊 리포트
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
              activeTab === "community" ? "bg-blue-500 text-white" : "bg-zinc-50 text-zinc-500 hover:text-black",
            )}
          >
            <Users className="w-4 h-4" />
            🤝 커뮤니티
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">{activeTab === "report" ? <ReportTab /> : <CommunityTab />}</div>
      </div>

      <ResponseModal />
    </>
  );
}
