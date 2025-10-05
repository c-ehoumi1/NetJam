chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_OG_IMAGE") {
        // Find the <meta> tag with property="og:image"
        const ogImageMeta = document.querySelector('meta[property="og:image"]');
        
        if (ogImageMeta && ogImageMeta.content) {
            sendResponse({ ogImage: ogImageMeta.content });
        } else {
            // Respond with null if not found
            sendResponse({ ogImage: null });
        }
    }
    return true; // Indicates that the response is sent asynchronously
});