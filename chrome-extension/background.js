// Background service worker for Chrome extension

let pendingImageData = null;

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveImageToSourcer",
    title: "Save image to Izel's Sources",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveImageToSourcer" && info.srcUrl) {
    // Store the data
    pendingImageData = {
      imageUrl: info.srcUrl,
      pageUrl: tab.url || info.pageUrl,
      pageTitle: tab.title || 'Untitled',
      timestamp: Date.now()
    };
    
    // Save to storage
    chrome.storage.local.set({ pendingImage: pendingImageData });
    
    // Open the popup
    try {
      await chrome.action.openPopup();
    } catch (error) {
      // If openPopup fails (can't open programmatically from context menu),
      // the user will need to click the extension icon
      console.log('Note: Click the extension icon to open the popup');
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPendingImage") {
    chrome.storage.local.get("pendingImage", (data) => {
      sendResponse(data.pendingImage || null);
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === "clearPendingImage") {
    pendingImageData = null;
    chrome.storage.local.remove("pendingImage");
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "getApiUrl") {
    chrome.storage.local.get("apiUrl", (data) => {
      sendResponse({ apiUrl: data.apiUrl || 'https://sources.izel.website' });
    });
    return true;
  }
});
