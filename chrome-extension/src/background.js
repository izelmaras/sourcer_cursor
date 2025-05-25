// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToSources",
    title: "Add to my sources",
    contexts: ["image", "video"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToSources") {
    const mediaUrl = info.srcUrl || info.linkUrl;
    // Store media link for popup
    await chrome.storage.local.set({ 
      mediaLink: mediaUrl,
      mediaType: info.mediaType || (info.srcUrl ? 'image' : 'video')
    });
    // Open popup
    chrome.action.openPopup();
  }
}); 