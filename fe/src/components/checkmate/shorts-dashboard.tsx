import { useCheckmateStore } from "../../lib/store";
import { PixelCharacter } from "./pixel-character";
import { PixelButton } from "../common/pixel-button";

/**
 * [Checkmate 쇼츠 전용 대시보드]
 * 쇼츠 환경에 최적화된 플로팅 레이아웃을 구현할 예정입니다.
 */
export function ShortsDashboard() {
  const { analysisStatus, startAnalysis } = useCheckmateStore();
  const pixelFont = "'CheckmatePixel', sans-serif";

  return (
    <div 
      style={{
        position: "fixed",
        bottom: "100px",
        right: "80px",
        zIndex: 9999,
        fontFamily: pixelFont,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px"
      }}
    >
      {/* 쇼츠에서는 좀 더 작고 귀여운 스타일로 시작 */}
      <div 
        style={{ 
          background: "white", 
          padding: "12px", 
          border: "4px solid #0ea5e9",
          borderRadius: "8px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <PixelCharacter size="md" />
        <span style={{ fontSize: "12px", fontWeight: "bold", color: "#0ea5e9" }}>
          SHORTS MODE
        </span>
        <PixelButton 
          text="팩트체크" 
          size="sm" 
          onClick={() => startAnalysis()}
          colorType="primary"
        />
      </div>
    </div>
  );
}
