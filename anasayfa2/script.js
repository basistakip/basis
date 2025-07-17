document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const systemButtons = document.querySelectorAll('.system-button');
    const profileInfo = document.getElementById('profile-info');
    const profilePicture = document.getElementById('profile-picture');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-button');
    const accessDeniedMessage = document.getElementById('access-denied');
    const googleSignInButton = document.querySelector('.g_id_signin');

    // --- İZİN VERİLEN E-POSTA ADRESLERİ LİSTESİ ---
    const allowedEmails = [
        "mahmutkilicankara@gmail.com", // Kendi e-postanızı buraya ekleyin
        "ikinci.izinli.kullanici@example.com",
        "ucuncu.kullanici@gmail.com"
    ];
    // --------------------------------------------------------

    // Fonksiyon: Google kimlik bilgileri yanıtını işler
    window.handleCredentialResponse = (response) => {
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            const userEmail = decodedToken.email.toLowerCase().trim();

            if (allowedEmails.includes(userEmail)) {
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail); 

                displayAuthorizedUI(decodedToken);
                google.accounts.id.cancel();
            } else {
                // *** YETKİSİZ E-POSTA DURUMU ***
                showAccessDenied(`"${userEmail}" ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.`);

                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');

                resetUI(true);
                google.accounts.id.cancel();
            }
        } else {
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            localStorage.removeItem('google_id_token');
            localStorage.removeItem('user_email');
            resetUI();
        }
    };

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("JWT çözümleme hatası:", e);
            return null;
        }
    }

    function showAccessDenied(message) {
        accessDeniedMessage.textContent = message;
        accessDeniedMessage.style.display = 'block';

        if (window.accessDeniedTimeout) {
            clearTimeout(window.accessDeniedTimeout);
        }

        window.accessDeniedTimeout = setTimeout(() => {
            accessDeniedMessage.style.display = 'none';
            window.accessDeniedTimeout = null;
        }, 8000);
    }

    function displayAuthorizedUI(decodedToken) {
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

    logoutButton.addEventListener('click', () => {
        google.accounts.id.disableAutoSelect(); 
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        
        resetUI();
        alert("Başarıyla çıkış yaptınız. Tekrar giriş yapmak için lütfen Google ile giriş yapın.");
        google.accounts.id.prompt();
    });

    function resetUI(hideGoogleSignIn = false) {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';

        googleSignInButton.style.display = hideGoogleSignIn ? 'none' : 'block';
        accessDeniedMessage.style.display = 'none';

        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    function initializeAuthFlow() {
        const savedToken = localStorage.getItem('google_id_token');
        const savedEmail = localStorage.getItem('user_email');

        if (savedToken && savedEmail) {
            const decodedToken = parseJwt(savedToken);
            const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

            if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = savedEmail;
                displayAuthorizedUI(decodedToken);
            } else {
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                google.accounts.id.prompt(); 
            }
        } else {
            resetUI();
            google.accounts.id.prompt();
        }
    }

    initializeAuthFlow();

    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    });


});
