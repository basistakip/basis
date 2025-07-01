document.addEventListener('DOMContentLoaded', () => {
    const systemButtons = document.querySelectorAll('.system-button');
    const profileInfo = document.getElementById('profile-info');
    const profilePicture = document.getElementById('profile-picture');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-button');
    const accessDeniedMessage = document.getElementById('access-denied');
    const googleSignInButton = document.querySelector('.g_id_signin');

    const allowedDomain = "example.edu.tr"; // İzin verilen e-posta alan adını buraya girin

    // Fonksiyon: Google kimlik bilgileri yanıtını işler
    window.handleCredentialResponse = (response) => {
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            const userEmail = decodedToken.email;
            const emailDomain = userEmail.split('@')[1];

            if (emailDomain === allowedDomain) {
                // Giriş başarılı, kullanıcı bilgilerini göster
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                profileInfo.style.display = 'block';
                logoutButton.style.display = 'block';
                googleSignInButton.style.display = 'none'; // Google giriş butonunu gizle
                accessDeniedMessage.style.display = 'none'; // Erişim engellendi mesajını gizle

                // Tüm butonları etkinleştir
                systemButtons.forEach(button => {
                    button.style.pointerEvents = 'auto';
                    button.style.opacity = '1';
                });
            } else {
                // Yetkisiz domain
                showAccessDenied();
                logoutButton.style.display = 'block'; // Sadece çıkış butonu kalsın
                googleSignInButton.style.display = 'none'; // Google giriş butonunu gizle
                profileInfo.style.display = 'none'; // Profil bilgisini gizle

                // Tüm butonları devre dışı bırak
                systemButtons.forEach(button => {
                    button.style.pointerEvents = 'none';
                    button.style.opacity = '0.5';
                });
            }
        } else {
            console.error("Kimlik doğrulama başarısız: E-posta bulunamadı.");
            showAccessDenied();
            // Tüm butonları devre dışı bırak
            systemButtons.forEach(button => {
                button.style.pointerEvents = 'none';
                button.style.opacity = '0.5';
            });
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
    function showAccessDenied() {
        accessDeniedMessage.style.display = 'block';
        setTimeout(() => {
            accessDeniedMessage.style.display = 'none';
        }, 5000); // 5 saniye sonra gizle
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton.addEventListener('click', () => {
        // Google oturumunu kapat
        google.accounts.id.disableAutoSelect(); // Otomatik seçimi devre dışı bırak
        google.accounts.id.revoke(localStorage.getItem('g_csrf_token'), done => {
            console.log('Oturum kapatıldı:', done);
            localStorage.removeItem('g_csrf_token'); // Token'ı depodan kaldır
            resetUI();
        });
    });

    // Arayüzü başlangıç durumuna sıfırla
    function resetUI() {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        googleSignInButton.style.display = 'block'; // Google giriş butonunu göster
        accessDeniedMessage.style.display = 'none';

        // Tüm butonları devre dışı bırak
        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    // Başlangıçta tüm butonları devre dışı bırak
    resetUI();

    // Buton tıklama olayları
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    });

    // Klima Santrali ikonundaki pervaneleri döndür (CSS ile animasyon kaldırıldığı için sadece başlangıç ayarı)
    const fanBlades = document.querySelectorAll('.klima .fan-blade');
    if (fanBlades.length === 3) {
        fanBlades[0].style.setProperty('--angle', '0deg');
        fanBlades[1].style.setProperty('--angle', '120deg');
        fanBlades[2].style.setProperty('--angle', '240deg');
    }
});
