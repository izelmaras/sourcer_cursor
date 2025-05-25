// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToSources",
    title: "Add to my sources",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToSources") {
    const imageUrl = info.srcUrl;
    // Store image link for popup
    await chrome.storage.local.set({ imageLink: imageUrl });
    // Open popup
    chrome.action.openPopup();
  }
}); 