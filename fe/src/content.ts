/**
 * Checkmate Content Script - v3.0 (단일 확장형 카드 방식)
 */

import { useCheckmateStore } from "./lib/store";

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

      let videoId: string | null = null;
      if (isWatchPage) {
        videoId = new URLSearchParams(window.location.search).get("v");
      } else if (isShortsPage) {
        videoId = "shorts-" + window.location.pathname.split("/").pop();
      }

      if (videoId) {
        // DOM이 업데이트될 때까지 기다리면서 제목과 채널명을 찾는 재시도 함수
        const fetchVideoInfo = (attempts = 0) => {
          if (attempts > 10) {
            // 10번 시도(약 5초) 후에도 못 찾으면 일단 기본값으로 세팅
            useCheckmateStore.getState().setCurrentVideo(videoId!, document.title.replace(" - YouTube", ""), "알 수 없는 채널");
            return;
          }

          let titleEl: Element | null = null;
          let channelEl: Element | null = null;

          if (isWatchPage) {
            titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
            channelEl = document.querySelector('#owner ytd-channel-name yt-formatted-string a');
          } else if (isShortsPage) {
            titleEl = document.querySelector('ytd-reel-video-renderer[is-active] h2.title');
            channelEl = document.querySelector('ytd-reel-video-renderer[is-active] ytd-channel-name yt-formatted-string a');
          }

          if (titleEl && titleEl.textContent && channelEl && channelEl.textContent) {
            const title = titleEl.textContent.trim();
            const channel = channelEl.textContent.trim();
            useCheckmateStore.getState().setCurrentVideo(videoId!, title, channel);
          } else {
            // DOM이 아직 안 그려졌다면 500ms 후 재시도
            setTimeout(() => fetchVideoInfo(attempts + 1), 500);
          }
        };

        fetchVideoInfo();
      }

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
