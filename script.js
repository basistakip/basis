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
        "mahmutkilicankara@gmail.com",
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
                google.accounts.id.cancel();
                
                // Kullanıcı giriş yaptıktan sonra geri sayımları başlat
                countdowns.forEach(c => createCountdown(c.date, c.hour, c.minute, c.text));
            } else {
                console.warn("Yetkisiz e-posta: " + userEmail + ". Erişim reddedildi.");
                showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                localStorage.removeItem('google_id_token');
                localStorage.removeItem('user_email');
                resetUI(true);
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
                
                // Oturum açıkken geri sayımları başlat
                countdowns.forEach(c => createCountdown(c.date, c.hour, c.minute, c.text));
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
     // login aşağı yı aç  initializeAuthFlow();

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

// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
const countdowns = [
    { date: 10, hour: 0, minute: 0, text: 'Sayaç Okuma' },
    { date: 15, hour: 0, minute: 0, text: 'Sayaç Gönderme' },
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama' },
      { date: 13, hour: 0, minute: 0, text: 'YEDEK 1' },
        { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 15, hour: 0, minute: 0, text: 'YEDEK 3' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
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
