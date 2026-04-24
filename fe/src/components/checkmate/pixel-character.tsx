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
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36",
    xl: "w-48 h-48",
    "2xl": "w-64 h-64",
    "3xl": "w-80 h-80",
    "4xl": "w-96 h-96",
  };

  // Shadow DOM 대응용 인라인 수치 (Tailwind 1단위 = 4px)
  const sizeValues = {
    sm: { w: "48px", h: "48px" },
    md: { w: "96px", h: "96px" },
    lg: { w: "200px", h: "200px" },  // 144px에서 200px로 상향 조정 (스케일 대응)
    xl: { w: "192px", h: "192px" },
    "2xl": { w: "256px", h: "256px" },
    "3xl": { w: "320px", h: "320px" },
    "4xl": { w: "384px", h: "384px" },
  };

  const currentSize = sizeValues[size as keyof typeof sizeValues] || sizeValues.xl;

  return (
    <div
      className={cn("relative", sizeClasses[size], className)}
      style={{ width: currentSize.w, height: currentSize.h, display: "block" }}
    >
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("/police-station.png") : "/police-station.png"}
        alt="Checkmate 경찰서"
        className="object-contain w-full h-full pointer-events-none"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          transform: "scale(1.6)",
          transformOrigin: "center center", // 중앙을 기준으로 커지도록 수정하여 위아래 균형 맞춤
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
  const sizeClasses = {
    sm: "w-10 h-14",
    md: "w-16 h-24",
    lg: "w-24 h-36",
    xl: "w-32 h-48",
    "2xl": "w-48 h-72",
    "3xl": "w-56 h-84",
    "4xl": "w-64 h-96",
  };

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
      className={cn("relative", sizeClasses[size], className)}
      style={{
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
        className="object-contain pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};
