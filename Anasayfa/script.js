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
    // Sadece bu listedeki e-posta adresleri içeriğe erişebilir.
    // E-posta adreslerini KÜÇÜK HARFLE ve BAŞINDA/SONUNDA BOŞLUK OLMADAN yazmaya dikkat edin.
    const allowedEmails = [
        "mahmutkilicankara@gmail.com", // Kendi e-postanızı buraya ekleyin
        "ikinci.izinli.kullanici@example.com", // İzin vermek istediğiniz diğer e-postalar
        "ucuncu.kullanici@gmail.com"
    ];
    // --------------------------------------------------------

    // Fonksiyon: Google kimlik bilgileri yanıtını işler
    window.handleCredentialResponse = (response) => {
        console.log("handleCredentialResponse çağrıldı.");
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            const userEmail = decodedToken.email.toLowerCase().trim();

            console.log("Giriş denemesi e-postası: " + userEmail);
            console.log("E-posta izin verilenler listesinde mi? " + allowedEmails.includes(userEmail));

            if (allowedEmails.includes(userEmail)) {
                console.log("E-posta yetkili: " + userEmail);
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                // Yetkilendirme başarılı: Token'ı localStorage'a kaydet
                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail); 

                displayAuthorizedUI(decodedToken);

            } else {
                console.warn("Yetkisiz e-posta: " + userEmail);
                showAccessDenied("Bu e-posta (" + userEmail + ") ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                
                // Yetkisiz kullanıcılar için localStorage'ı temizle
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                // Yetkisiz kullanıcı için tekrar giriş isteme, sadece çıkış butonu kalsın
                googleSignInButton.style.display = 'none'; 

                // Google One-Tap'ın tekrar otomatik açılmasını engellemek için iptal et
                // google.accounts.id.cancel(); // Bu, eğer One-Tap zaten gösteriliyorsa onu kapatır.
            }
        } else {
            console.error("Kimlik doğrulama başarısız: E-posta bulunamadı veya token geçersiz.");
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            localStorage.removeItem('google_id_token'); // Hatalı token'ı temizle
            localStorage.removeItem('user_email');
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

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });
        
        document.getElementById('main-systems-section').style.display = 'grid';
        document.getElementById('other-systems-section').style.display = 'grid';
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton.addEventListener('click', () => {
        // Google oturumunu tamamen kapat
        // Eğer kullanıcı sadece oturumu kapatıp başka bir Google hesabıyla giriş yapacaksa disableAutoSelect kullanılır.
        // Eğer cihazdan tamamen çıkış yapacaksa revoke kullanılır. revoke kullanırken dikkatli olun!
        google.accounts.id.disableAutoSelect(); // Otomatik seçimi devre dışı bırak
        // Eğer gerçekten tüm Google oturumlarından çıkış yapmak isterseniz:
        // google.accounts.id.revoke(localStorage.getItem('google_id_token'), done => {
        //     console.log('Google oturumu iptal edildi:', done);
        // });

        // localStorage'daki kimlik bilgilerini temizle
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        
        resetUI(); // Arayüzü sıfırla
        alert("Başarıyla çıkış yaptınız. Tekrar giriş yapmak için lütfen Google ile giriş yapın.");
        // Sayfayı yenilemek iyi bir uygulama olabilir: window.location.reload();
    });

    // Arayüzü başlangıç durumuna sıfırla (yani giriş yapılmamış durum)
    function resetUI() {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        googleSignInButton.style.display = 'block'; // Google giriş butonunu göster
        accessDeniedMessage.style.display = 'none';

        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

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
            // Token'ın geçerli olup olmadığını ve süresinin dolmadığını kontrol et
            // decodedToken.exp değeri saniye cinsindendir, Date.now() ise milisaniye.
            const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

            if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                // Kaydedilmiş token geçerliyse ve yetkiliyse, UI'yı güncelle
                console.log("Kayıtlı ve geçerli oturum bulundu: " + savedEmail);
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = savedEmail;
                displayAuthorizedUI(decodedToken);
                // Google One-Tap otomatik seçimi için prompt() çağırmaya gerek yok,
                // data-auto_select bunu zaten yapmalı.
            } else {
                // Kaydedilmiş token geçersiz, süresi dolmuş veya e-posta yetkisizse oturumu temizle
                console.warn("Kayıtlı oturum geçersiz, süresi dolmuş veya yetkisiz. Temizleniyor.");
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();
                // Otomatik giriş başarısız olursa, kullanıcıya manuel giriş seçeneği sunmak için prompt() çağır
                google.accounts.id.prompt(); 
            }
        } else {
            // Hiç kaydedilmiş oturum yoksa, arayüzü sıfırla ve Google girişini göster
            console.log("Kayıtlı oturum bulunamadı. Google One-Tap tetikleniyor.");
            resetUI();
            google.accounts.id.prompt(); // One-Tap pop-up'ını tetikle
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
