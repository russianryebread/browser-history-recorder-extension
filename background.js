
function onError(e) {
  console.error(e);
}

let debounceTimeout;

function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/*
On startup, check whether we have stored settings.
If we don't, then prompt for the user's email.
*/
function checkStoredSettings(storedSettings) {
  if (!storedSettings.userEmail) {
    let email = prompt("Please enter your email");
    browser.storage.local.set({userEmail: email});
  }
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);

// -------------------------------------------------------------------

async function recordHistory(url, title) {
  const { userEmail, dbUrl, dbKey} = await browser.storage.local.get(['userEmail', 'dbUrl', 'dbKey']);
  const parsedURL = new URL(url);
  
  const response = await fetch(`${dbUrl}/rest/v1/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${dbKey}`,
      'apikey': dbKey
    },
    body: JSON.stringify({
      url: url,
      domain: parsedURL.hostname,
      title: title,
      user_email: userEmail
    })
  });

  if (!response.ok) {
    console.error('Error recording history:', response.statusText);
  }
}

// Get the title of the page after it has loaded
browser.webNavigation.onCompleted.addListener((details) => {
  browser.tabs.get(details.tabId).then((tab) => {
    // Prevent duplicate entries by debouncing by 200ms
    debounce(recordHistory, 200)(tab.url, tab.title);
  });
}, { url: [{ urlMatches: '^(?!about:).*' }] }); // Exclude about: pages