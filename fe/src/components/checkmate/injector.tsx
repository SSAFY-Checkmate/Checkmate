import { createRoot } from "react-dom/client";
import { AnalysisDashboard } from "./analysis-dashboard";
import styles from "../../index.css?inline";

/**
 * [Checkmate 유튜브 인젝터 - 완벽 격리 버전]
 * 유튜브의 기존 DOM과 스타일을 절대 건드리지 않도록 Shadow DOM을 사용합니다.
 */
export const renderDashboard = (container: HTMLElement, isPanelMode: boolean = false) => {
  const rootId = isPanelMode ? "checkmate-side-panel-root" : "checkmate-dashboard-root";
  if (container.querySelector(`#${rootId}`)) return;

  const rootContainer = document.createElement("div");
  rootContainer.id = rootId;
  rootContainer.style.width = isPanelMode ? "auto" : "100%";
  rootContainer.style.display = "block";
  rootContainer.style.position = isPanelMode ? "fixed" : "relative";
  if (isPanelMode) {
    rootContainer.style.top = "0";
    rootContainer.style.right = "0";
    rootContainer.style.zIndex = "2147483647";
    rootContainer.style.pointerEvents = "none"; // 서랍이 닫혀있을 때 클릭 방해 금지
  }

  // 1. Shadow DOM 생성 (격리벽 설치)
  const shadow = rootContainer.attachShadow({ mode: "open" });

  // 2. 스타일 주입 (Shadow DOM 내부로 한정)
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    :host {
      display: block;
      width: ${isPanelMode ? "100%" : "100%"};
      height: ${isPanelMode ? "100vh" : "auto"};
      position: ${isPanelMode ? "fixed" : "relative"};
      top: 0;
      right: 0;
      overflow: visible;
      pointer-events: none;
      all: initial; /* 외부 스타일 차단 */
      display: block; /* all: initial 이후 명시적 재선언 */
    }
    .checkmate-injected-wrapper {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: auto; /* 내부 요소는 클릭 가능하게 */
      image-rendering: pixelated;
    }
    ${styles}
  `;
  shadow.appendChild(styleElement);

  const reactWrapper = document.createElement("div");
  reactWrapper.className = "checkmate-injected-wrapper";
  shadow.appendChild(reactWrapper);

  container.appendChild(rootContainer);

  try {
    const root = createRoot(reactWrapper);
    root.render(<AnalysisDashboard isPanelMode={isPanelMode} />);
  } catch (err) {
    console.error("[Checkmate] 렌더링 에러:", err);
  }
};
