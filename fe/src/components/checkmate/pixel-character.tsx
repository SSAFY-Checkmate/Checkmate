/**
 * [Checkmate 캐릭터 컴포넌트 - 레퍼런스 최적화 및 타입 복구]
 */
type PixelCharacterProps = {
  className?: string;
  mood?: "neutral" | "alert" | "happy" | "thinking"; // 사라졌던 mood 속성 복구
  size?: "xs" | "sm" | "md" | "lg";
};

export const PixelCharacter = ({ className, size = "lg" }: PixelCharacterProps) => {
  const sizes = {
    xs: "32px",
    sm: "48px",
    md: "96px",
    lg: "240px",
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <img
        src={chrome.runtime?.getURL ? chrome.runtime.getURL("police-station.png") : "/police-station.png"}
        alt="Police Station"
        style={{
          width: sizes[size],
          height: "auto",
          display: "block",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export const PixelOfficer = ({ size = "sm", mood = "neutral" }: PixelCharacterProps) => {
  const sizes = {
    xs: "32px",
    sm: "40px",
    md: "64px",
    lg: "96px",
  };

  // mood에 따라 다른 애니메이션이나 상태를 보여줄 수 있으나, 
  // 현재는 기본 sheriff.gif를 사용하되 타입 에러를 해결합니다.
  return (
    <img
      src={chrome.runtime?.getURL ? chrome.runtime.getURL("sheriff.gif") : "/sheriff.gif"}
      alt={`Officer (${mood})`}
      style={{
        width: sizes[size],
        height: "auto",
        imageRendering: "pixelated",
      }}
    />
  );
};
