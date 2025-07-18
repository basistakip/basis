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

                localStorage.setItem('google_id_token', idToken);
                localStorage.setItem('user_email', userEmail); 

                displayAuthorizedUI(decodedToken);
                google.accounts.id.cancel(); // Başarılı girişten sonra One-Tap'ı kapat
            }  else {
    console.warn("Yetkisiz e-posta: " + userEmail + ". Erişim reddedildi.");
    
    // YETKİSİZ KULLANICI İÇİN ARAYÜZ YÖNETİMİ
    // Profili ve çıkış butonunu gizle
    profileInfo.style.display = 'none';
    logoutButton.style.display = 'none';

    // Google giriş butonunu görünür yap (kullanıcının tekrar denemesini sağlamak için)
    googleSignInButton.style.display = 'block';

    // İçeriği gizle
    document.getElementById('main-systems-section').style.display = 'none';
    document.getElementById('other-systems-section').style.display = 'none';
    
    // Uyarı mesajını göster ve içeriği kilitli hale getir
    showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
    
    // Linklerin çalışmasını engelle (butonları pasif hale getir)
    systemButtons.forEach(button => {
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
    });

    localStorage.removeItem('google_id_token');
    localStorage.removeItem('user_email');
    google.accounts.id.cancel();
}
        } else {
            console.error("Kimlik doğrulama başarısız: E-posta bulunamadı veya token geçersiz.");
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            localStorage.removeItem('google_id_token');
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
        console.log("Erişim engellendi mesajı gösterildi: " + message);

        if (window.accessDeniedTimeout) {
            clearTimeout(window.accessDeniedTimeout);
        }
        window.accessDeniedTimeout = setTimeout(() => {
        accessDeniedMessage.style.display = 'none';
            window.accessDeniedTimeout = null;
            console.log("Erişim engellendi mesajı gizlendi.");
        }, 8000); // 8 saniye sonra gizle
    }

    // Arayüzü yetkili kullanıcıya göre ayarla
    function displayAuthorizedUI(decodedToken) {
        profileInfo.style.display = 'flex';
        logoutButton.style.display = 'block';
        googleSignInButton.style.display = 'none'; // Giriş butonu gizli kalmalı
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
        google.accounts.id.disableAutoSelect(); 
        localStorage.removeItem('google_id_token');
        localStorage.removeItem('user_email');
        
        resetUI(); // Arayüzü sıfırla, bu durumda giriş butonu görünecek
        alert("Başarıyla çıkış yaptınız. Tekrar giriş yapmak için lütfen Google ile giriş yapın.");
        google.accounts.id.prompt(); // One-Tap'ı tekrar tetikle
    });

    // Arayüzü başlangıç durumuna sıfırla (yani giriş yapılmamış durum)
    // showGoogleSignIn parametresi, Google giriş butonunun gösterilip gösterilmeyeceğini kontrol eder.
    function resetUI(hideGoogleSignIn = false) { // Varsayılan olarak gösterme açıktır
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        
        // Sadece hideGoogleSignIn true ise Google giriş butonunu gizle
        if (hideGoogleSignIn) {
            googleSignInButton.style.display = 'none'; 
        } else {
            googleSignInButton.style.display = 'block'; // Varsayılan olarak göster
        }
        
        accessDeniedMessage.style.display = 'none'; // resetUI çağrıldığında mesajı gizle

        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
        console.log("UI sıfırlandı.");
    }

    // --- Sayfa Yüklendiğinde Oturum Kontrol ve Başlatma Mantığı ---
    function initializeAuthFlow() {
        const savedToken = localStorage.getItem('google_id_token');
        const savedEmail = localStorage.getItem('user_email');

        if (savedToken && savedEmail) {
            const decodedToken = parseJwt(savedToken);
            const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

            if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                console.log("Kayıtlı ve geçerli oturum bulundu: " + savedEmail);
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = savedEmail;
                displayAuthorizedUI(decodedToken);
                // Oturum açık olduğu için One-Tap'ı tetikleme!
            } else {
                console.warn("Kayıtlı oturum geçersiz, süresi dolmuş veya yetkisiz. Temizleniyor.");
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI(); // Yetkisizse normal sıfırlama, giriş butonu görünecek
                google.accounts.id.prompt(); 
            }
        } else {
            console.log("Kayıtlı oturum bulunamadı. Google One-Tap tetikleniyor.");
            resetUI(); // Oturum yoksa normal sıfırlama, giriş butonu görünecek
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
