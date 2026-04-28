import { useEffect } from "react";
import { useCheckmateStore, initializeAuth } from "../../lib/store";

const OAuthRedirect = () => {
  const setLoginStatus = useCheckmateStore((state) => state.setLoginStatus);

  useEffect(() => {
    const handleRedirect = async () => {
      // 1. 팝업 창으로 열렸다면 부모 창으로 메시지를 보내고 닫기
      if (window.opener) {
        window.opener.postMessage({ type: "OAUTH_SUCCESS" }, "*");
        window.close();
      } else {
        // 2. 일반 웹 탭으로 열렸다면 본인이 직접 인증 정보를 페칭하고 메인 탭으로 이동
        await initializeAuth();
        window.location.href = "/";
      }
    };
    
    handleRedirect();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f4f5", fontFamily: "'CheckmatePixel', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ color: "#0ea5e9" }}>로그인 처리 중...</h2>
        <p style={{ color: "#71717a" }}>잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;
