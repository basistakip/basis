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
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            // Kullanıcının e-postasını küçük harfe çevir ve boşlukları temizle
            const userEmail = decodedToken.email.toLowerCase().trim();

            console.log("Giriş denemesi: " + userEmail);
            console.log("İzin verilen e-postalar: ", allowedEmails);
            console.log("E-posta izin verilenler listesinde mi? " + allowedEmails.includes(userEmail));

            // Giriş yapan kullanıcının e-posta adresinin izin verilenler listesinde olup olmadığını kontrol et
            if (allowedEmails.includes(userEmail)) {
                // Giriş başarılı, kullanıcı bilgilerini göster
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                // Yetkilendirme başarılı: Token'ı localStorage'a kaydet
                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail); // E-postayı da kaydedelim

                displayAuthorizedUI(decodedToken);

            } else {
                // Yetkisiz e-posta adresi
                console.warn("Erişim Reddedildi: " + userEmail + " adresi için yetki yok.");
                showAccessDenied("Bu e-posta (" + userEmail + ") ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                
                // Yetkisiz kullanıcılar için tüm bilgileri temizle ve arayüzü sıfırla
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI();

                // Google One-Tap'ın tekrar otomatik açılmasını engellemek için iptal et
                google.accounts.id.cancel();
            }
        } else {
            console.error("Kimlik doğrulama başarısız: E-posta bulunamadı veya token geçersiz.");
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            resetUI(); // Arayüzü sıfırla
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
        accessDeniedMessage.style.display = 'none'; // Yetkili kullanıcıda hata mesajı gizli olmalı

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });
        
        document.getElementById('main-systems-section').style.display = 'grid';
        document.getElementById('other-systems-section').style.display = 'grid';
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton.addEventListener('click', () => {
        // Google oturumunu tamamen kapat (One-Tap için genellikle gerekmez ama temiz bir çıkış için iyi)
        google.accounts.id.disableAutoSelect(); // Otomatik seçimi devre dışı bırak
        // İsteğe bağlı: google.accounts.id.revoke('TOKEN_BURAYA_GELIR', done => { ... });

        // localStorage'daki kimlik bilgilerini temizle
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        
        resetUI(); // Arayüzü sıfırla
        alert("Başarıyla çıkış yaptınız.");
        // İsterseniz sayfayı yeniden yükleyebilirsiniz: window.location.reload();
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

    // Sayfa yüklendiğinde oturum kontrolü yap
    // Bu kısım, sayfa yenilendiğinde oturumu sürdürmek için kritik!
    const savedToken = localStorage.getItem('google_id_token');
    const savedEmail = localStorage.getItem('user_email');

    if (savedToken && savedEmail) {
        const decodedToken = parseJwt(savedToken);
        // Token'ın süresinin dolup dolmadığını kontrol etmek iyi bir uygulamadır.
        // decodedToken.exp * 1000 < Date.now() ise token süresi dolmuştur.
        if (decodedToken && decodedToken.email && allowedEmails.includes(savedEmail)) {
            // Kaydedilmiş token ve e-posta geçerliyse ve yetkiliyse, UI'yı güncelle
            profilePicture.src = decodedToken.picture;
            profileName.textContent = decodedToken.name;
            profileEmail.textContent = savedEmail;
            displayAuthorizedUI(decodedToken);
            console.log("Kayıtlı oturum bulundu ve aktif.");
        } else {
            // Kaydedilmiş token geçersiz veya e-posta yetkisizse oturumu temizle
            console.warn("Kayıtlı oturum geçersiz veya yetkisiz. Temizleniyor.");
            localStorage.removeItem('google_id_token');
            localStorage.removeItem('user_email');
            resetUI();
            google.accounts.id.prompt(); // Otomatik seçimi tekrar tetikle (isteğe bağlı)
        }
    } else {
        // Hiç kaydedilmiş oturum yoksa, arayüzü sıfırla ve Google girişini göster
        console.log("Kayıtlı oturum bulunamadı. Giriş bekleniyor.");
        resetUI();
        google.accounts.id.prompt(); // One-Tap pop-up'ını tetikle
    }

    // Buton tıklama olayları
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                // Burada tekrar yetki kontrolü yapmak isteyebilirsiniz,
                // ancak CSS'teki pointer-events zaten tıklamayı engellemiş olmalı.
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
