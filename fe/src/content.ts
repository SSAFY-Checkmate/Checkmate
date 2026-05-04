/**
 * Checkmate Content Script - v3.0 (단일 확장형 카드 방식)
 */

import { useCheckmateStore } from "./lib/store";

if ((window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__) {
  console.warn("[Checkmate] 이미 콘텐츠 스크립트가 실행 중입니다.");
} else {
  (window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__ = true;

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

      // [추가] 콘텐츠 스크립트 생존 확인용 리스너
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "PING") {
          sendResponse({ type: "PONG" });
        }
      });
    };

    const startInfection = () => {
      runInjections();

      // 기존의 무거운 MutationObserver 제거 및 단순 감시 타이머로 교체
      if (!(window as any).__CHECKMATE_INTERVAL__) {
        (window as any).__CHECKMATE_INTERVAL__ = setInterval(() => {
          const isShortsPage = window.location.pathname.startsWith("/shorts");
          const isWatchPage = window.location.pathname === "/watch";
          const shortsCard = document.getElementById("checkmate-shorts-card-v3.0");
          const watchCard = document.getElementById("checkmate-watch-card-v3.0");

          // 일반 영상 페이지 반응형 레이아웃 처리
          if (isWatchPage && watchCard) {
            const isWide = window.innerWidth >= 1016;
            if (isWide) {
              const sidebar = document.querySelector("#secondary-inner") || document.querySelector("#secondary");
              if (sidebar && watchCard.parentElement !== sidebar) {
                sidebar.prepend(watchCard);
              }
            } else {
              const primaryInner = document.querySelector("#primary-inner");
              const below = document.querySelector("#below");
              const comments = document.querySelector("#comments");
              const related = document.querySelector("#related");

              if (primaryInner) {
                let targetParent: Element | null = primaryInner;
                let insertBeforeNode: Element | null = null;

                if (related && primaryInner.contains(related)) {
                  targetParent = related.parentElement;
                  insertBeforeNode = related;
                } else if (comments && primaryInner.contains(comments)) {
                  targetParent = comments.parentElement;
                  insertBeforeNode = comments;
                } else if (below) {
                  targetParent = below;
                  insertBeforeNode = below.firstElementChild;
                }

                if (targetParent && watchCard.parentElement !== targetParent) {
                  if (insertBeforeNode) {
                    targetParent.insertBefore(watchCard, insertBeforeNode);
                  } else {
                    targetParent.appendChild(watchCard);
                  }
                } else if (targetParent && insertBeforeNode && watchCard.nextElementSibling !== insertBeforeNode) {
                  targetParent.insertBefore(watchCard, insertBeforeNode);
                }
              }
            }
          }

          // 영상 ID 변경 감지 (쇼츠 스크롤 대응)
          let currentId: string | null = null;
          if (isWatchPage) {
            currentId = new URLSearchParams(window.location.search).get("v");
          } else if (isShortsPage) {
            currentId = window.location.pathname.split("/").pop() || null;
          }

          const storeId = useCheckmateStore.getState().currentVideoId;
          if (currentId && (currentId !== storeId || (isShortsPage && !shortsCard))) {
            runInjections();
          }
        }, 500); // 0.5초 간격으로 가볍게 체크
      }

      window.removeEventListener("yt-navigate-finish", runInjections);
      window.addEventListener("yt-navigate-finish", runInjections);
    };

    const stopInfection = () => {
      if ((window as any).__CHECKMATE_INTERVAL__) {
        clearInterval((window as any).__CHECKMATE_INTERVAL__);
        (window as any).__CHECKMATE_INTERVAL__ = null;
      }
      window.removeEventListener("yt-navigate-finish", runInjections);
      document.querySelectorAll(".checkmate-root-container").forEach(el => el.remove());
    };

    const runInjections = () => {
      if (!isEnabled) return;

      const isWatchPage = window.location.pathname === "/watch";
      const isShortsPage = window.location.pathname.startsWith("/shorts");

      let videoId: string | null = null;
      if (isWatchPage) {
        videoId = new URLSearchParams(window.location.search).get("v");
      } else if (isShortsPage) {
        // 쇼츠의 경우 경로에서 영상 ID 추출
        videoId = window.location.pathname.split("/").pop() || null;
      }

      if (videoId) {
        useCheckmateStore.getState().setCurrentVideo(videoId);
      }

      if (isWatchPage) {
        injectToWatchPage();
      } else if (isShortsPage) {
        injectToShortsPage();
      } else {
        document.querySelectorAll(".checkmate-root-container").forEach((el) => el.remove());
      }
    };

    const injectToWatchPage = () => {
      const sidebar = document.querySelector("#secondary-inner") || document.querySelector("#secondary");
      if (document.getElementById("checkmate-watch-card-v3.0")) return;

      if (sidebar) {
        // 기존 카드 제거
        document.querySelectorAll(".checkmate-root-container").forEach((el) => el.remove());

        const container = document.createElement("div");
        container.id = "checkmate-watch-card-v3.0";
        container.className = "checkmate-root-container";
        container.style.width = "100%";
        container.style.marginBottom = "16px"; // 간격 추가
        sidebar.prepend(container);
        renderDashboard(container);
      }
    };

    /**
     * Shadow DOM 내부까지 탐색하여 요소를 찾는 헬퍼 함수
     */
    const findElementInShadows = (selector: string, root: Element | ShadowRoot = document.documentElement): Element | null => {
      const el = (root as any).querySelector(selector);
      if (el) return el;
      
      const all = (root as any).querySelectorAll("*");
      for (const node of all) {
        if (node.shadowRoot) {
          const found = findElementInShadows(selector, node.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };

    const injectToShortsPage = () => {
      // 활성화된 쇼츠의 오버레이 렌더러 탐색
      const activeOverlay = Array.from(document.querySelectorAll("ytd-reel-player-overlay-renderer"))
        .find(el => (el as HTMLElement).getBoundingClientRect().width > 0);
      
      if (!activeOverlay) return;

      // 사용자님이 알려주신 #button-bar 또는 #actions를 타겟팅
      const targetContainer = activeOverlay.querySelector("#button-bar") 
                           || activeOverlay.querySelector("#actions")
                           || findElementInShadows("#button-bar", activeOverlay)
                           || findElementInShadows("#actions", activeOverlay);

      if (!targetContainer) return;

      // 이미 주입되어 있으면 무시
      if (targetContainer.querySelector(".checkmate-shorts-button-v3")) return;

      // 기존 잔재 청소
      document.querySelectorAll(".checkmate-shorts-button-v3").forEach(el => el.remove());

      const container = document.createElement("div");
      container.id = "checkmate-shorts-card-v3.0";
      container.className = "checkmate-shorts-button-v3 checkmate-root-container";
      container.style.width = "100%";
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.marginBottom = "12px"; // 순정 버튼 사이 간격과 유사하게 조정
      container.style.zIndex = "10";

      // 타겟 컨테이너의 맨 위에 삽입 (좋아요 버튼 위쪽)
      targetContainer.prepend(container);
      renderDashboard(container);
    };

    if (!document.body) {
      window.addEventListener("DOMContentLoaded", initStorage);
    } else {
      initStorage();
    }
  };

  runCheckmate();
}
