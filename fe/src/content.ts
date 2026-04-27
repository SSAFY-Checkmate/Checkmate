/**
 * Checkmate Content Script - v3.0 (단일 확장형 카드 방식)
 */

if ((window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__) {
  console.warn("[Checkmate] 이미 콘텐츠 스크립트가 실행 중입니다.");
} else {
  (window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__ = true;
  console.log("[Checkmate] 콘텐츠 스크립트 로드됨! (v3.0 - Expandable Card)");

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
      runInjections();

      if (!observer) {
        observer = new MutationObserver(() => runInjections());
        observer.observe(document.body, { childList: true, subtree: true });
      }

      window.removeEventListener("yt-navigate-finish", runInjections);
      window.addEventListener("yt-navigate-finish", runInjections);
    };

    const stopInfection = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      window.removeEventListener("yt-navigate-finish", runInjections);
      document.querySelectorAll(".checkmate-root-container").forEach(el => el.remove());
    };

    const runInjections = () => {
      if (!isEnabled) return;

      const isWatchPage = window.location.pathname === "/watch";
      const isShortsPage = window.location.pathname.startsWith("/shorts");

      if (isWatchPage) {
        injectToWatchPage();
      } else if (isShortsPage) {
        injectToShortsPage();
      } else {
        document.querySelectorAll(".checkmate-root-container").forEach(el => el.remove());
      }
    };

    const injectToWatchPage = () => {
      const sidebar = document.querySelector("#secondary-inner") || document.querySelector("#secondary");
      if (document.getElementById("checkmate-watch-card-v3.0")) return;

      if (sidebar) {
        // 기존 카드 제거
        document.querySelectorAll(".checkmate-root-container").forEach(el => el.remove());
        
        const container = document.createElement("div");
        container.id = "checkmate-watch-card-v3.0";
        container.className = "checkmate-root-container";
        container.style.width = "100%";
        sidebar.prepend(container);
        renderDashboard(container);
      }
    };

    const injectToShortsPage = () => {
      const activeShortsActions = document.querySelector("ytd-reel-video-renderer[is-active] #actions-inner");
      if (document.getElementById("checkmate-shorts-card-v3.0")) return;

      if (activeShortsActions) {
        document.querySelectorAll(".checkmate-root-container").forEach(el => el.remove());
        
        const container = document.createElement("div");
        container.id = "checkmate-shorts-card-v3.0";
        container.className = "checkmate-root-container";
        container.style.width = "100%";
        activeShortsActions.prepend(container);
        renderDashboard(container);
      }
    };

    if (!document.body) {
      window.addEventListener("DOMContentLoaded", initStorage);
    } else {
      initStorage();
    }
  };

  runCheckmate();
}
