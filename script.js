/**
 * GOOGLE GİRİŞ SİSTEMİ
 * Kullanıcı Google ile giriş yaptığında çalışan fonksiyon
 * @param {object} response - Google'dan gelen giriş yanıtı
 */
function handleCredentialResponse(response) {
    // JWT token'ını decode eden yardımcı fonksiyon
    const decodeJwtResponse = (token) => {
        try {
            // Token'ı parçalara ayır (header.payload.signature)
            const base64Url = token.split('.')[1];
            
            // Base64URL'yi standart Base64'e çevir
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // Base64'ü string'e çevir (UTF-8 desteği ile)
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => 
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            
            return JSON.parse(jsonPayload); // JSON objesine dönüştür
        } catch (e) {
            console.error("Token decode hatası:", e);
            return null;
        }
    };

    // Token'dan kullanıcı bilgilerini al
    const profile = decodeJwtResponse(response.credential);
    if (!profile) return; // Hata durumunda fonksiyondan çık

    // Kullanıcı bilgilerini konsola yaz (debug için)
    console.log("Giriş Yapan Kullanıcı:", profile);
    
    // Bilgileri tarayıcıda sakla
    localStorage.setItem('google_id_token', response.credential); // Kimlik tokenı
    localStorage.setItem('profile_name', profile.name); // Kullanıcı adı
    localStorage.setItem('profile_email', profile.email); // E-posta
    localStorage.setItem('profile_picture', profile.picture); // Profil resmi

    // Arayüzü güncelle
    updateUIForLoggedInUser();
}

/**
 * GİRİŞ DURUMUNA GÖRE ARAYÜZÜ GÜNCELLE
 * Kullanıcının giriş yapıp yapmadığını kontrol eder
 */
function updateUIForLoggedInUser() {
    // HTML elementlerini seç
    const googleSigninButton = document.getElementById('google-signin-button');
    const profileInfo = document.getElementById('profile-info');
    const contentArea = document.getElementById('content-area');
    const accessDenied = document.getElementById('access-denied');

    // LocalStorage'dan kullanıcı bilgilerini al
    const idToken = localStorage.getItem('google_id_token');
    const storedEmail = localStorage.getItem('profile_email');

    // Yetkili e-posta listesi (whitelist)
    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
        "ygtcan10@gmail.com"
    ];

    // Kullanıcı giriş yapmışsa
    if (idToken && storedEmail) {
        // E-posta yetkili listede mi kontrol et
        if (allowedEmails.includes(storedEmail)) {
            // YETKİLİ KULLANICI
            googleSigninButton.style.display = 'none'; // Giriş butonunu gizle
            profileInfo.style.display = 'flex'; // Profil bilgisini göster
            contentArea.style.display = 'block'; // İçerik alanını göster
            accessDenied.style.display = 'none'; // Erişim reddi mesajını gizle
        } else {
            // YETKİSİZ KULLANICI
            googleSigninButton.style.display = 'none';
            profileInfo.style.display = 'none';
            contentArea.style.display = 'none';
            accessDenied.style.display = 'block'; // Erişim reddi mesajını göster
            localStorage.clear(); // Kullanıcı verilerini temizle
        }
    } else {
        // GİRİŞ YAPILMAMIŞSA
        googleSigninButton.style.display = 'block'; // Giriş butonunu göster
        profileInfo.style.display = 'none';
        contentArea.style.display = 'none';
        accessDenied.style.display = 'none';
    }
}

/**
 * SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR
 */
document.addEventListener('DOMContentLoaded', function() {
    // ÇIKIŞ BUTONU AYARLARI
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); // Tüm kullanıcı verilerini sil
            location.reload(); // Sayfayı yenile
        });
    }

    // Giriş durumunu kontrol et
    updateUIForLoggedInUser();

    // GERİ SAYIM KONFİGÜRASYONLARI
    const countdowns = [
        // AYLIK SAYAÇLAR
        { 
            date: 1, 
            hour: 0, 
            minute: 0, 
            text: 'Sayaç Okuma', 
            type: 'monthly',
            desc: 'Elektrik sayaç okumalarının yapılacağı tarih',
            url: 'https://ornek.com/sayac-okuma'
        },
        { 
            date: 15, 
            hour: 0, 
            minute: 0, 
            text: 'Fatura Hesaplama', 
            type: 'monthly',
            desc: 'Aylık faturaların kesileceği tarih',
            url: 'https://ornek.com/fatura'
        },
        
        // YILLIK SAYAÇLAR
        { 
            date: 1, 
            month: 5, // Haziran (0-11)
            hour: 0, 
            minute: 0, 
            text: 'Yıllık Bakım', 
            type: 'yearly',
            desc: 'Yıllık sistem bakım tarihi',
            url: 'https://ornek.com/yillik-bakim'
        },
        
        // YENİ EKLENEN SAYAÇLAR
        { 
            date: 13, 
            hour: 10, 
            minute: 0, 
            text: 'Aylık Yedek1 Sayaç', 
            type: 'monthly',
            desc: 'Aylık veri yedekleme tarihi',
            url: 'https://ornek.com/aylik-yedek'
        },
        { 
            date: 15, 
            month: 7, // Ağustos
            hour: 14, 
            minute: 30, 
            text: 'Yıllık Yedek2 Sayaç', 
            type: 'yearly',
            desc: 'Yıllık full yedek alma tarihi',
            url: 'https://ornek.com/yillik-yedek'
        }
    ];

    // GERİ SAYIMLARI OLUŞTUR
    countdowns.forEach(config => {
        const counter = document.createElement('div');
        counter.className = 'counter';
        
        // HTML yapısını oluştur
        counter.innerHTML = `
            <p>${config.text}</p>
            <p id="timer-${config.text.replace(/\s+/g, '-')}"></p>
            <button class="gordum-button">Gördüm</button>
            <small>${config.desc}</small>
        `;

        // Sayaca özel elementleri seç
        const timer = counter.querySelector(`#timer-${config.text.replace(/\s+/g, '-')}`);
        const button = counter.querySelector('.gordum-button');

        // GÖRDÜM BUTONU EVENTİ
        button.addEventListener('click', () => {
            // 1. Uyarı efektlerini kapat
            counter.classList.remove('blinking-red', 'blinking-yellow');
            counter.style.background = '#e6f2ff';
            
            // 2. URL'yi yeni sekmede aç
            if (config.url) {
                window.open(config.url, '_blank', 'noopener,noreferrer');
            }
            
            // 3. Buton metnini geçici değiştir
            button.textContent = 'Yönlendirildi ✓';
            setTimeout(() => button.textContent = 'Gördüm', 2000);
        });

        // SAYACI BAŞLAT
        startCountdown(config, timer, counter);
    });
});

/**
 * GERİ SAYIMI BAŞLATAN FONKSİYON
 * @param {object} config - Sayaç ayarları
 * @param {HTMLElement} timerElement - Zamanı gösterecek element
 * @param {HTMLElement} counterElement - Ana sayaç div'i
 */
function startCountdown(config, timerElement, counterElement) {
    let targetDate = getNextTargetDate(config);
    let seen = false;

    // Her saniye güncelle
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // İlk güncelleme

    /** Sonraki hedef tarihi hesapla */
    function getNextTargetDate() {
        const now = new Date();
        let target;
        
        if (config.type === 'yearly') {
            // YILLIK: Belirtilen ay/gün (örn. 1 Haziran)
            target = new Date(now.getFullYear(), config.month, config.date, config.hour, config.minute);
            if (now > target) target.setFullYear(target.getFullYear() + 1);
        } 
        else if (config.type === 'weekly') {
            // HAFTALIK: Belirtilen gün (örn. Pazar)
            target = new Date(now);
            target.setDate(now.getDate() + (config.day + 7 - now.getDay()) % 7);
            target.setHours(config.hour, config.minute, 0, 0);
            if (now > target) target.setDate(target.getDate() + 7);
        } 
        else {
            // AYLIK (varsayılan): Belirtilen gün (örn. ayın 15'i)
            target = new Date(now.getFullYear(), now.getMonth(), config.date, config.hour, config.minute);
            if (now > target) target.setMonth(target.getMonth() + 1);
        }
        
        return target;
    }

    /** Geri sayımı güncelle */
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        // SÜRE DOLDUYSA
        if (diff <= 0) {
            timerElement.textContent = "SÜRE DOLDU!";
            if (!seen) counterElement.classList.add('blinking-red');
            clearInterval(interval);
            return;
        }

        // KALAN SÜREYİ HESAPLA
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        // EKRANA YAZDIR
        timerElement.textContent = `${days}g ${Math.floor(hours)}s ${mins}d ${secs}sn`;

        // UYARI EFEKTLERİ
        counterElement.classList.remove('blinking-red', 'blinking-yellow');
        if (!seen) {
            if (days <= 2) counterElement.classList.add('blinking-red');
            else if (days <= 4) counterElement.classList.add('blinking-yellow');
        }
    }
}
