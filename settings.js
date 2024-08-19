document.addEventListener('DOMContentLoaded', async () => {
    // Check if the data is already stored
    const { userEmail, dbUrl, dbKey } = await browser.storage.local.get(['userEmail', 'dbUrl', 'dbKey']);
    if (userEmail && dbUrl && dbKey) {
        document.body.innerHTML = `<ul>
            <li>Email: ${userEmail}</li>
            <li>URL: ${dbUrl}</li>
            <li>Key: ${dbKey}</li>
        </ul>`;
    }

    const saveEl = document.getElementById('save')
    if (saveEl) {
        saveEl.addEventListener('click', () => {
            const userEmail = document.getElementById('email').value.trim();
            const dbKey = document.getElementById('db_key').value.trim();
            const dbUrl = document.getElementById('db_url').value.trim();
            if (email && dbKey && dbUrl) {
                const data = {
                    userEmail,
                    dbKey,
                    dbUrl
                };
                browser.storage.local.set(data).then(() => {
                    document.getElementById('message').textContent = 'Data saved!';
                }).catch((error) => {
                    console.error('Error saving data:', error);
                    document.getElementById('message').textContent = 'Error saving data.';
                });
            } else {
                document.getElementById('message').textContent = 'Please enter a valid email, URL, and Key.';
            }
        });
    }
});
