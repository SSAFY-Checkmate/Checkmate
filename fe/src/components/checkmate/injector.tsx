import ReactDOM from "react-dom/client";
import { AnalysisDashboard } from "./analysis-dashboard";

/**
 * 특정 컨테이너에 Shadow DOM을 생성하고 리액트 컴포넌트를 렌더링합니다.
 * @param container 주입될 타겟 엘리먼트 (checkmate-root)
 */
export const renderDashboard = (container: HTMLElement) => {
  // 이미 Shadow Root가 있다면 중복 생성 방지
  if (container.shadowRoot) return;

  // 1. Shadow Root 생성 (open 모드로 설정하여 JS 접근 허용)
  const shadow = container.attachShadow({ mode: "open" });

  // 2. 리액트 앱이 담길 내부 컨테이너 생성
  const rootContainer = document.createElement("div");
  rootContainer.id = "checkmate-dashboard-inner";

  // 3. Shadow DOM 내부에 스타일 주입 (Vite가 생성한 스타일을 Shadow DOM으로 복제)
  // 메인 문서에 주입된 스타일을 찾아서 Shadow DOM 안으로 복사합니다.
  const styles = document.querySelectorAll('link[rel="stylesheet"], style');
  styles.forEach((s) => {
    shadow.appendChild(s.cloneNode(true));
  });

  const style = document.createElement("style");
  style.textContent = `
    :host {
      display: block;
      width: 100%;
      margin-bottom: 20px;
      z-index: 9999;
    }
    #checkmate-dashboard-inner {
      display: block;
      width: 100%;
      font-family: 'Pretendard', sans-serif;
    }
    .checkmate-injected-wrapper {
      width: 100%;
      box-sizing: border-box;
    }
  `;

  shadow.appendChild(style);
  shadow.appendChild(rootContainer);

  // 4. 리액트 렌더링
  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <div className="checkmate-injected-wrapper">
      <AnalysisDashboard />
    </div>,
  );
};
