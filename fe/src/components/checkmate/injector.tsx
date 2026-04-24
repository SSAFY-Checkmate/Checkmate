import { createRoot } from "react-dom/client";
import { AnalysisDashboard } from "./analysis-dashboard";
import styles from "../../index.css?inline";

/**
 * [FactCop 유튜브 인젝터]
 * 안정성을 최우선으로 하여 AnalysisDashboard를 주입합니다.
 */
export const renderDashboard = (container: HTMLElement) => {
  // 이미 주입된 루트가 있다면 중복 생성 방지
  if (container.querySelector("#checkmate-dashboard-root")) return;

  // 1. 루트 컨테이너 생성
  const rootContainer = document.createElement("div");
  rootContainer.id = "checkmate-dashboard-root";
  
  // Shadow DOM 생성
  const shadow = rootContainer.attachShadow({ mode: "open" });

  // 2. 스타일 주입 (Vite ?inline 기능을 활용한 자동 스타일 배달)
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    :host {
      display: block;
      width: 100%;
      margin-bottom: 16px;
    }
    ${styles}
  `;
  shadow.appendChild(styleElement);

  // 3. 리액트 루트용 래퍼 생성
  const reactWrapper = document.createElement("div");
  reactWrapper.className = "checkmate-injected-wrapper";
  reactWrapper.style.width = "100%";
  shadow.appendChild(reactWrapper);

  // 4. 리액트 렌더링
  container.appendChild(rootContainer);
  const root = createRoot(reactWrapper);
  root.render(<AnalysisDashboard className="w-full" />);
};
