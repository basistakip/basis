// --- Google Sign-In Yönetimi BAŞLANGIÇ ---

// Bu fonksiyon, Google kimlik bilgileri döndüğünde otomatik olarak çağrılır.
function handleCredentialResponse(response) {
    // Google ID token'ını decode etmek için bir yardımcı fonksiyon (isteğe bağlı ama iyi pratik)
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

    // Kullanıcı bilgilerini localStorage'a kaydet (sessionStorage yerine)
    localStorage.setItem('google_id_token', response.credential);
    localStorage.setItem('profile_name', profile.name);
    localStorage.setItem('profile_email', profile.email);
    localStorage.setItem('profile_picture', profile.picture);

    // Giriş yapıldıktan sonra UI'ı güncelle
    updateUIForLoggedInUser();
}

// UI'ı giriş durumuna göre güncelleyen fonksiyon
function updateUIForLoggedInUser() {
    const googleSigninSection = document.querySelector('.google-signin-section');
    const profileInfo = document.getElementById('profile-info');
    const googleSigninButton = document.getElementById('google-signin-button');
    const contentArea = document.getElementById('content-area');
    const profilePicture = document.getElementById('profile-picture');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const accessDenied = document.getElementById('access-denied'); // Erişim reddedildi mesajı

    const idToken = localStorage.getItem('google_id_token');
    const storedName = localStorage.getItem('profile_name');
    const storedEmail = localStorage.getItem('profile_email');
    const storedPicture = localStorage.getItem('profile_picture');

    // Yetkilendirilmiş e-posta adreslerini tanımlayın
    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
        "ygtcan10@gmail.com",
        // Ek yetkili e-postaları buraya ekleyin
    ];

    if (idToken && storedEmail) {
        // Kullanıcının e-postası yetkili listede mi kontrol et
        if (allowedEmails.includes(storedEmail)) {
            googleSigninButton.style.display = 'none'; // Google giriş butonunu gizle
            profileInfo.style.display = 'flex'; // Profil bilgisini göster
            contentArea.style.display = 'block'; // İçerik alanını göster

            profilePicture.src = storedPicture;
            profileName.textContent = storedName;
            profileEmail.textContent = storedEmail;
            accessDenied.style.display = 'none'; // Erişim reddedildi mesajını gizle
        } else {
            // Yetkisiz kullanıcı
            googleSigninButton.style.display = 'none'; // Giriş butonunu gizle
            profileInfo.style.display = 'none'; // Profil bilgisini gizle
            contentArea.style.display = 'none'; // İçerik alanını gizle
            accessDenied.style.display = 'block'; // Erişim reddedildi mesajını göster
            alert("Bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
            // Yetkisiz kullanıcı için oturumu kapat
            localStorage.clear(); // Tüm oturum verilerini temizle
            // Sayfayı yenileyerek giriş ekranına dön (isteğe bağlı)
            // location.reload();
        }
    } else {
        // Giriş yapılmamışsa veya token yoksa
        googleSigninButton.style.display = 'block'; // Google giriş butonunu göster
        profileInfo.style.display = 'none'; // Profil bilgisini gizle
        contentArea.style.display = 'none'; // İçerik alanını gizle
        accessDenied.style.display = 'none'; // Erişim reddedildi mesajını gizle
    }
}

// Çıkış yap butonu işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Sadece uygulamanın oturum verilerini temizle ve sayfayı yenile
            localStorage.clear(); // Tüm oturum verilerini temizle
            // Sayfayı yenileyerek giriş ekranına dön
            location.reload();
        });
    }

    // Sayfa yüklendiğinde giriş durumunu kontrol et ve UI'ı güncelle
    updateUIForLoggedInUser();
});
// --- Google Sign-In Yönetimi BİTİŞ ---


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
