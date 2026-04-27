/**
 * Checkmate Content Script - SPA 네비게이션 대응 및 중복 차단 버전
 */

if ((window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__) {
  console.warn("[Checkmate] 이미 콘텐츠 스크립트가 실행 중입니다.");
} else {
  (window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__ = true;
  console.log("[Checkmate] 콘텐츠 스크립트 로드됨! (v1.8 - SPA 대응)");

  const runCheckmate = async () => {
    const { renderDashboard } = await import("./components/checkmate/injector");

    let isEnabled = false;
    let observer: MutationObserver | null = null;

    const initStorage = async () => {
      const result = await chrome.storage.local.get(["factCheckEnabled"]);
      isEnabled = result.factCheckEnabled !== undefined ? !!result.factCheckEnabled : true;
      
      if (isEnabled) {
        startInfection();
      }

      chrome.storage.onChanged.addListener((changes) => {
        if (changes.factCheckEnabled) {
          isEnabled = !!changes.factCheckEnabled.newValue;
          if (isEnabled) startInfection();
          else stopInfection();
        }
      });
    };

    const startInfection = () => {
      // 1. 초기 실행
      runInjections();

      // 2. DOM 변경 감지 (SPA 네비게이션 대응)
      if (!observer) {
        observer = new MutationObserver(() => runInjections());
        observer.observe(document.body, { childList: true, subtree: true });
      }

      // 3. 유튜브 고유 네비게이션 이벤트 감지 (더 빠른 대응)
      window.removeEventListener("yt-navigate-finish", runInjections);
      window.addEventListener("yt-navigate-finish", runInjections);
    };

    const stopInfection = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      window.removeEventListener("yt-navigate-finish", runInjections);
      // 모든 주입된 컨테이너 제거
      document.querySelectorAll(".checkmate-root-container, .checkmate-side-panel-container-v1.7").forEach(el => el.remove());
    };

    const runInjections = () => {
      if (!isEnabled) return;

      const isWatchPage = window.location.pathname === "/watch";
      const isShortsPage = window.location.pathname.startsWith("/shorts");

      // 서랍(SidePanel)은 항상 주입 시도 (중복 체크는 injectSidePanel 내부에서 수행)
      injectSidePanel();

      if (isWatchPage) {
        injectToWatchPage();
      } else if (isShortsPage) {
        injectToShortsPage();
      } else {
        // 시청 페이지가 아니면 사이드바 카드만 제거 (서랍은 유지 가능)
        document.querySelectorAll(".checkmate-root-container").forEach(el => {
          if (el.id !== "checkmate-side-panel-root-v1.7") {
            el.remove();
          }
        });
      }
    };

    const injectSidePanel = () => {
      if (document.getElementById("checkmate-side-panel-root-v1.7")) return;
      
      const container = document.createElement("div");
      container.id = "checkmate-side-panel-root-v1.7";
      container.className = "checkmate-side-panel-container-v1.7";
      document.body.appendChild(container);
      renderDashboard(container, true);
    };

    const injectToWatchPage = () => {
      const sidebar = document.querySelector("#secondary-inner") || document.querySelector("#secondary");
      if (document.getElementById("checkmate-watch-card-v1.8")) return;

      if (sidebar) {
        // 이전 카드 청소
        document.querySelectorAll(".checkmate-root-container").forEach(el => {
          if (!el.id.includes("side-panel")) el.remove();
        });

        const container = document.createElement("div");
        container.id = "checkmate-watch-card-v1.8";
        container.className = "checkmate-root-container";
        container.style.width = "100%";
        sidebar.prepend(container);
        renderDashboard(container, false);
      }
    };

    const injectToShortsPage = () => {
      const activeShortsActions = document.querySelector("ytd-reel-video-renderer[is-active] #actions-inner");
      if (document.getElementById("checkmate-shorts-card-v1.8")) return;

      if (activeShortsActions) {
        document.querySelectorAll(".checkmate-root-container").forEach(el => {
          if (!el.id.includes("side-panel")) el.remove();
        });
        const container = document.createElement("div");
        container.id = "checkmate-shorts-card-v1.8";
        container.className = "checkmate-root-container";
        container.style.width = "100%";
        activeShortsActions.prepend(container);
        renderDashboard(container, false);
      }
    };

    // 초기화 시작
    if (!document.body) {
      window.addEventListener("DOMContentLoaded", initStorage);
    } else {
      initStorage();
    }
  };

  runCheckmate();
}
