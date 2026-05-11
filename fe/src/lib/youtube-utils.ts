/**
 * 메타데이터(제목, 채널명)가 유효하지 않은지 체크
 */
export const isUnknown = (s: string | null | undefined) =>
  !s ||
  s.trim() === "" ||
  s.toLowerCase().includes("unknown") ||
  s.includes("알 수 없는") ||
  s.startsWith("UNKNOWN_CHANNEL_");

/**
 * YouTube DOM에서 현재 영상의 제목과 채널명을 강제로 추출
 */
export const scrapeMetadata = () => {
  // 제목 추출 (사용자 제공 롱폼 구조 우선 -> 쇼츠 -> 기타)
  const titleElement =
    document.querySelector("h1.ytd-watch-metadata yt-formatted-string") ||
    document.querySelector("yt-formatted-string.ytd-watch-metadata") ||
    document.querySelector("yt-shorts-video-title-view-model h2 span") ||
    document.querySelector("h2.style-scope.ytd-shorts yt-formatted-string") ||
    document.querySelector("#title h1 yt-formatted-string");

  const scrapedTitle =
    titleElement?.textContent?.trim() || document.title.replace(" - YouTube", "").trim() || "알 수 없는 영상";

  // 채널명 추출 (롱폼 -> 쇼츠 -> 기타)
  const channelElement =
    document.querySelector("ytd-video-owner-renderer #channel-name a") ||
    document.querySelector("#text.ytd-channel-name a") ||
    document.querySelector("ytd-shorts #channel-name a") ||
    document.querySelector("#owner #channel-name yt-formatted-string a") ||
    document.querySelector('a[href*="/@"]');

  const scrapedChannel = channelElement?.textContent?.trim() || "알 수 없는 채널";

  return { title: scrapedTitle, channel: scrapedChannel };
};
