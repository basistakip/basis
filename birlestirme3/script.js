
// --- BUTON TIKLAMA YÖNETİMİ BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', function() {
    // Event delegation kullanarak tüm document'e click eventi ekle
    document.addEventListener('click', function(e) {
        // Tıklanan elementin veya ebeveynlerinden birinin system-button class'ı olup olmadığını kontrol et
        const button = e.target.closest('.system-button');
        
        if (button) {
            // Eğer bu bir arama butonuysa veya özel bir iframe içeriyorsa işlem yapma
            if (button.classList.contains('search-bar-wide') || button.querySelector('iframe')) {
                return;
            }

            // URL'yi data-url attribute'undan al
            const url = button.getAttribute('data-url');
            
            if (url && url !== '#' && url !== '') {
                // Kullanıcı giriş yapmış mı kontrol et
                const isLoggedIn = !!sessionStorage.getItem('google_id_token');
                
                if (isLoggedIn) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                    alert("Lütfen önce Google hesabınızla giriş yapın!");
                }
            }
        }
    });
});
// --- BUTON TIKLAMA YÖNETİMİ BİTİŞ ---


// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
const countdowns = [
    // Mevcut aylık geri sayımlar (URL ekleme isteğe bağlıdır, boş bırakılırsa eski gibi çalışır)
    { date: 10, hour: 0, minute: 0, text: 'Sayaç Okuma', url: 'https://www.ornekurl.com/sayac-okuma' },
    { date: 15, hour: 0, minute: 0, text: 'Sayaç Gönderme', url: '' }, // URL boş bırakıldı
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama', url: 'https://www.ornekurl.com/raporlar' },
    { date: 13, hour: 0, minute: 0, text: 'YEDEK 1', url: '' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2', url: '' },
    { date: 15, hour: 0, minute: 0, text: 'YEDEK 3', url: '' },
    // Yıllık geri sayım - Haziran 12
    { type: 'annual', month: 5, date: 12, hour: 9, minute: 0, text: 'Yıllık Bakım Tarihi', url: 'https://www.ornekurl.com/yillik-bakim' },
    // Yıllık geri sayım - Ağustos 15
    { type: 'annual', month: 7, date: 15, hour: 10, minute: 0, text: 'Yıllık Kontrol Tarihi', url: 'https://www.ornekurl.com/yillik-kontrol' },
    // Tek seferlik geri sayım - 2028 Haziran 1
    { type: 'one-time', year: 2028, month: 5, date: 1, hour: 0, minute: 0, text: 'İşletme İh. Bitiş Tarihi', url: 'https://www.ornekurl.com/proje-bitis' },
    // Tek seferlik geri sayım - 2030 Ocak 1
    { type: 'one-time', year: 2030, month: 0, date: 1, hour: 0, minute: 0, text: 'Jen Yakıt tarihi Yeni Yıl Kutlaması', url: 'https://www.ornekurl.com/yeni-yil' }
];

function createCountdown(countdownConfig) {
    // URL parametresini de konfigürasyondan alıyoruz
    const { type, year, date, month, hour, minute, text, url } = countdownConfig;

    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.innerHTML = `
        <p>${text}</p>
        <p id="timer-${text.replace(/\s+/g, '-').replace(/[^\w-]/g, '')}"></p>
        <button>Gördüm</button>
    `;

    document.getElementById('counters').appendChild(counter);
    const timer = counter.querySelector('p:nth-child(2)');
    const button = counter.querySelector('button');

    let targetDate;
    let seen = false;

    function getNextTargetDate() {
        const now = new Date();
        let target;

        if (type === 'annual') {
            target = new Date(now.getFullYear(), month, date, hour, minute, 0);
            if (now > target) {
                target.setFullYear(target.getFullYear() + 1);
            }
        } else if (type === 'one-time') {
            target = new Date(year, month, date, hour, minute, 0);
        } else {
            target = new Date(now.getFullYear(), now.getMonth(), date, hour, minute, 0);
            if (now > target) {
                target.setMonth(target.getMonth() + 1);
            }
        }
        return target;
    }

    function update() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            timer.textContent = "SÜRE DOLDU!";
            if (!seen) counter.classList.add('blinking-red');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        timer.textContent = `${days}g ${Math.floor(hours)}s ${mins}d ${secs}sn`;

        // Efektleri yönet
        counter.classList.remove('blinking-red', 'blinking-yellow');
        if (!seen) {
            if (type === 'annual') {
                if (days <= 5) counter.classList.add('blinking-red');
                else if (days <= 15) counter.classList.add('blinking-yellow');
            } else {
                if (days <= 2) counter.classList.add('blinking-red');
                else if (days <= 4) counter.classList.add('blinking-yellow');
            }
        }
    }

    // "Gördüm" butonuna tıklama olayını güncelliyoruz
    button.addEventListener('click', () => {
        seen = true;
        counter.classList.remove('blinking-red', 'blinking-yellow');
        counter.style.background = '#e6f2ff';

        // URL varsa yeni sekmede aç
        if (url && url !== '') { // URL'nin boş veya tanımsız olup olmadığını kontrol ediyoruz
            window.open(url, '_blank'); // '_blank' yeni sekmede açılmasını sağlar
        }
    });

    targetDate = getNextTargetDate();
    setInterval(update, 1000);
    update();
}

// Tüm geri sayımları oluştur
countdowns.forEach(c => createCountdown(c));
// --- GERİ SAYIM KODLARI BİTİŞ ---
// --- GERİ SAYIM KODLARI BİTİŞ ---





        document.addEventListener('DOMContentLoaded', () => {
            // HTML elementlerini seç
            const profileInfo = document.getElementById('profile-info');
            const profilePicture = document.getElementById('profile-picture');
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const logoutButton = document.getElementById('logout-button');
            const accessDeniedMessage = document.getElementById('access-denied');
            const googleSignInButton = document.querySelector('.g_id_signin');
            const contentArea = document.getElementById('content-area');

            // --- İZİN VERİLEN E-POSTA ADRESLERİ LİSTESİ ---
            const allowedEmails = [
                "mahmutkilicankara@gmail.com",
                "ikinci.izinli.kullanici@example.com",
                "ucuncu.kullanici@gmail.com"
            ];
            // --------------------------------------------------------

            // Global fonksiyon: Google kimlik bilgileri yanıtını işler
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

                        // localStorage yerine sessionStorage kullanabiliriz
                        sessionStorage.setItem('google_id_token', idToken);
                        sessionStorage.setItem('user_email', userEmail);

                        displayAuthorizedUI(decodedToken);
                        google.accounts.id.cancel();
                    } else {
                        // Yetkisiz kullanıcı
                        console.warn("Yetkisiz e-posta: " + userEmail);
                        showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                        
                        // Sadece giriş butonunu gizle, erişim reddi mesajını göster
                        googleSignInButton.style.display = 'none';
                        profileInfo.style.display = 'none';
                        contentArea.style.display = 'none';
                        
                        sessionStorage.removeItem('google_id_token');
                        sessionStorage.removeItem('user_email');
                        google.accounts.id.cancel();
                    }
                } else {
                    console.error("Kimlik doğrulama başarısız.");
                    showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
                    resetUI();
                }
            };

            // JWT çözümleme fonksiyonu
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

            // Erişim engellendi mesajını göster
            function showAccessDenied(message) {
                accessDeniedMessage.textContent = message;
                accessDeniedMessage.style.display = 'block';
                if (window.accessDeniedTimeout) {
                    clearTimeout(window.accessDeniedTimeout);
                }
                window.accessDeniedTimeout = setTimeout(() => {
                    accessDeniedMessage.style.display = 'none';
                    window.accessDeniedTimeout = null;
                    // Mesaj gizlendikten sonra giriş butonunu tekrar göster
                    googleSignInButton.style.display = 'block';
                }, 8000);
            }

            // Yetkili kullanıcı UI'ını göster
            function displayAuthorizedUI(decodedToken) {
                profileInfo.style.display = 'flex';
                googleSignInButton.style.display = 'none';
                accessDeniedMessage.style.display = 'none';
                contentArea.style.display = 'block';

                // Burada özel içerik ekleyebilirsiniz
                document.getElementById('user-content').innerHTML = `
                    <p><strong>Kullanıcı Bilgileri:</strong></p>
                    <p>Ad: ${decodedToken.name}</p>
                    <p>E-posta: ${decodedToken.email}</p>
                    <p>Giriş Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
                `;
            }

            // UI'ı başlangıç durumuna sıfırla
            function resetUI() {
                profileInfo.style.display = 'none';
                googleSignInButton.style.display = 'block';
                accessDeniedMessage.style.display = 'none';
                contentArea.style.display = 'none';
            }

            // Çıkış yap butonu
            logoutButton.addEventListener('click', () => {
                google.accounts.id.disableAutoSelect();
                sessionStorage.removeItem('google_id_token');
                sessionStorage.removeItem('user_email');
                resetUI();
                alert("Başarıyla çıkış yaptınız.");
                google.accounts.id.prompt();
            });

            // Sayfa yüklendiğinde oturum kontrolü
            function initializeAuthFlow() {
                const savedToken = sessionStorage.getItem('google_id_token');
                const savedEmail = sessionStorage.getItem('user_email');
                
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
                        console.warn("Kayıtlı oturum geçersiz veya süresi dolmuş.");
                        sessionStorage.removeItem('google_id_token');
                        sessionStorage.removeItem('user_email');
                        resetUI();
                        google.accounts.id.prompt();
                    }
                } else {
                    console.log("Kayıtlı oturum bulunamadı.");
                    resetUI();
                    google.accounts.id.prompt();
                }
            }

            // Uygulamayı başlat
            initializeAuthFlow();

            // Global erişim için fonksiyonları dışa aktar (isteğe bağlı)
            window.loginSystem = {
                isLoggedIn: () => !!sessionStorage.getItem('google_id_token'),
                getCurrentUser: () => {
                    const token = sessionStorage.getItem('google_id_token');
                    return token ? parseJwt(token) : null;
                },
                logout: () => logoutButton.click()
            };
        });
