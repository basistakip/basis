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
                google.accounts.id.cancel(); 
            } else {
                console.warn("Yetkisiz e-posta: " + userEmail + ". Erişim reddedildi.");
                
                // Mesajı göster ve arayüzü sıfırla
                showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                
                // Yetkisiz kullanıcılar için sadece çıkış butonu gösterilir, giriş butonu gizlenir
                // NOT: resetUI çağrısı içinde hata mesajı da gizleniyor olabilir, bu yüzden daha dikkatli olmalıyız.
                resetUI(true); // Parametre göndererek giriş butonunu gizli tutuyoruz
                
                // Hata mesajının resetUI tarafından hemen gizlenmediğinden emin olmak için
                // showAccessDenied'den sonra yeniden görünür yapma denemesi (bir sonraki adımda detaylı).
                
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
    // *** BURADA ÖNEMLİ DEĞİŞİKLİK VAR ***
    function showAccessDenied(message) {
        // Önceki zamanlayıcı varsa temizle
        if (window.accessDeniedTimeout) {
            clearTimeout(window.accessDeniedTimeout);
        }

        // Mesajı güncelle ve görünür yap
        accessDeniedMessage.textContent = message;
        accessDeniedMessage.style.display = 'block';
        console.log("Erişim engellendi mesajı GÖSTERİLDİ: '" + message + "'");

        // Elementin gerçekten görünür olup olmadığını kontrol etmek için ufak bir gecikme ekleyelim.
        // Bu, eğer mesaj hemen başka bir CSS/JS tarafından eziliyorsa yardımcı olabilir.
        setTimeout(() => {
             const computedStyle = window.getComputedStyle(accessDeniedMessage);
             console.log("accessDeniedMessage Computed Display Style:", computedStyle.display);
             if (computedStyle.display === 'none') {
                 console.warn("UYARI: accessDeniedMessage beklenenden önce gizlendi! Başka bir CSS/JS kuralı çakışıyor olabilir.");
                 // Zorla tekrar gösterelim
                 accessDeniedMessage.style.display = 'block';
             }
        }, 50); // Çok kısa bir gecikme

        // Mesajı belirli bir süre sonra gizlemek için yeni zamanlayıcıyı ayarla
        window.accessDeniedTimeout = setTimeout(() => {
            accessDeniedMessage.style.display = 'none';
            window.accessDeniedTimeout = null;
            console.log("Erişim engellendi mesajı GİZLENDİ.");
        }, 8000); // 8 saniye sonra gizle
    }

    function displayAuthorizedUI(decodedToken) {
        profileInfo.style.display = 'flex';
        logoutButton.style.display = 'block';
        googleSignInButton.style.display = 'none';
        accessDeniedMessage.style.display = 'none'; // Yetkili kullanıcıda hata mesajı kesinlikle gizli olmalı

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

    // resetUI fonksiyonunu optimize edelim
    function resetUI(hideGoogleSignIn = false) {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        
        if (hideGoogleSignIn) {
            googleSignInButton.style.display = 'none'; 
        } else {
            googleSignInButton.style.display = 'block'; 
        }
        
        // Buradaki accessDeniedMessage.style.display = 'none'; satırı, 
        // yetkisiz giriş yapıldığında mesajı hemen gizleyebilir.
        // Bu yüzden bu satırı yetkisiz giriş senaryosunda showAccessDenied'den sonra çağırırken dikkatli olmalıyız.
        // Şimdilik sadece yetkili durumunda veya çıkışta çağırmak daha mantıklı.
        // Veya `showAccessDenied` fonksiyonunun kendisi mesajın durumunu yönetmeli.
        // Güvenli olması için, resetUI'nin bu satırı sadece belirli durumlarda çalıştırmasını sağlayalım
        // Eğer bir hata mesajı gösteriliyorsa ve resetUI çağrılıyorsa, mesajın hemen gizlenmemesi için 
        // accessDeniedMessage.style.display = 'none'; satırını bu senaryoda çalıştırmayalım.
        
        // Şu anki senaryoda, resetUI yetkisiz bir giriş olduğunda çağrıldığında,
        // showAccessDenied zaten mesajı gösterecek ve zamanlayıcıyı kuracak.
        // Eğer resetUI, mesajın hemen gizlenmesine neden olursa, burayı kaldırmak gerekebilir.
        // Şimdilik, sadece authorizedUI'de veya logout'ta açıkça gizlendiğinden emin olalım.
        // Test için bu satırı yorum satırı yapabilirsiniz:
        // accessDeniedMessage.style.display = 'none'; 

        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
        console.log("UI sıfırlandı. Google SignIn butonu görünürlüğü: " + googleSignInButton.style.display);
    }

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

    initializeAuthFlow();

    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
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
