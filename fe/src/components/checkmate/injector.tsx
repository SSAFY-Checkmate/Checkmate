import { createRoot } from "react-dom/client";
import { AnalysisDashboard } from "./analysis-dashboard";
import styles from "../../index.css?inline";

/**
 * [Checkmate 유튜브 인젝터 - v3.0 단일 카드 버전]
 */
/**
 * [Checkmate 글로벌 폰트 주입]
 * Shadow DOM 외부(Main Head)에 폰트를 선언하여 CSP 및 격리 문제를 해결합니다.
 */
const injectGlobalFont = () => {
  const fontId = "checkmate-global-font";
  if (document.getElementById(fontId)) return;

  const style = document.createElement("style");
  style.id = fontId;
  style.textContent = `
    @font-face {
      font-family: 'CheckmatePixel';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
};

export const renderDashboard = (container: HTMLElement) => {
  injectGlobalFont(); // 폰트 먼저 주입
  const rootId = "checkmate-dashboard-root";
  if (container.querySelector(`#${rootId}`)) return;

  const rootContainer = document.createElement("div");
  rootContainer.id = rootId;
  rootContainer.style.width = "100%";
  rootContainer.style.display = "block";
  rootContainer.style.position = "relative";

  // 1. Shadow DOM 생성 (격리벽 설치)
  const shadow = rootContainer.attachShadow({ mode: "open" });

  // 2. 스타일 주입
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    @font-face {
      font-family: 'DungGeunMo';
      src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/DungGeunMo.woff') format('woff');
      font-weight: normal;
      font-style: normal;
    }
    
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    
    :host {
      all: initial !important;
      display: block !important;
      width: 100% !important;
      height: auto !important;
      position: relative !important;
      overflow: visible !important;
      font-family: 'CheckmatePixel', sans-serif !important;
    }
    .checkmate-injected-wrapper {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      pointer-events: auto !important;
      image-rendering: pixelated !important;
      font-family: 'CheckmatePixel', sans-serif !important;
    }
    ${styles}
  `;
  shadow.appendChild(styleElement);

  const reactWrapper = document.createElement("div");
  reactWrapper.className = "checkmate-injected-wrapper";
  shadow.appendChild(reactWrapper);

  // [중요] 키보드 이벤트가 유튜브로 전파되는 것을 차단 (단축키 충돌 방지)
  const stopPropagation = (e: KeyboardEvent) => e.stopPropagation();
  reactWrapper.addEventListener("keydown", stopPropagation, true);
  reactWrapper.addEventListener("keyup", stopPropagation, true);
  reactWrapper.addEventListener("keypress", stopPropagation, true);

  container.appendChild(rootContainer);

  try {
    const root = createRoot(reactWrapper);
    root.render(<AnalysisDashboard />);
  } catch (err) {
    console.error("[Checkmate] 렌더링 에러:", err);
  }
};

import { GlobalResultModal } from "./shorts-dashboard";
import { ReportModal } from "./report-modal";

/**
 * [Checkmate 글로벌 결과 모달 렌더러]
 * 유튜브 영상 프레임 외부(document.body)에 독립적인 모달 루트를 생성합니다.
 */
export const renderGlobalModal = () => {
  const rootId = "checkmate-global-modal-root";
  if (document.getElementById(rootId)) return;

  const rootContainer = document.createElement("div");
  rootContainer.id = rootId;
  rootContainer.style.display = "none"; // 기본 숨김 (클릭 방해 방지)
  
  const shadow = rootContainer.attachShadow({ mode: "open" });
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    :host { 
      position: fixed !important; 
      top: 0 !important; 
      left: 0 !important; 
      width: 100vw !important; 
      height: 100vh !important; 
      z-index: 2147483647 !important; 
      pointer-events: none !important; 
    }
    :host(.modal-open) { 
      pointer-events: auto !important; 
    }
    ${styles}
  `;
  shadow.appendChild(styleElement);
  
  const reactWrapper = document.createElement("div");
  
  // [중요] 글로벌 모달 영역에서도 키보드 이벤트 차단
  const stopPropagation = (e: KeyboardEvent) => e.stopPropagation();
  reactWrapper.addEventListener("keydown", stopPropagation, true);
  reactWrapper.addEventListener("keyup", stopPropagation, true);
  reactWrapper.addEventListener("keypress", stopPropagation, true);

  shadow.appendChild(reactWrapper);
  document.body.appendChild(rootContainer);

  try {
    const root = createRoot(reactWrapper);
    root.render(
      <>
        <GlobalResultModal shadowHost={rootContainer} />
        <ReportModal shadowHost={rootContainer} />
      </>
    );
  } catch (err) {
    console.error("[Checkmate] 글로벌 모달 렌더링 에러:", err);
  }
};
