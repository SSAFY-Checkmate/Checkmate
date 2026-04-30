import { useEffect, useState } from "react";
import { PIXEL_STYLES } from "../../lib/constants/styles";
import { useCheckmateStore, initializeAuth } from "../../lib/store";
import { PixelCharacter } from "./pixel-character";
import { motion } from "framer-motion";
import { PixelButton } from "../common/pixel-button";
import { GoogleIcon } from "../common/icons";

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

  // 마운트 시 인증 상태 복원 (새로고침 대응) 및 팝업창 성공 메시지 리스너
  useEffect(() => {
    // 1. 페이지 로드 시 즉시 쿠키 기반 인증 상태 확인 (자동 로그인)
    initializeAuth();

    // 2. 팝업창에서 보내는 로그인 성공 메시지 리스너
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_SUCCESS") {
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

        <PixelButton
          onClick={handleGoogleLogin}
          isLoading={isLoading}
          colorType={loginError ? "error" : "primary"}
          text={loginError ? "다시 시도하기" : "Google 로그인"}
          icon={!loginError && <GoogleIcon size={20} />}
        />
      </motion.div>
    </motion.div>
  );
};
