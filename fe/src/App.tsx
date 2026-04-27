import { useState, useEffect } from "react";
import { Settings, Shield, Star, Award, Coffee } from "lucide-react";

const App = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["factCheckEnabled"], (result) => {
        setIsEnabled(!!result.factCheckEnabled);
      });
    }
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ factCheckEnabled: newState });
    }
  };

  const fontSans = { fontFamily: "'Pretendard', -apple-system, blinkmacsystemfont, system-ui, sans-serif" };

  return (
    <div style={{
      width: "350px",
      height: "550px",
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      userSelect: "none",
      overflow: "hidden",
      ...fontSans
    }}>
      
      {/* 💳 대한민국 경찰 신분증 메인 프레임 */}
      <main 
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.5s ease",
          filter: isEnabled ? "none" : "grayscale(0.2) brightness(0.98)"
        }}
      >
        
        {/* 1. 💡 사용자 요청: 리얼 카드 빛 반사 효과 (Reflection) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 100, pointerEvents: "none", overflow: "hidden", borderRadius: "16px" }}>
           {/* 정적 광택 */}
           <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top right, transparent, rgba(255,255,255,0.05), rgba(255,255,255,0.2))", opacity: 0.4 }} />
           
           {/* 움직이는 글로우 (애니메이션) */}
           <div style={{ 
             position: "absolute", 
             top: 0, 
             left: "-150%", 
             width: "120%", 
             height: "200%", 
             background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)", 
             transform: "rotate(35deg)",
             animation: "card-glint 6s infinite ease-in-out"
           }} />
        </div>

        {/* 상단 파란색 패턴 */}
        <div style={{ 
          position: "absolute", top: 0, left: 0, width: "100%", height: "120px", 
          background: "linear-gradient(to bottom right, #0055aa, #003388)",
          clipPath: "polygon(0 0, 80% 0, 0 100%)" 
        }} />
        <div style={{ 
          position: "absolute", top: 0, left: 0, width: "100%", height: "110px", 
          backgroundColor: "#002266",
          clipPath: "polygon(0 0, 70% 0, 0 100%)" 
        }} />

        {/* 하단 파란색 배경 데코 */}
        <div style={{ 
          position: "absolute", bottom: 0, right: 0, width: "100%", height: "80px", 
          backgroundColor: "#0066cc", opacity: 0.1,
          clipPath: "polygon(100% 100%, 30% 100%, 100% 0)" 
        }} />
        <div style={{ 
          position: "absolute", bottom: 0, right: 0, width: "100%", height: "70px", 
          backgroundColor: "#0044bb",
          clipPath: "polygon(100% 100%, 20% 100%, 100% 0)" 
        }} />

        {/* 설정 버튼 */}
        <div 
          style={{ 
            position: "absolute", top: "16px", left: "16px", 
            color: isSettingsHovered ? "white" : "rgba(255,255,255,0.7)", 
            cursor: "pointer", zIndex: 120, transition: "all 0.3s",
            transform: isSettingsHovered ? "rotate(90deg)" : "none"
          }}
          onMouseEnter={() => setIsSettingsHovered(true)}
          onMouseLeave={() => setIsSettingsHovered(false)}
        >
           <Settings style={{ width: "20px", height: "20px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
        </div>

        {/* 배경 워터마크 로고 */}
        <div style={{ position: "absolute", top: "40%", right: "-10%", width: "240px", height: "240px", opacity: 0.04, pointerEvents: "none", transform: "rotate(15deg)" }}>
           <Shield style={{ width: "100%", height: "100%", color: "#1e3a8a", fill: "currentColor" }} />
        </div>

        {/* 카드 상단: 엠블럼 및 로고 */}
        <div style={{ position: "relative", zIndex: 10, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div style={{ 
            width: "40px", height: "40px", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50%", 
            display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" 
          }}>
            <Award style={{ width: "20px", height: "20px", color: "rgba(255,255,255,0.9)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
            <div style={{ width: "56px", height: "40px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Shield style={{ width: "36px", height: "36px", color: "#eab308", fill: "currentColor", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
              <Star style={{ position: "absolute", top: "6px", width: "12px", height: "12px", color: "#dc2626", fill: "currentColor" }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 900, fontStyle: "italic", color: "#002266", marginTop: "2px", letterSpacing: "0.15em", lineHeight: 1 }}>
              POLICE
            </span>
          </div>
        </div>

        {/* 중앙: 증명사진 (로고) */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", marginTop: "4px", padding: "0 56px" }}>
          <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "white", border: "1px solid #ccc", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", position: "relative", overflow: "hidden" }}>
            <img
              src="/logo.jpg"
              alt="Detective"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "8px",
                transition: "all 0.7s ease",
                transform: isEnabled ? "scale(1.05)" : "scale(1)",
                opacity: isEnabled ? 1 : 0.5,
                filter: isEnabled ? "none" : "blur(0.3px)",
                imageRendering: "pixelated"
              }}
            />
            {/* 사진 전용 반사 광택 */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top right, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.3))", pointerEvents: "none" }} />
            {!isEnabled && (
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "end", animation: "bounce 1s infinite" }}>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#a1a1aa", opacity: 0.7 }}>zZ</span>
              </div>
            )}
          </div>
        </div>

        {/* 하단: 이름 및 소속 */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", marginTop: "24px", gap: 0, flex: 1 }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#111", letterSpacing: "-0.05em", margin: 0, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }}>체크메이트</h2>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.25em", marginTop: "4px", opacity: 0.7 }}>
            Digital Investigator
          </span>

          {/* 메인 토글 */}
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div
              onClick={handleToggle}
              style={{
                width: "76px",
                height: "32px",
                borderRadius: "9999px",
                border: "1px solid #e4e4e7",
                position: "relative",
                cursor: "pointer",
                padding: "3px",
                transition: "all 0.3s",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                backgroundColor: isEnabled ? "#004499" : "#e4e4e7"
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "100%",
                  backgroundColor: "white",
                  borderRadius: "9999px",
                  border: "1px solid #eee",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  transform: isEnabled ? "translateX(42px)" : "translateX(0)"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              {isEnabled ? <Shield style={{ width: "14px", height: "14px", color: "#2563eb" }} /> : <Coffee style={{ width: "14px", height: "14px", color: "#a1a1aa" }} />}
              <span
                style={{ fontSize: "13px", fontWeight: isEnabled ? 900 : "bold", letterSpacing: "-0.025em", color: isEnabled ? "#1d4ed8" : "#a1a1aa" }}
              >
                {isEnabled ? "공무 수행 중" : "쉬는 중.."}
              </span>
            </div>
          </div>
        </div>

        {/* 최하단: 소속 문구 (FACT COP) */}
        <div style={{ marginTop: "auto", position: "relative", zIndex: 10, padding: "0 32px 20px 32px", display: "flex", justifyContent: "end" }}>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "white", fontStyle: "italic", letterSpacing: "0.1em", filter: "drop-shadow(2px 2px 0 rgba(0,0,0,0.3))" }}>
            FACT COP
          </span>
        </div>

        {/* 애니메이션 및 폰트 스타일 */}
        <style>{`
          @font-face {
            font-family: 'Pretendard';
            src: url('https://cdn.jsdelivr.net/gh/Project-Noornnu/pretendard-font@v1.1.0/Pretendard-ExtraBold.woff2') format('woff2');
          }
          
          @keyframes card-glint {
            0% { left: -150%; }
            30% { left: 150%; }
            100% { left: 150%; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
            50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
          }
        `}</style>
      </main>
    </div>
  );
};

export default App;
