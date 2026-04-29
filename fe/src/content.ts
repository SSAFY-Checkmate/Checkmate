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

          // 쇼츠에서 댓글창이 열려있는지 감시
          if (isShortsPage && shortsCard) {
            let isPanelOpen = false;
            // 화면 내의 모든 패널을 확인
            const panels = document.querySelectorAll('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"]');
            
            panels.forEach(panel => {
              if (window.getComputedStyle(panel).display !== "none" && panel.getBoundingClientRect().width > 0) {
                isPanelOpen = true; // 열려있는 패널 발견!
              }
            });
            
            if (isPanelOpen) {
              // 투명하게 만드는 것이 아니라 아예 화면에서 지워버림 (클릭 방해 0%)
              shortsCard.style.display = "none";
            } else {
              shortsCard.style.display = "block";
            }
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
        videoId = "shorts-" + window.location.pathname.split("/").pop();
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

    const injectToShortsPage = () => {
      // 쇼츠 컨테이너가 렌더링되었는지 확인
      const shortsContainer = document.querySelector("ytd-shorts");
      if (!shortsContainer) return;

      // 이미 주입되어 있으면 무시 (React가 상태 변경을 감지해서 알아서 업데이트함)
      if (document.getElementById("checkmate-shorts-card-v3.0")) return;

      document.querySelectorAll(".checkmate-root-container").forEach((el) => el.remove());

      const container = document.createElement("div");
      container.id = "checkmate-shorts-card-v3.0";
      container.className = "checkmate-root-container";

      // 화면(body) 기준으로 고정하여 유튜브 Polymer DOM 에러(댓글창 안 닫힘 등) 방지
      container.style.position = "fixed";
      container.style.top = "50px";
      container.style.left = "calc(50% + 350px)"; // 비디오 중심에서 우측으로 350px 이동
      container.style.width = "320px";
      container.style.zIndex = "9999"; 
      container.style.transition = "opacity 0.2s ease"; // 부드러운 숨김 애니메이션

      document.body.appendChild(container);
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
