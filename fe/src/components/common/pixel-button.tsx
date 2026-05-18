import React from "react";

export const PixelSpinner = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: "pixel-spin 1s steps(8) infinite" }}>
    <rect x="10" y="2" width="4" height="4" fill="currentColor" opacity="1"/>
    <rect x="16" y="4" width="4" height="4" fill="currentColor" opacity="0.8"/>
    <rect x="18" y="10" width="4" height="4" fill="currentColor" opacity="0.6"/>
    <rect x="16" y="16" width="4" height="4" fill="currentColor" opacity="0.5"/>
    <rect x="10" y="18" width="4" height="4" fill="currentColor" opacity="0.4"/>
    <rect x="4" y="16" width="4" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="2" y="10" width="4" height="4" fill="currentColor" opacity="0.2"/>
    <rect x="4" y="4" width="4" height="4" fill="currentColor" opacity="0.1"/>
    <style>
      {`
        @keyframes pixel-spin {
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </svg>
);

type ColorType = "primary" | "error" | "warning" | "success" | "neutral";
type SizeType = "sm" | "md" | "lg";

interface PixelButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  text: React.ReactNode;
  colorType?: ColorType;
  icon?: React.ReactNode;
  width?: string;
  size?: SizeType;
  className?: string;
}

const THEME_MAP: Record<ColorType, { bg: string; color: string; shadow: string; textShadow: string }> = {
  primary: { bg: "#7dd3fc", color: "#22d3ee", shadow: "#0ea5e9", textShadow: "#1e3a8a" },
  error: { bg: "#fca5a5", color: "#fef2f2", shadow: "#ef4444", textShadow: "#7f1d1d" },
  warning: { bg: "#fde047", color: "#fef08a", shadow: "#ca8a04", textShadow: "#713f12" },
  success: { bg: "#86efac", color: "#f0fdf4", shadow: "#22c55e", textShadow: "#14532d" },
  neutral: { bg: "#cbd5e1", color: "#f8fafc", shadow: "#94a3b8", textShadow: "#475569" },
};

const SIZE_MAP: Record<SizeType, { height: string; fontSize: string; padding: string }> = {
  sm: { height: "40px", fontSize: "14px", padding: "0 16px" },
  md: { height: "48px", fontSize: "16px", padding: "0 20px" },
  lg: { height: "56px", fontSize: "18px", padding: "0 24px" },
};

const getTextStroke = (color: string) => `
  2px 0 0 ${color},
  -2px 0 0 ${color},
  0 2px 0 ${color},
  0 -2px 0 ${color},
  2px 2px 0 ${color},
  -2px -2px 0 ${color},
  2px -2px 0 ${color},
  -2px 2px 0 ${color}
`;

export const PixelButton = ({
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = "로딩 중...",
  text,
  colorType = "primary",
  icon,
  width = "100%",
  size = "lg",
  className = "",
}: PixelButtonProps) => {
  const theme = THEME_MAP[colorType];
  const sizeStyles = SIZE_MAP[size];
  const pixelFont = "'CheckmatePixel', sans-serif";

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={className}
      style={{
        backgroundColor: theme.bg,
        color: theme.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        fontSize: sizeStyles.fontSize,
        height: sizeStyles.height,
        padding: sizeStyles.padding,
        width: width,
        border: "none",
        borderRadius: "6px",
        fontFamily: pixelFont,
        fontWeight: "900",
        letterSpacing: "1px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.7 : disabled ? 0.5 : 1,
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        boxShadow: `0 4px 0 ${theme.shadow}`,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.filter = "brightness(1.05)";
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.filter = "none";
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(4px)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow = `0 4px 0 ${theme.shadow}`;
        }
      }}
    >
      {isLoading ? (
        <PixelSpinner />
      ) : (
        <>
          {icon && <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>}
        </>
      )}
      <span
        style={{
          textShadow: getTextStroke(theme.textShadow),
          paddingTop: "2px",
        }}
      >
        {isLoading ? loadingText : text}
      </span>
    </button>
  );
};
