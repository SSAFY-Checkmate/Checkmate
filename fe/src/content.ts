/**
 * Checkmate Content Script - v3.0 (단일 확장형 카드 방식)
 */

import { useCheckmateStore } from "./lib/store";
import { scrapeMetadata } from "./lib/youtube-utils";
import { renderDashboard, renderGlobalModal } from "./components/checkmate/injector";

if ((window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__) {
  console.warn("[Checkmate] 이미 콘텐츠 스크립트가 실행 중입니다.");
} else {
  (window as any).__CHECKMATE_CONTENT_SCRIPT_LOADED__ = true;

  const runCheckmate = async () => {
    let isEnabled = false;


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
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === "PING") {
          sendResponse({ type: "PONG" });
        }
      });
    };

    const startInfection = () => {
      renderGlobalModal();
      runInjections();

      // 기존의 무거운 MutationObserver 제거 및 단순 감시 타이머로 교체
      if (!(window as any).__CHECKMATE_INTERVAL__) {
        (window as any).__CHECKMATE_INTERVAL__ = setInterval(() => {
          const isShortsPage = window.location.pathname.startsWith("/shorts");
          const isWatchPage = window.location.pathname === "/watch";
          const shortsCard = document.getElementById("checkmate-shorts-card-v3");
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
        // YouTube DOM에서 제목/채널명 추출
        const { title: videoTitle, channel: channelName } = scrapeMetadata();

        useCheckmateStore.getState().setCurrentVideo(videoId, videoTitle.trim(), channelName.trim());
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
      // 1. 뷰포트 기준, 화면에 실제로 표출되고 있는 활성 쇼츠 액션바 최외각 컨테이너 탐색
      const allActionContainers = Array.from(document.querySelectorAll(".ytReelPlayerOverlayViewModelActionsContainer"));
      const activeOuter = allActionContainers.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight;
      }) || allActionContainers[0]; // fallback으로 첫 번째 컨테이너 매칭

      if (!activeOuter) return;

      // 2. 실제 버튼들이 플렉스로 차곡차곡 쌓여있는 직속 뷰모델 영역 정밀 타겟팅
      const activeContainer = activeOuter.querySelector("reel-action-bar-view-model") || activeOuter;

      // 3. 이미 주입되어 있으면 무시
      if (activeContainer.querySelector("#checkmate-shorts-card-v3") || document.getElementById("checkmate-shorts-card-v3")) {
        return;
      }

      // 4. 기존 잔재 청소
      document.querySelectorAll(".checkmate-shorts-button-v3").forEach(el => el.remove());

      // 5. 컨테이너 생성 및 정렬 (직속 플렉스 자식이므로 auto 높이와 100% 너비로 순정 정렬 상속)
      const container = document.createElement("div");
      container.id = "checkmate-shorts-card-v3";
      container.className = "checkmate-shorts-button-v3 checkmate-root-container";
      container.style.cssText = `
        width: 100% !important;
        height: auto !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        margin-bottom: 8px !important;
        z-index: 10 !important;
        position: relative !important;
      `;

      // 6. 타겟 컨테이너의 맨 위에 삽입 (좋아요 버튼 바로 윗자리)
      activeContainer.prepend(container);
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
