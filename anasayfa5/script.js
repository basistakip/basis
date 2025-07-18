// ES6 modülleri ile modern JavaScript yapısı
const AuthSystem = (() => {
    // DOM Elementleri
    const elements = {
        googleSignInButton: document.querySelector('.g_id_signin'),
        profileInfo: document.getElementById('profile-info'),
        accessDenied: document.getElementById('access-denied'),
        loadingIndicator: createLoadingIndicator(),
        systemButtons: document.querySelectorAll('.system-button')
    };

    // Yapılandırma
    const config = {
        allowedEmails: new Set([
            "mahmutkilicankara@gmail.com",
            "ikinci.izinli.kullanici@example.com",
            "ucuncu.kullanici@gmail.com"
        ]),
        messageDuration: 8000,
        validationDelay: 1500
    };

    // Yardımcı fonksiyonlar
    function createLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.textContent = 'Doğrulanıyor...';
        loader.style.display = 'none';
        document.querySelector('.auth-section').appendChild(loader);
        return loader;
    }

    function showElement(el, displayType = 'block') {
        el.style.display = displayType;
    }

    function hideElement(el) {
        el.style.display = 'none';
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Token parse hatası:", e);
            return null;
        }
    }

    // Auth fonksiyonları
    function handleAuthorizationResult(isAuthorized, email = '') {
        hideElement(elements.loadingIndicator);
        
        if (isAuthorized) {
            showElement(elements.profileInfo, 'flex');
            hideElement(elements.googleSignInButton);
            hideElement(elements.accessDenied);
        } else {
            showElement(elements.googleSignInButton);
            elements.accessDenied.textContent = email ? 
                `"${email}" ile erişim izniniz yok` : 
                "Yetkilendirme hatası oluştu";
            showElement(elements.accessDenied);
            
            setTimeout(() => {
                hideElement(elements.accessDenied);
            }, config.messageDuration);
        }
    }

    // Public API
    return {
        init() {
            // Google butonunu göster
            showElement(elements.googleSignInButton);
            
            // Sistem butonlarını devre dışı bırak
            elements.systemButtons.forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
            });
        },

        handleCredentialResponse(response) {
            showElement(elements.loadingIndicator);
            hideElement(elements.googleSignInButton);
            hideElement(elements.accessDenied);

            setTimeout(() => {
                if (!response?.credential) {
                    handleAuthorizationResult(false);
                    return;
                }

                const decoded = parseJwt(response.credential);
                const email = decoded?.email?.toLowerCase().trim() || '';

                handleAuthorizationResult(config.allowedEmails.has(email), email);
                
                if (!config.allowedEmails.has(email)) {
                    google.accounts.id.cancel();
                }
            }, config.validationDelay);
        }
    };
})();

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    AuthSystem.init();
    
    // Global fonksiyon ataması
    window.handleCredentialResponse = AuthSystem.handleCredentialResponse;
});
