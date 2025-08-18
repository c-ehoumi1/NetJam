let accessToken = null;

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    console.log("Message received from external page", sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    if (request.type === 'SET_TOKEN') {
      accessToken = request.token;
      console.log('Access token stored in extension background.');
      
      chrome.storage.local.set({ 'access_token': accessToken }, () => {
        console.log('Access token saved to chrome.storage.local');
      });

      sendResponse({ status: "success", message: "Token received and stored." });
    }
    return true; 
  }
);
