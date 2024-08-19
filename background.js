
function onError(e) {
  console.error(e);
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

// browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (!tab.url.match(/^about:/)) {
//     browser.pageAction.show(tab.id);
//   }
// });

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

// browser.history.onVisited.addListener(recordHistory);
// Get the title of the page after it has loaded
browser.webNavigation.onCompleted.addListener((details) => {
  browser.tabs.get(details.tabId).then((tab) => {
      recordHistory(tab.url, tab.title);
  });
}, { url: [{ urlMatches: '^(?!about:).*' }] }); // Exclude about: pages