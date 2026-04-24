/**
 * Checkmate Content Script
 * 유튜브 페이지의 변화를 감지하고 분석 대시보드를 주입하는 핵심 엔진
 */
console.log("[Checkmate] 콘텐츠 스크립트 로드됨! (v1.1)");

import { renderDashboard } from "./components/checkmate/injector";

let isEnabled = false;
let observer: MutationObserver | null = null;

/**
 * 스토리지에서 현재 활성화 상태를 가져오고 변경을 감지합니다.
 */
const initStorage = async () => {
  const result = await chrome.storage.local.get(["factCheckEnabled"]);
  isEnabled = !!result.factCheckEnabled;

  if (isEnabled) startInfection();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.factCheckEnabled) {
      isEnabled = !!changes.factCheckEnabled.newValue;
      if (isEnabled) {
        startInfection();
      } else {
        stopInfection();
      }
    }
  });
};

/**
 * 유튜브 DOM을 감시하여 주입 지점이 나타나면 대시보드를 렌더링합니다.
 */
const startInfection = () => {
  console.log("[Checkmate] 수사 시작...");

  // 이미 감시 중이라면 중복 방지
  if (observer) return;

  // 초기 로드 시 시도
  injectToWatchPage();
  injectToShortsPage();

  // DOM 변화 감시 (유튜브는 SPA라 페이지 이동 시 엘리먼트가 동적으로 생성됨)
  observer = new MutationObserver(() => {
    injectToWatchPage();
    injectToShortsPage();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/**
 * 기능을 정지하고 주입된 UI를 제거합니다.
 */
const stopInfection = () => {
  console.log("[Checkmate] 수사 중지...");
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // 주입된 모든 요소 제거
  const injected = document.querySelectorAll("checkmate-root");
  injected.forEach((el) => el.remove());
};

/**
 * 일반 영상(Watch) 페이지의 사이드바에 주입합니다.
 */
const injectToWatchPage = () => {
  const sidebar = document.querySelector("#secondary-inner");

  // 사이드바가 존재하고 아직 우리 대시보드가 주입되지 않았다면 실행
  if (sidebar && !sidebar.querySelector("checkmate-root")) {
    const container = document.createElement("checkmate-root");
    container.style.display = "block";
    container.style.width = "100%";
    container.style.marginBottom = "16px";
    
    // 사이드바 최상단에 삽입
    sidebar.prepend(container);

    // Shadow DOM을 통한 대시보드 렌더링
    renderDashboard(container);
  }
};

/**
 * 쇼츠(Shorts) 페이지의 액션 바 영역에 주입합니다.
 */
const injectToShortsPage = () => {
  // 현재 활성화된 쇼츠 영상의 액션 버튼 영역 탐색
  const activeShortsActions = document.querySelector("ytd-reel-video-renderer[is-active] #actions-inner");

  if (activeShortsActions && !activeShortsActions.querySelector("checkmate-root")) {
    const container = document.createElement("checkmate-root");
    container.classList.add("checkmate-shorts-wrapper");
    container.style.display = "block";
    container.style.width = "100%";
    container.style.marginBottom = "8px";

    // 액션 바 최상단에 삽입
    activeShortsActions.prepend(container);

    // Shadow DOM을 통한 대시보드 렌더링
    renderDashboard(container);
  }
};

// 엔진 가동
initStorage();
