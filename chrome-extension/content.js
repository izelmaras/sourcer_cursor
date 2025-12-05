// Content script - runs on all pages
// This can be used for additional functionality if needed

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageInfo") {
    sendResponse({
      url: window.location.href,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || ''
    });
  }
  return true;
});




