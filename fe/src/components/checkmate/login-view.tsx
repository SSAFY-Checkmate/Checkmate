import { useEffect, useState } from "react";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { useCheckmateStore, initializeAuth } from "../../lib/store";
import { PixelCharacter } from "./pixel-character";
import { motion } from "framer-motion";

const PixelSpinner = () => (
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

/**
 * [Checkmate 로그인 뷰]
 * 로그인하지 않은 사용자에게 보여주는 화면
 */
export const LoginView = () => {
  const { setLoginStatus } = useCheckmateStore();
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoginError(false);
    setIsLoading(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // 백엔드 주소를 환경변수에서 가져오고, 없으면 기본값으로 localhost:8080 사용
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const oauthUrl = `${baseUrl}/oauth2/authorization/google`;

    // 1. 서버가 살아있는지 핑(Ping) 테스트
    try {
      // 서버가 꺼져 있으면 바로 Network Error가 발생하여 catch로 넘어갑니다.
      await fetch(baseUrl, { method: "GET", mode: "no-cors" });
    } catch (error) {
      console.error("서버 연결 실패:", error);
      setLoginError(true); // 팝업 열지 않고 즉시 에러 UI 표시!
      setIsLoading(false);
      return;
    }

    // 2. 서버가 살아있다면 정상적으로 팝업 열기
    const popup = window.open(
      oauthUrl,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // 팝업 닫힘 감지 로직 (에러 처리)
    if (popup) {
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          // 팝업이 닫힌 후 잠깐 대기 (스토어 업데이트 시간 확보)
          setTimeout(() => {
            const { isLoggedIn } = useCheckmateStore.getState();
            if (!isLoggedIn) {
              setLoginError(true);
            }
            setIsLoading(false); // 팝업 닫히면 로딩 해제
          }, 300);
        }
      }, 500);
    } else {
      // 팝업 차단 등으로 열리지 않았을 때
      setIsLoading(false);
      setLoginError(true);
    }
  };

  // 팝업창에서 보내는 로그인 성공 메시지 리스너
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_SUCCESS") {
        console.log("OAuth Success: fetching user profile...");
        await initializeAuth();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setLoginStatus]);

  const pixelFont = "'CheckmatePixel', sans-serif";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        ...PIXEL_STYLES.border,
        ...PIXEL_STYLES.mainCard,
        position: "relative",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: pixelFont,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        backgroundColor: "#f4f4f5",
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        style={{
          position: "relative",
          zIndex: 10,
          ...PIXEL_STYLES.border,
          background: "#ffffff",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          width: "100%",
          boxShadow: loginError 
            ? "0 10px 25px rgba(220, 38, 38, 0.1), inset 0 0 0 2px rgba(239, 68, 68, 0.1)"
            : "0 10px 25px rgba(0, 110, 220, 0.1), inset 0 0 0 2px rgba(14, 165, 233, 0.1)",
          border: loginError ? "4px solid #ef4444" : "4px solid #0ea5e9",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "4px",
            borderRadius: "4px",
            boxShadow: loginError ? "0 4px 0 #dc2626" : "0 4px 0 #0284c7",
          }}
        >
          <div
            style={{
              backgroundColor: loginError ? "#fee2e2" : "#e0f2fe",
              border: loginError ? "2px solid #ef4444" : "2px solid #0ea5e9",
              borderRadius: "2px",
              padding: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "64px",
              height: "64px"
            }}
          >
            {loginError ? (
              <img 
                src={chrome.runtime?.getURL ? chrome.runtime.getURL("pixel-warning.png") : "/pixel-warning.png"} 
                alt="Warning" 
                width="56" 
                height="56" 
                style={{ imageRendering: "pixelated" }} 
              />
            ) : (
              <PixelCharacter size="md" />
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "24px",
              margin: 0,
              color: loginError ? "#f87171" : "#22d3ee",
              fontWeight: "900",
              fontFamily: pixelFont,
              letterSpacing: "2px",
              textShadow: loginError
                ? `
                  2px 0 0 #7f1d1d,
                  -2px 0 0 #7f1d1d,
                  0 2px 0 #7f1d1d,
                  0 -2px 0 #7f1d1d,
                  2px 2px 0 #7f1d1d,
                  -2px -2px 0 #7f1d1d,
                  2px -2px 0 #7f1d1d,
                  -2px 2px 0 #7f1d1d
                `
                : `
                  2px 0 0 #1e3a8a,
                  -2px 0 0 #1e3a8a,
                  0 2px 0 #1e3a8a,
                  0 -2px 0 #1e3a8a,
                  2px 2px 0 #1e3a8a,
                  -2px -2px 0 #1e3a8a,
                  2px -2px 0 #1e3a8a,
                  -2px 2px 0 #1e3a8a
                `,
            }}
          >
            {loginError ? "ERROR" : "WELCOME"}
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: loginError ? "#991b1b" : "#334155",
              lineHeight: "1.5",
              margin: 0,
              fontWeight: "bold",
              fontFamily: pixelFont,
            }}
          >
            {loginError ? (
              <>
                로그인에 실패했습니다.<br />
                다시 시도해 주세요.
              </>
            ) : (
              <>
                안전한 영상 시청을 위해<br />
                로그인해 주세요.
              </>
            )}
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: loginError ? "#fca5a5" : "#7dd3fc",
            color: loginError ? "#fef2f2" : "#22d3ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "18px",
            height: "56px",
            padding: "0 24px",
            width: "100%",
            border: "none",
            borderRadius: "6px",
            fontFamily: pixelFont,
            fontWeight: "900",
            letterSpacing: "1px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
            boxShadow: loginError ? "0 4px 0 #ef4444" : "0 4px 0 #0ea5e9",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.filter = "brightness(1.05)";
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.filter = "none";
          }}
          onMouseDown={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = "translateY(4px)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
          onMouseUp={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = loginError ? "0 4px 0 #ef4444" : "0 4px 0 #0ea5e9";
            }
          }}
        >
          {isLoading ? (
            <PixelSpinner />
          ) : !loginError ? (
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ filter: "drop-shadow(2px 2px 0 rgba(30, 58, 138, 0.5))" }}>
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
          ) : null}
          <span
            style={{
              textShadow: loginError 
                ? `
                  2px 0 0 #7f1d1d,
                  -2px 0 0 #7f1d1d,
                  0 2px 0 #7f1d1d,
                  0 -2px 0 #7f1d1d,
                  2px 2px 0 #7f1d1d,
                  -2px -2px 0 #7f1d1d,
                  2px -2px 0 #7f1d1d,
                  -2px 2px 0 #7f1d1d
                `
                : `
                  2px 0 0 #1e3a8a,
                  -2px 0 0 #1e3a8a,
                  0 2px 0 #1e3a8a,
                  0 -2px 0 #1e3a8a,
                  2px 2px 0 #1e3a8a,
                  -2px -2px 0 #1e3a8a,
                  2px -2px 0 #1e3a8a,
                  -2px 2px 0 #1e3a8a
                `,
              paddingTop: "2px",
            }}
          >
          {isLoading ? "로딩 중..." : loginError ? "다시 시도하기" : "Google 로그인"}
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};
