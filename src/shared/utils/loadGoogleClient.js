export const loadGoogleClient = () =>
    new Promise((resolve, reject) => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            return resolve();
        }
        const id = 'google-oauth-client';
        if (document.getElementById(id)) {
            const check = () =>
                window.google && window.google.accounts && window.google.accounts.oauth2
                    ? resolve()
                    : setTimeout(check, 100);
            return check();
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Không thể load Google SDK'));
        document.head.appendChild(script);
    });
