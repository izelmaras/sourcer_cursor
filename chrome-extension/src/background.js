// Create context menu items
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
    const mediaUrl = info.srcUrl;
    const mediaType = info.mediaType || (info.srcUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image');
    
    // Store media link and type for popup
    await chrome.storage.local.set({ 
      mediaLink: mediaUrl,
      mediaType: mediaType
    });
    
    // Open popup
    chrome.action.openPopup();
  }
}); 