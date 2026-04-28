import { PIXEL_STYLES, COLORS } from "../../lib/constants/styles";
import { useCheckmateStore } from "../../lib/store";
import { PixelCharacter } from "./pixel-character";
import { motion } from "framer-motion";

/**
 * [Checkmate 로그인 뷰]
 * 로그인하지 않은 사용자에게 보여주는 화면 (둥근모 폰트 적용 버전)
 */
export const LoginView = () => {
  const { setLoginStatus } = useCheckmateStore();

  const handleGoogleLogin = () => {
    const mockUser = {
      name: "사용자",
      email: "user@example.com",
      picture: "https://api.dicebear.com/7.x/pixel-art/svg?seed=user",
    };
    setLoginStatus(true, mockUser);
  };

  const pixelFont = "'CheckmatePixel', sans-serif";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        ...PIXEL_STYLES.border,
        ...PIXEL_STYLES.mainCard, // 너비 복구 (100% 대응)
        position: "relative",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: pixelFont,
        background: `
          linear-gradient(135deg, #2d1b4e 0%, #1a1033 100%),
          repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px),
          repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px)
        `,
        backgroundSize: "100%, 20px 20px, 20px 20px",
        gap: "24px",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        overflow: "hidden",
      }}
    >
      {/* 장식용 사이드 픽셀 */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, backgroundColor: "#fde047" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, backgroundColor: "#3b82f6" }} />

      {/* 중앙 캐릭터 영역 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "4px",
          ...PIXEL_STYLES.border,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "2px double #e2e8f0",
            padding: "12px",
          }}
        >
          <PixelCharacter size="md" />
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2
          style={{
            fontSize: "20px",
            margin: 0,
            color: "#fde047",
            fontWeight: "normal",
            textShadow: "1px 1px 0 #854d0e",
            fontFamily: pixelFont,
          }}
        >
          LOG IN REQUIRED
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#cbd5e1",
            lineHeight: "1.4",
            margin: 0,
            fontFamily: pixelFont,
          }}
        >
          로그인 후 정밀 분석 기능을<br />
          이용하실 수 있습니다.
        </p>
      </div>

      {/* 구글 로그인 버튼 */}
      <button
        onClick={handleGoogleLogin}
        style={{
          ...PIXEL_STYLES.btnBase,
          backgroundColor: "#fde047",
          color: "#000000",
          display: "flex",
          gap: "12px",
          fontSize: "16px",
          height: "52px",
          padding: "0 24px",
          boxShadow: "0 4px 0 #ca8a04",
          border: "none",
          fontFamily: pixelFont,
          transition: "all 0.1s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#facc15")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fde047")}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(2px)";
          e.currentTarget.style.boxShadow = "0 2px 0 #ca8a04";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow = "0 4px 0 #ca8a04";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span style={{ fontWeight: "bold" }}>Google 로그인</span>
      </button>

      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          opacity: 0.8,
          fontFamily: pixelFont,
        }}
      >
        이용 약관 및 개인정보 처리방침
      </div>
    </motion.div>
  );
};
