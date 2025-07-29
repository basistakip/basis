// --- GOOGLE SIGN-IN YÖNETİMİ BAŞLANGIÇ ---
// Bu fonksiyon, Google kimlik bilgileri döndüğünde otomatik olarak çağrılır.
function handleCredentialResponse(response) {
    // JWT token'ını decode etmek için yardımcı fonksiyon
    const decodeJwtResponse = (token) => {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    const profile = decodeJwtResponse(response.credential);
    console.log("ID Token Payload:", profile);

    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem('google_id_token', response.credential);
    localStorage.setItem('profile_name', profile.name);
    localStorage.setItem('profile_email', profile.email);
    localStorage.setItem('profile_picture', profile.picture);

    // Giriş yapıldıktan sonra UI'ı güncelle
    updateUIForLoggedInUser();
}

// UI'ı giriş durumuna göre güncelleyen fonksiyon
function updateUIForLoggedInUser() {
    const googleSigninButton = document.getElementById('google-signin-button');
    const profileInfo = document.getElementById('profile-info');
    const contentArea = document.getElementById('content-area');
    const accessDenied = document.getElementById('access-denied');

    const idToken = localStorage.getItem('google_id_token');
    const storedEmail = localStorage.getItem('profile_email');

    // Yetkilendirilmiş e-posta adresleri
    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
        "ygtcan10@gmail.com",
    ];

    if (idToken && storedEmail) {
        if (allowedEmails.includes(storedEmail)) {
            googleSigninButton.style.display = 'none';
            profileInfo.style.display = 'flex';
            contentArea.style.display = 'block';
            accessDenied.style.display = 'none';
        } else {
            googleSigninButton.style.display = 'none';
            profileInfo.style.display = 'none';
            contentArea.style.display = 'none';
            accessDenied.style.display = 'block';
            localStorage.clear();
        }
    } else {
        googleSigninButton.style.display = 'block';
        profileInfo.style.display = 'none';
        contentArea.style.display = 'none';
        accessDenied.style.display = 'none';
    }
}

// Çıkış yap butonu işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    }
    updateUIForLoggedInUser();
});
// --- GOOGLE SIGN-IN YÖNETİMİ BİTİŞ ---

// --- BUTON TIKLAMA YÖNETİMİ BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.system-button');
        if (button && !button.classList.contains('search-bar-wide') && !button.querySelector('iframe')) {
            const url = button.getAttribute('data-url');
            if (url && url !== '#' && url !== '') {
                const isLoggedIn = !!localStorage.getItem('google_id_token');
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
const countdowns = [
    // AYLIK GERİ SAYIMLAR
    { date: 1, hour: 0, minute: 0, text: 'Sayaç Okuma', type: 'monthly' },
    { date: 15, hour: 0, minute: 0, text: 'Fatura Hesaplama', type: 'monthly' },
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama', type: 'monthly' },
    
    // YILLIK GERİ SAYIM (HER YIL 1 HAZİRAN)
    { date: 1, month: 5, hour: 0, minute: 0, text: 'Yıllık Bakım', type: 'yearly' }, // month: 5 = Haziran (0-11 arası)
    
    // HAFTALIK GERİ SAYIM (HER PAZAR)
    { day: 0, hour: 0, minute: 0, text: 'Haftalık Toplantı', type: 'weekly' } // day: 0 = Pazar (0-6 arası)
];

function createCountdown(config) {
    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.innerHTML = `
        <p>${config.text}</p>
        <p id="timer-${config.text.replace(/\s+/g, '-')}"></p>
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
        
        if (config.type === 'yearly') {
            // YILLIK: Her yıl belirtilen ay ve güne (1 Haziran)
            target = new Date(now.getFullYear(), config.month, config.date, config.hour, config.minute, 0);
            if (now > target) {
                target.setFullYear(target.getFullYear() + 1);
            }
        } 
        else if (config.type === 'weekly') {
            // HAFTALIK: Her hafta belirtilen güne (Pazar)
            target = new Date(now);
            target.setDate(now.getDate() + (config.day + 7 - now.getDay()) % 7);
            target.setHours(config.hour, config.minute, 0, 0);
            if (now > target) {
                target.setDate(target.getDate() + 7);
            }
        } 
        else {
            // AYLIK (varsayılan): Her ay belirtilen güne
            target = new Date(now.getFullYear(), now.getMonth(), config.date, config.hour, config.minute, 0);
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

        // Efektleri yönet (2 gün kırmızı, 4 gün sarı)
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
countdowns.forEach(c => createCountdown(c));
// --- GERİ SAYIM KODLARI BİTİŞ ---
