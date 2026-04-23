import { useState, useEffect } from "react";
import { Settings, Shield, Star, Award, Coffee } from "lucide-react";
import { cn } from "./lib/utils";

const App = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

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

  return (
    <div className="w-[350px] h-[550px] bg-[#f0f0f0] flex items-center justify-center p-3 select-none overflow-hidden font-sans">
      
      {/* 💳 대한민국 경찰 신분증 메인 프레임 */}
      <main className={cn(
        "w-full h-full bg-white border-[1px] border-[#ddd] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden transition-all duration-500 group",
        !isEnabled && "grayscale-[0.2] brightness-[0.98]"
      )}>
        
        {/* 1. 💡 사용자 요청: 리얼 카드 빛 반사 효과 (Reflection) */}
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden rounded-2xl">
           {/* 정적 광택 */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-40" />
           
           {/* 움직이는 글로우 (마우스 호버 또는 주기적 애니메이션) */}
           <div className="absolute top-0 -left-[150%] w-[120%] h-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-[35deg] transition-all duration-1000 group-hover:left-[150%] animate-[card-glint_6s_infinite_ease-in-out]" />
        </div>

        {/* 상단 파란색 패턴 */}
        <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-br from-[#0055aa] to-[#003388]" 
          style={{ clipPath: "polygon(0 0, 80% 0, 0 100%)" }} 
        />
        <div className="absolute top-0 left-0 w-full h-[110px] bg-[#002266]" 
          style={{ clipPath: "polygon(0 0, 70% 0, 0 100%)" }} 
        />

        {/* 하단 파란색 배경 데코 */}
        <div className="absolute bottom-0 right-0 w-full h-[80px] bg-[#0066cc] opacity-10" 
          style={{ clipPath: "polygon(100% 100%, 30% 100%, 100% 0)" }} 
        />
        <div className="absolute bottom-0 right-0 w-full h-[70px] bg-[#0044bb]" 
          style={{ clipPath: "polygon(100% 100%, 20% 100%, 100% 0)" }} 
        />

        {/* 설정 버튼 (좌측 상단으로 이동하여 로고와 겹침 방지) */}
        <div className="absolute top-4 left-4 text-white/70 hover:text-white cursor-pointer z-[120] transition-all hover:rotate-90">
           <Settings className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        </div>

        {/* 배경 워터마크 로고 */}
        <div className="absolute top-[40%] right-[-10%] w-60 h-60 opacity-[0.04] pointer-events-none rotate-[15deg]">
           <Shield className="w-full h-full text-blue-900 fill-current" />
        </div>

        {/* 카드 상단: 엠블럼 및 로고 */}
        <div className="relative z-10 p-5 flex justify-between items-start">
          <div className="w-10 h-10 border-[2px] border-white/40 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md">
            <Award className="w-5 h-5 text-white/90" />
          </div>
          <div className="flex flex-col items-end">
            <div className="w-14 h-10 relative flex justify-center items-center">
              <Shield className="w-9 h-9 text-yellow-500 fill-current drop-shadow-md" />
              <Star className="absolute top-1.5 w-3 h-3 text-red-600 fill-current" />
            </div>
            <span className="text-[14px] font-black italic text-[#002266] mt-0.5 tracking-widest leading-none">
              POLICE
            </span>
          </div>
        </div>

        {/* 중앙: 증명사진 (로고) */}
        <div className="relative z-10 flex flex-col items-center mt-1 px-14">
          <div className="w-full aspect-square bg-white border-[1px] border-[#ccc] shadow-lg relative overflow-hidden group/photo">
            <img
              src="/logo.jpg"
              alt="Detective"
              className={cn(
                "w-full h-full object-contain p-2 transition-all duration-700",
                isEnabled ? "scale-105" : "scale-100 opacity-50 blur-[0.3px]",
              )}
              style={{ imageRendering: "pixelated" }}
            />
            {/* 사진 전용 반사 광택 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
            {!isEnabled && (
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end animate-bounce">
                <span className="text-[12px] font-bold text-zinc-400 opacity-70 font-sans">zZ</span>
              </div>
            )}
          </div>
        </div>

        {/* 하단: 이름 및 소속 */}
        <div className="relative z-10 flex flex-col items-center mt-6 gap-0 flex-1">
          <h2 className="text-[32px] font-extrabold text-[#111] tracking-tighter drop-shadow-sm font-sans">체크메이트</h2>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.25em] mt-1 opacity-70">
            Digital Investigator
          </span>

          {/* 메인 토글 */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <div
              onClick={handleToggle}
              className={cn(
                "w-[76px] h-8 rounded-full border-[1px] border-zinc-200 relative cursor-pointer p-[3px] transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]",
                isEnabled ? "bg-[#004499]" : "bg-zinc-200",
              )}
            >
              <div
                className={cn(
                  "w-7 h-full bg-white rounded-full border-[1px] border-[#eee] transition-all duration-300 shadow-lg",
                  isEnabled ? "translate-x-[42px]" : "translate-x-0",
                )}
              />
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              {isEnabled ? <Shield className="w-3.5 h-3.5 text-blue-600" /> : <Coffee className="w-3.5 h-3.5 text-zinc-400" />}
              <span
                className={cn("text-[13px] font-bold tracking-tight", isEnabled ? "text-blue-700 font-black" : "text-zinc-400")}
              >
                {isEnabled ? "공무 수행 중" : "쉬는 중.."}
              </span>
            </div>
          </div>
        </div>

        {/* 최하단: 소속 문구 (FACT COP) */}
        <div className="mt-auto relative z-10 px-8 pb-5 flex justify-end">
          <span className="text-[20px] font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)] italic tracking-widest font-sans">
            FACT COP
          </span>
        </div>

        {/* 애니메이션 및 폰트 스타일 */}
        <style>{`
          @font-face {
            font-family: 'Pretendard';
            src: url('https://cdn.jsdelivr.net/gh/Project-Noornnu/pretendard-font@v1.1.0/Pretendard-ExtraBold.woff2') format('woff2');
          }
          .font-sans { font-family: 'Pretendard', -apple-system, blinkmacsystemfont, system-ui, sans-serif; }
          
          @keyframes card-glint {
            0% { left: -150%; }
            30% { left: 150%; }
            100% { left: 150%; }
          }
        `}</style>
      </main>
    </div>
  );
};

export default App;
