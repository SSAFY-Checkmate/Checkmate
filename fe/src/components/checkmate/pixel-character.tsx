import { cn } from "../../lib/utils";

/**
 * 캐릭터 컴포넌트 공통 Props 타입
 */
type PixelCharacterProps = {
  className?: string; // 추가 스타일 클래스
  mood?: "neutral" | "alert" | "happy" | "thinking"; // 캐릭터 표정/상태
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"; // 크기 프리셋
};

/**
 * [Checkmate 경찰서 건물 컴포넌트]
 * ad-check/pixel-character.tsx의 설정을 100% 이식했습니다.
 */
export const PixelCharacter = ({ className, size = "xl" }: PixelCharacterProps) => {
  // Shadow DOM 대응용 인라인 수치 (Tailwind 1단위 = 4px)
  const sizeValues = {
    sm: { w: "48px", h: "48px" },
    md: { w: "96px", h: "96px" },
    lg: { w: "200px", h: "200px" }, // 144px에서 200px로 상향 조정 (스케일 대응)
    xl: { w: "192px", h: "192px" },
    "2xl": { w: "256px", h: "256px" },
    "3xl": { w: "320px", h: "320px" },
    "4xl": { w: "384px", h: "384px" },
  };

  const currentSize = sizeValues[size as keyof typeof sizeValues] || sizeValues.xl;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: currentSize.w,
        height: currentSize.h,
        display: "block",
      }}
    >
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("/police-station.png") : "/police-station.png"}
        alt="Checkmate 경찰서"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "contain",
          pointerEvents: "none",
          transform: "scale(1.6)",
          transformOrigin: "center center",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

/**
 * [Checkmate 보안관 캐릭터 컴포넌트]
 * ad-check/pixel-character.tsx의 설정을 100% 이식했습니다.
 */
export const PixelOfficer = ({ className, size = "md" }: PixelCharacterProps) => {
  // Shadow DOM 대응용 인라인 수치
  const sizeValues = {
    sm: { w: "40px", h: "56px" },
    md: { w: "64px", h: "96px" },
    lg: { w: "96px", h: "144px" },
    xl: { w: "128px", h: "192px" },
    "2xl": { w: "192px", h: "288px" },
    "3xl": { w: "224px", h: "336px" },
    "4xl": { w: "256px", h: "384px" },
  };

  const currentSize = sizeValues[size as keyof typeof sizeValues] || sizeValues.md;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: currentSize.w,
        height: currentSize.h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("/sheriff.gif") : "/sheriff.gif"}
        alt="Checkmate 보안관"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          pointerEvents: "none",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};
