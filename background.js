chrome.runtime.onInstalled.addListener(function() {
    console.log('Cookie Capturer extension installed');
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getCookies") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        chrome.cookies.getAll({url: currentTab.url}, function(cookies) {
          sendResponse({cookies: cookies});
        });
      });
      return true; // Indicates that the response is sent asynchronously
    }
  });