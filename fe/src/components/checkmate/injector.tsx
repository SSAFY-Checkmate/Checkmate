import { createRoot } from "react-dom/client";
import { AnalysisDashboard } from "./analysis-dashboard";
import styles from "../../index.css?inline";

/**
 * [Checkmate 유튜브 인젝터 - v3.0 단일 카드 버전]
 */
export const renderDashboard = (container: HTMLElement) => {
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
    :host {
      all: initial !important;
      display: block !important;
      width: 100% !important;
      height: auto !important;
      position: relative !important;
      overflow: visible !important;
    }
    .checkmate-injected-wrapper {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      pointer-events: auto !important;
      image-rendering: pixelated !important;
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
    root.render(<AnalysisDashboard />);
  } catch (err) {
    console.error("[Checkmate] 렌더링 에러:", err);
  }
};
