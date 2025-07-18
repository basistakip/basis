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
    const mainSystemsSection = document.getElementById('main-systems-section');
    const otherSystemsSection = document.getElementById('other-systems-section');

    // --- İZİN VERİLEN E-POSTA ADRESLERİ LİSTESİ ---
    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
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
                // Yetkili kullanıcı
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail);

                displayAuthorizedUI(decodedToken);
                google.accounts.id.cancel();
            } else {
                // *** YETKİSİZ KULLANICI DURUMU: MESAJIN GÖRÜNMESİNİ SAĞLA ***
                console.warn("Yetkisiz e-posta: " + userEmail);

                // UI'ı sadece gerekli kısımları gizleyerek sıfırla
                profileInfo.style.display = 'none';
                logoutButton.style.display = 'none';
                googleSignInButton.style.display = 'block';

                mainSystemsSection.style.display = 'none';
                otherSystemsSection.style.display = 'none';

                systemButtons.forEach(button => {
                    button.style.pointerEvents = 'none';
                    button.style.opacity = '0.5';
                });

                // Hata mesajını göster
                showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");

                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                google.accounts.id.cancel();
            }
        } else {
            console.error("Kimlik doğrulama başarısız.");
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            resetUI();
        }
    };

    // Fonksiyon: JWT'yi çözümle
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("JWT çözümleme hatası:", e);
            return null;
        }
    }

    // Fonksiyon: Erişim engellendi mesajını göster
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

    // Arayüzü yetkili kullanıcıya göre ayarla
    function displayAuthorizedUI(decodedToken) {
        profileInfo.style.display = 'flex';
        logoutButton.style.display = 'block';
        googleSignInButton.style.display = 'none';
        accessDeniedMessage.style.display = 'none';

        mainSystemsSection.style.display = 'grid';
        otherSystemsSection.style.display = 'grid';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton.addEventListener('click', () => {
        google.accounts.id.disableAutoSelect();
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        resetUI();
        alert("Başarıyla çıkış yaptınız. Tekrar giriş yapmak için lütfen Google ile giriş yapın.");
        google.accounts.id.prompt();
    });

    // Arayüzü başlangıç durumuna sıfırla
    function resetUI() {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        googleSignInButton.style.display = 'block';
        accessDeniedMessage.style.display = 'none';

        mainSystemsSection.style.display = 'none';
        otherSystemsSection.style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    // --- Sayfa Yüklendiğinde Oturum Kontrol ve Başlatma Mantığı ---
    function initializeAuthFlow() {
        const savedToken = localStorage.getItem('google_id_token');
        const savedEmail = localStorage.getItem('user_email');
        
        if (savedToken && savedEmail) {
            const decodedToken = parseJwt(savedToken);
            const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

            if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                console.log("Kayıtlı ve geçerli oturum bulundu.");
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = savedEmail;
                displayAuthorizedUI(decodedToken);
            } else {
                console.warn("Kayıtlı oturum geçersiz, süresi dolmuş veya yetkisiz. Temizleniyor.");
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                google.accounts.id.prompt();
            }
        } else {
            console.log("Kayıtlı oturum bulunamadı. Google One-Tap tetikleniyor.");
            resetUI();
            google.accounts.id.prompt();
        }
    }

    // Uygulamayı başlat
    initializeAuthFlow();

    // Buton tıklama olayları
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    });

    // Klima Santrali ikonundaki pervaneleri döndür
    const fanBlades = document.querySelectorAll('.klima .fan-blade');
    if (fanBlades.length === 3) {
        fanBlades[0].style.setProperty('--angle', '0deg');
        fanBlades[1].style.setProperty('--angle', '120deg');
        fanBlades[2].style.setProperty('--angle', '240deg');
    }
});
