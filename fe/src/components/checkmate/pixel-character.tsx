/**
 * [Checkmate 캐릭터 컴포넌트 - 레퍼런스 최적화 및 타입 복구]
 */
type PixelCharacterProps = {
  className?: string;
  mood?: "neutral" | "alert" | "happy" | "thinking";
  size?: "xs" | "sm" | "md" | "lg";
  isWalking?: boolean;
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

export const PixelOfficer = ({ size = "sm", isWalking = false }: PixelCharacterProps) => {
  const sizes = {
    xs: "32px",
    sm: "40px",
    md: "64px",
    lg: "96px",
  };

  // 분석 중(isWalking)일 때만 GIF를 사용하고, 평소에는 정지 이미지를 사용합니다.
  const imgSrc = isWalking ? "sheriff.gif" : "sheriff_stop.png";

  return (
    <img
      src={chrome.runtime?.getURL ? chrome.runtime.getURL(imgSrc) : `/${imgSrc}`}
      alt={`Officer (${isWalking ? "walking" : "standing"})`}
      style={{
        width: sizes[size],
        height: "auto",
        imageRendering: "pixelated",
      }}
    />
  );
};
