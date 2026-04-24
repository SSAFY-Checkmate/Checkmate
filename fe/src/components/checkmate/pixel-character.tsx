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
 * 이 컴포넌트는 분석의 메인 버튼 디자인으로 사용됩니다.
 */
export const PixelCharacter = ({
  className,
  size = "xl",
}: PixelCharacterProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36",
    xl: "w-48 h-48",
    "2xl": "w-64 h-64",
    "3xl": "w-80 h-80",
    "4xl": "w-96 h-96",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("/police-station.png") : "/police-station.png"}
        alt="Checkmate 경찰서"
        className="object-contain w-full h-full scale-[1.8] pointer-events-none"
        style={{ imageRendering: "pixelated" }} // 픽셀 아트 뭉개짐 방지
      />
    </div>
  );
};

/**
 * [Checkmate 보안관 캐릭터 컴포넌트]
 * 분석 중이거나 결과 발표 시 보조 캐릭터로 등장합니다.
 */
export const PixelOfficer = ({
  className,
  size = "md",
}: PixelCharacterProps) => {
  const sizeClasses = {
    sm: "w-10 h-14",
    md: "w-16 h-24",
    lg: "w-24 h-36",
    xl: "w-32 h-48",
    "2xl": "w-48 h-72",
    "3xl": "w-56 h-84",
    "4xl": "w-64 h-96",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("/sheriff.gif") : "/sheriff.gif"}
        alt="Checkmate 보안관"
        className="object-contain w-full h-full"
        style={{ imageRendering: "pixelated" }} // 픽셀 아트 뭉개짐 방지
      />
    </div>
  );
};
