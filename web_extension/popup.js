document.addEventListener('DOMContentLoaded', () => {
    const tagInput = document.getElementById('tags');
    const tagPreview = document.getElementById('tag-preview');
    const tagError = document.getElementById('tag-error');

    tagInput.addEventListener('input', updateTagPreview);

    function updateTagPreview() {
        tagError.style.display = 'none';
        const input = tagInput.value.trim();
        
        if (!input) {
            tagPreview.innerHTML = '';
            return;
        }
        
        // Split by commas and clean each tag
        const rawTags = input.split(',');
        const validTags = [];
        let hasErrors = false;
        
        rawTags.forEach((rawTag, index) => {
            const tag = cleanTag(rawTag);
            
            if (tag) {
                if (isValidTag(tag)) {
                    validTags.push(`<span class="tag">${tag}</span>`);
                } else {
                    hasErrors = true;
                    validTags.push(`<span class="tag error" title="Invalid tag">${tag}</span>`);
                }
            }
        });
        
        tagPreview.innerHTML = validTags.join(' ');
        
        if (hasErrors) {
            tagError.textContent = 'Some tags contain invalid characters';
            tagError.style.display = 'block';
        }
    }

    function cleanTag(tag) {
        return tag.trim().toLowerCase();
    }

    function isValidTag(tag) {
        // Allow letters, numbers, hyphens, underscores, no spaces
        return /^[a-z0-9-_]{2,30}$/.test(tag);
    }
    // First, check if the user is logged in by looking for the access token.    
    chrome.storage.local.get(['access_token'], (result) => {
        const accessToken = result.access_token;

        if (!accessToken) {
            // If not logged in, open the login page in a new tab and close this popup.
            chrome.tabs.create({ url: 'http://127.0.0.1:5000/login' });
            window.close();
            return;
        }

        // If logged in, proceed to set up the form.
        const saveForm = document.getElementById('save-form');

        // Pre-fill the title input with the title of the active tab.
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                document.getElementById('save-title').value = tabs[0].title;
            }
        });

        // Listen for the form submission.
        saveForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const title = document.getElementById('save-title').value;
            const description = document.getElementById('description').value;
            const tags = document.getElementById('tags').value;
            const privacy_setting = document.querySelector('input[name="privacy_setting"]:checked').value;

            // Get current tab info to save along with the form data.
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (dataUrl) => {
                    fetch('http://127.0.0.1:5000/save_resource', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}` // Authenticate the request
                        },
                        body: JSON.stringify({
                            url: tab.url,
                            title: title,
                            description: description,
                            tags: tags,
                            privacy_setting: privacy_setting,
                            pagecapture: dataUrl
                        })
                    })
                    .then(response => {
                        if (response.status === 401) {
                            // Unauthorized, likely an expired/invalid token.
                            chrome.storage.local.remove('access_token');
                            chrome.tabs.create({ url: 'http://127.0.0.1:5000/login' });
                            window.close();
                            // Stop promise chain
                            return Promise.reject('Unauthorized');
                        }
                        if (!response.ok) {
                            throw new Error(`Failed to save: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Resource saved:', data.message);
                        window.close(); // Close the popup on success.
                    })
                    .catch(error => {
                        if (error !== 'Unauthorized') {
                            console.error('Error saving resource:', error);
                        }
                    });
                });
            });
        });
    });
});
