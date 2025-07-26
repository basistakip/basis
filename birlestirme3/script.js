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

    // Kullanıcı bilgilerini oturum depolamasına kaydet
    // Bu, sayfa yenilendiğinde giriş durumunu korumamızı sağlar.
    sessionStorage.setItem('google_id_token', response.credential);
    sessionStorage.setItem('profile_name', profile.name);
    sessionStorage.setItem('profile_email', profile.email);
    sessionStorage.setItem('profile_picture', profile.picture);

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

    const idToken = sessionStorage.getItem('google_id_token');
    const storedName = sessionStorage.getItem('profile_name');
    const storedEmail = sessionStorage.getItem('profile_email');
    const storedPicture = sessionStorage.getItem('profile_picture');

    // Yetkilendirilmiş e-posta adreslerini tanımlayın
    const allowedEmails = [
        "eren.b.cetin@gmail.com",
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
            sessionStorage.clear(); // Tüm oturum verilerini temizle
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
            // Google One Tap oturumunu kapat (isteğe bağlı, API'ya bağlı)
            if (google.accounts.id) {
                google.accounts.id.disableAutoSelect(); // Otomatik seçimi kapat
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // Oturum kapatma işlemi tamamlandı, oturum verilerini temizle
                        sessionStorage.clear(); // Tüm oturum verilerini temizle
                        updateUIForLoggedInUser(); // UI'ı güncelle
                        location.reload(); // Sayfayı yenile (isteğe bağlı)
                    }
                });
            } else {
                // Google API'si yüklenmemişse bile oturum verilerini temizle
                sessionStorage.clear(); // Tüm oturum verilerini temizle
                updateUIForLoggedInUser(); // UI'ı güncelle
                location.reload(); // Sayfayı yenile (isteğe bağlı)
            }
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
countdowns.forEach(createCountdown);
// --- GERİ SAYIM KODLARI BİTİŞ ---
