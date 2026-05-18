// Background script for Checkmate Extension

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_AUTH_TOKEN") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Auth Error:", chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ token });
      }
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});
