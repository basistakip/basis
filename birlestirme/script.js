// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
const countdowns = [
    { date: 10, hour: 0, minute: 0, text: 'Sayaç Okuma' },
    { date: 15, hour: 0, minute: 0, text: 'Sayaç Gönderme' },
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama' },
    { date: 13, hour: 0, minute: 0, text: 'YEDEK 1' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 15, hour: 0, minute: 0, text: 'YEDEK 3' }
];

function createCountdown(date, hour, minute, text) {
    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.innerHTML = `
        <p>${text}</p>
        <p id="timer-${text.replace(/\s+/g, '-')}"></p>
        <button>Gördüm</button>
    `;

    document.getElementById('counters').appendChild(counter);
    const timer = counter.querySelector('p:nth-child(2)');
    const button = counter.querySelector('button');

    let targetDate;
    let seen = false;

    function getNextTargetDate() {
        const now = new Date();
        let target = new Date(now.getFullYear(), now.getMonth(), date, hour, minute, 0);
        
        if (now > target) {
            target.setMonth(target.getMonth() + 1);
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
            if (days <= 2) counter.classList.add('blinking-red');
            else if (days <= 4) counter.classList.add('blinking-yellow');
        }
    }

    button.addEventListener('click', () => {
        seen = true;
        counter.classList.remove('blinking-red', 'blinking-yellow');
        counter.style.background = '#e6f2ff';
    });

    targetDate = getNextTargetDate();
    setInterval(update, 1000);
    update();
}

// Tüm geri sayımları oluştur
countdowns.forEach(c => createCountdown(c.date, c.hour, c.minute, c.text));
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
