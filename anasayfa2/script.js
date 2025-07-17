document.addEventListener('DOMContentLoaded', () => {
    const systemButtons = document.querySelectorAll('.system-button');
    const profileInfo = document.getElementById('profile-info');
    const profilePicture = document.getElementById('profile-picture');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-button');
    const accessDeniedMessage = document.getElementById('access-denied');
    const googleSignInButton = document.querySelector('.g_id_signin');

    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
        "ikinci.izinli.kullanici@example.com",
        "ucuncu.kullanici@gmail.com"
    ];

    window.handleCredentialResponse = (response) => {
        console.log('Credential response:', response);
        if (!response || !response.credential) {
            console.error('No credential received');
            showAccessDenied('Giriş başarısız oldu. Lütfen tekrar deneyin.');
            resetUI();
            return;
        }

        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            const userEmail = decodedToken.email.toLowerCase().trim();
            console.log('User email:', userEmail);

            if (allowedEmails.includes(userEmail)) {
                console.log('Access granted for:', userEmail);
                profilePicture.src = decodedToken.picture || '';
                profileName.textContent = decodedToken.name || 'Bilinmeyen Kullanıcı';
                profileEmail.textContent = userEmail;

                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail);

                displayAuthorizedUI();
                google.accounts.id.cancel();
            } else {
                console.log('Access denied for:', userEmail);
                showAccessDenied(`'${userEmail}' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.`);
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                google.accounts.id.cancel();
            }
        } else {
            console.error('Invalid token or no email');
            showAccessDenied('Giriş başarısız oldu. Lütfen tekrar deneyin.');
            localStorage.removeItem('google_id_token');
            localStorage.removeItem('user_email');
            resetUI();
        }
    };

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT:', e);
            return null;
        }
    }

    function showAccessDenied(message) {
        console.log('Showing access denied:', message);
        accessDeniedMessage.textContent = message;
        accessDeniedMessage.style.display = 'block !important'; // Override CSS
        alert(message); // Fallback for debugging
        setTimeout(() => {
            accessDeniedMessage.style.display = 'none';
            console.log('Access denied message hidden');
        }, 8000);
    }

    function displayAuthorizedUI() {
        console.log('Displaying authorized UI');
        profileInfo.style.display = 'flex';
        logoutButton.style.display = 'block';
        googleSignInButton.style.display = 'none';
        accessDeniedMessage.style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });

        document.getElementById('main-systems-section').style.display = 'grid';
        document.getElementById('other-systems-section').style.display = 'grid';
    }

    function resetUI() {
        console.log('Resetting UI');
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        googleSignInButton.style.display = 'block';
        accessDeniedMessage.style.display = 'none';

        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    logoutButton.addEventListener('click', () => {
        console.log('Logout triggered');
        google.accounts.id.disableAutoSelect();
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        resetUI();
        alert('Başarıyla çıkış yaptınız. Tekrar giriş yapmak için lütfen Google ile giriş yapın.');
        google.accounts.id.prompt();
    });

    function initializeAuthFlow() {
        console.log('Initializing auth flow');
        const savedToken = localStorage.getItem('google_id_token');
        const savedEmail = localStorage.getItem('user_email');

        if (savedToken && savedEmail) {
            const decodedToken = parseJwt(savedToken);
            const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

            if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                console.log('Restoring session for:', savedEmail);
                profilePicture.src = decodedToken.picture || '';
                profileName.textContent = decodedToken.name || 'Bilinmeyen Kullanıcı';
                profileEmail.textContent = savedEmail;
                displayAuthorizedUI();
            } else {
                console.log('Invalid or expired session');
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                google.accounts.id.prompt();
            }
        } else {
            console.log('No saved session');
            resetUI();
            google.accounts.id.prompt();
        }
    }

    if (typeof google === 'undefined' || !google.accounts) {
        console.error('Google API not loaded');
        showAccessDenied('Google giriş servisi yüklenemedi. Lütfen sayfayı yenileyin.');
    } else {
        initializeAuthFlow();
    }

    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                console.log('Navigating to:', url);
                window.open(url, '_blank');
            }
        });
    });

    const fanBlades = document.querySelectorAll('.klima .fan-blade');
    if (fanBlades.length === 3) {
        fanBlades[0].style.setProperty('--angle', '0deg');
        fanBlades[1].style.setProperty('--angle', '120deg');
        fanBlades[2].style.setProperty('--angle', '240deg');
    }
});
