(() => {
    // Hata mesajları ve sabitler
    const ERROR_MESSAGES = {
        GOOGLE_API_FAIL: "Google API yüklenemedi. Lütfen sayfayı yenileyin.",
        INVALID_SESSION: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
        AUTH_FAILED: "Kimlik doğrulama başarısız. Lütfen tekrar deneyin.",
        ACCESS_DENIED: (email) => `"${email}" ile erişim izniniz yok. Lütfen yetkili bir hesap kullanın.`
    };

    // Yapılandırma
    const CONFIG = {
        allowedEmails: new Set([
            "mahmutkilicankara@gmail.com",
            "ikinci.izinli.kullanici@example.com",
            "ucuncu.kullanici@gmail.com"
        ]),
        sessionCheckInterval: 60000 // 1 dakika
    };

    // DOM elementleri
    const DOM = {
        systemButtons: document.querySelectorAll('.system-button'),
        profileInfo: document.getElementById('profile-info'),
        profilePicture: document.getElementById('profile-picture'),
        profileName: document.getElementById('profile-name'),
        profileEmail: document.getElementById('profile-email'),
        logoutButton: document.getElementById('logout-button'),
        accessDeniedMessage: document.getElementById('access-denied'),
        googleSignInButton: document.querySelector('.g_id_signin'),
        mainSystemsSection: document.getElementById('main-systems-section'),
        otherSystemsSection: document.getElementById('other-systems-section'),
        loadingIndicator: document.createElement('div') // Yeni eklenen yükleniyor göstergesi
    };

    // Yükleniyor göstergesini oluştur
    DOM.loadingIndicator.className = 'loading-indicator';
    DOM.loadingIndicator.textContent = 'Doğrulanıyor...';
    DOM.authSection.appendChild(DOM.loadingIndicator);
    DOM.loadingIndicator.style.display = 'none';

    // Yardımcı fonksiyonlar
    const utils = {
        parseJwt: (token) => {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(c => 
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
                );
                return JSON.parse(jsonPayload);
            } catch (e) {
                console.error("JWT çözümleme hatası:", e);
                return null;
            }
        },

        isTokenValid: (token) => {
            if (!token) return false;
            const decoded = utils.parseJwt(token);
            return decoded && decoded.exp * 1000 > Date.now();
        }
    };

    // UI işlemleri
    const ui = {
        showLoading: () => {
            DOM.loadingIndicator.style.display = 'block';
            DOM.googleSignInButton.style.display = 'none';
            DOM.accessDeniedMessage.style.display = 'none';
        },

        hideLoading: () => {
            DOM.loadingIndicator.style.display = 'none';
        },

        showError: (message) => {
            DOM.accessDeniedMessage.textContent = message;
            DOM.accessDeniedMessage.style.display = 'block';
            DOM.googleSignInButton.style.display = 'none';
            
            clearTimeout(ui.errorTimeout);
            ui.errorTimeout = setTimeout(() => {
                DOM.accessDeniedMessage.style.display = 'none';
                DOM.googleSignInButton.style.display = 'block';
            }, 10000);
        },

        displayAuthorizedUI: (userData) => {
            DOM.profilePicture.src = userData.picture;
            DOM.profileName.textContent = userData.name;
            DOM.profileEmail.textContent = userData.email;
            
            DOM.profileInfo.style.display = 'flex';
            DOM.logoutButton.style.display = 'block';
            DOM.googleSignInButton.style.display = 'none';
            DOM.accessDeniedMessage.style.display = 'none';
            DOM.loadingIndicator.style.display = 'none';
            
            DOM.mainSystemsSection.style.display = 'grid';
            DOM.otherSystemsSection.style.display = 'grid';
            
            DOM.systemButtons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
            });
        },

        resetUI: () => {
            DOM.profileInfo.style.display = 'none';
            DOM.logoutButton.style.display = 'none';
            DOM.googleSignInButton.style.display = 'block';
            DOM.accessDeniedMessage.style.display = 'none';
            DOM.loadingIndicator.style.display = 'none';
            
            DOM.mainSystemsSection.style.display = 'none';
            DOM.otherSystemsSection.style.display = 'none';
            
            DOM.systemButtons.forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
            });
        }
    };

    // Auth işlemleri
    const auth = {
        handleCredentialResponse: async (response) => {
            try {
                ui.showLoading();
                
                if (!response?.credential) {
                    throw new Error("Geçersiz yanıt");
                }

                const decodedToken = utils.parseJwt(response.credential);
                if (!decodedToken?.email) {
                    throw new Error("Geçersiz token");
                }

                const userEmail = decodedToken.email.toLowerCase().trim();
                
                // 1.5 saniyelik yapay gecikme (kullanıcı deneyimi için)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (CONFIG.allowedEmails.has(userEmail)) {
                    localStorage.setItem('google_id_token', response.credential);
                    localStorage.setItem('user_email', userEmail);
                    ui.displayAuthorizedUI(decodedToken);
                } else {
                    ui.showError(ERROR_MESSAGES.ACCESS_DENIED(userEmail));
                    localStorage.removeItem('google_id_token');
                    localStorage.removeItem('user_email');
                    google.accounts.id.cancel();
                }
            } catch (error) {
                console.error("Giriş hatası:", error);
                ui.showError(ERROR_MESSAGES.AUTH_FAILED);
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                google.accounts.id.cancel();
            } finally {
                ui.hideLoading();
            }
        },

        initializeSession: async () => {
            const [token, email] = [
                localStorage.getItem('google_id_token'),
                localStorage.getItem('user_email')
            ];

            if (token && email && utils.isTokenValid(token)) {
                const decodedToken = utils.parseJwt(token);
                if (decodedToken && CONFIG.allowedEmails.has(email)) {
                    ui.displayAuthorizedUI(decodedToken);
                    return;
                }
            }

            auth.clearSession();
        },

        clearSession: () => {
            localStorage.removeItem('google_id_token');
            localStorage.removeItem('user_email');
            ui.resetUI();
        },

        handleLogout: () => {
            auth.clearSession();
            google.accounts.id.disableAutoSelect();
            setTimeout(() => google.accounts.id.prompt(), 1000);
        }
    };

    // Google API kontrolü
    const checkGoogleAPI = async () => {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts?.id) {
                resolve(true);
                return;
            }

            const timeout = setTimeout(() => {
                document.removeEventListener('load', check);
                resolve(false);
            }, 5000);

            const check = () => {
                if (typeof google !== 'undefined' && google.accounts?.id) {
                    clearTimeout(timeout);
                    document.removeEventListener('load', check);
                    resolve(true);
                }
            };

            document.addEventListener('load', check);
        });
    };

    // Oturum kontrolü
    const sessionChecker = {
        start: () => {
            setInterval(() => {
                const token = localStorage.getItem('google_id_token');
                if (token && !utils.isTokenValid(token)) {
                    auth.clearSession();
                    ui.showError(ERROR_MESSAGES.INVALID_SESSION);
                }
            }, CONFIG.sessionCheckInterval);
        }
    };

    // Uygulama başlatma
    const init = async () => {
        const isGoogleAPILoaded = await checkGoogleAPI();
        if (!isGoogleAPILoaded) {
            ui.showError(ERROR_MESSAGES.GOOGLE_API_FAIL);
            return;
        }

        // Global fonksiyon ataması
        window.handleCredentialResponse = auth.handleCredentialResponse;
        
        // Buton event listener'ları
        DOM.systemButtons.forEach(button => {
            button.addEventListener('click', () => {
                const url = button.dataset.url;
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });
        });

        DOM.logoutButton.addEventListener('click', auth.handleLogout);
        
        auth.initializeSession();
        sessionChecker.start();
    };

    // DOM hazır olduğunda başlat
    document.addEventListener('DOMContentLoaded', init);
})();
