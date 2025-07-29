// Google giriş yanıtını işleyen ana fonksiyon
function handleCredentialResponse(response) {
    // JWT token'ını decode eden yardımcı fonksiyon
    const decodeJwtResponse = (token) => {
        // Token'ı noktalara göre parçalara ayır (header.payload.signature)
        const base64Url = token.split('.')[1]; // payload kısmını al
        
        // Base64 URL formatını standart Base64'e çevir
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Base64'ü decode edip UTF-8'e çevir
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => 
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        
        return JSON.parse(jsonPayload); // JSON'a çevirip döndür
    };

    // Token'ı decode edip kullanıcı bilgilerini al
    const profile = decodeJwtResponse(response.credential);
    if (!profile) { // Eğer decode başarısızsa
        console.error("Token decode edilemedi!");
        return; // Fonksiyondan çık
    }

    // Kullanıcı bilgilerini konsola yazdır (debug için)
    console.log("Giriş Yapan Kullanıcı:", profile);
    
    // Kullanıcı bilgilerini tarayıcıda sakla
    localStorage.setItem('google_id_token', response.credential); // Token
    localStorage.setItem('profile_name', profile.name); // Ad
    localStorage.setItem('profile_email', profile.email); // Email
    localStorage.setItem('profile_picture', profile.picture); // Profil resmi

    // Arayüzü güncelle
    updateUIForLoggedInUser();
}

// Kullanıcı giriş durumuna göre arayüzü güncelleyen fonksiyon
function updateUIForLoggedInUser() {
    // HTML elementlerini seç
    const googleSigninButton = document.getElementById('google-signin-button');
    const profileInfo = document.getElementById('profile-info');
    const contentArea = document.getElementById('content-area');
    const accessDenied = document.getElementById('access-denied');

    // LocalStorage'dan kullanıcı bilgilerini al
    const idToken = localStorage.getItem('google_id_token');
    const storedEmail = localStorage.getItem('profile_email');

    // Yetkili email listesi (whitelist)
    const allowedEmails = [
        "mahmutkilicankara@gmail.com",
        "ygtcan10@gmail.com"
    ];

    // Eğer token ve email varsa
    if (idToken && storedEmail) {
        // Email yetkili listede mi kontrol et
        if (allowedEmails.includes(storedEmail)) {
            // Yetkili kullanıcı için arayüz
            googleSigninButton.style.display = 'none'; // Giriş butonunu gizle
            profileInfo.style.display = 'flex'; // Profil bilgisini göster
            contentArea.style.display = 'block'; // İçerik alanını göster
            accessDenied.style.display = 'none'; // Erişim reddi mesajını gizle
        } else {
            // Yetkisiz kullanıcı için arayüz
            googleSigninButton.style.display = 'none';
            profileInfo.style.display = 'none';
            contentArea.style.display = 'none';
            accessDenied.style.display = 'block'; // Erişim reddi mesajını göster
            localStorage.clear(); // Kullanıcı verilerini temizle
        }
    } else {
        // Giriş yapılmamışsa arayüz
        googleSigninButton.style.display = 'block'; // Giriş butonunu göster
        profileInfo.style.display = 'none';
        contentArea.style.display = 'none';
        accessDenied.style.display = 'none';
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    // Çıkış butonunu bul ve click eventi ekle
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear(); // Tüm verileri temizle
            location.reload(); // Sayfayı yenile
        });
    }

    // Giriş durumunu kontrol et ve arayüzü güncelle
    updateUIForLoggedInUser();

    // Geri sayım sayaçlarını oluştur
    const countdowns = [
        // Aylık geri sayımlar
        { date: 1, hour: 0, minute: 0, text: 'Sayaç Okuma', type: 'monthly' },
        { date: 15, hour: 0, minute: 0, text: 'Fatura Hesaplama', type: 'monthly' },
        { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama', type: 'monthly' },
        
        // Yıllık geri sayım (1 Haziran)
        { date: 1, month: 5, hour: 0, minute: 0, text: 'Yıllık Bakım', type: 'yearly' },
        
        // Haftalık geri sayım (Pazar)
        { day: 0, hour: 0, minute: 0, text: 'Haftalık Toplantı', type: 'weekly' }
    ];

    // Her geri sayım için sayaç oluştur
    countdowns.forEach(config => {
        // Yeni sayaç div'i oluştur
        const counter = document.createElement('div');
        counter.className = 'counter';
        
        // Sayaç HTML yapısını oluştur
        counter.innerHTML = `
            <p>${config.text}</p>
            <p id="timer-${config.text.replace(/\s+/g, '-')}"></p>
            <button class="gordum-button">Gördüm</button>
            <small>${getDescription(config)}</small>
        `;

        // Sayaç konteynerına ekle
        document.getElementById('counters').appendChild(counter);
        
        // Elementleri seç
        const timer = counter.querySelector(`#timer-${config.text.replace(/\s+/g, '-')}`);
        const button = counter.querySelector('.gordum-button');

        // "Gördüm" butonu için URL'ler
        const buttonUrls = {
            'Sayaç Okuma': 'https://ornek.com/sayac-okuma',
            'Fatura Hesaplama': 'https://ornek.com/fatura',
            'Rapor Hazırlama': 'https://ornek.com/rapor',
            'Yıllık Bakım': 'https://ornek.com/yillik-bakim',
            'Haftalık Toplantı': 'https://ornek.com/toplanti'
        };

        // Gördüm butonuna tıklama eventi ekle
        button.addEventListener('click', () => {
            // Efektleri kapat
            counter.classList.remove('blinking-red', 'blinking-yellow');
            counter.style.background = '#e6f2ff';
            
            // İlgili URL'yi yeni sekmede aç
            const url = buttonUrls[config.text];
            if (url) window.open(url, '_blank');
            
            // Buton metnini geçici değiştir
            button.textContent = 'Yönlendirildi ✓';
            setTimeout(() => button.textContent = 'Gördüm', 2000);
        });

        // Geri sayımı başlat
        startCountdown(config, timer, counter);
    });
});

// Geri sayım açıklamasını oluşturan yardımcı fonksiyon
function getDescription(config) {
    if (config.type === 'yearly') {
        return `Her yıl ${config.date} Haziran saat ${config.hour}:${config.minute.toString().padStart(2, '0')}'da`;
    } else if (config.type === 'weekly') {
        return `Her Pazar saat ${config.hour}:${config.minute.toString().padStart(2, '0')}'da`;
    } else {
        return `Her ayın ${config.date}'inde saat ${config.hour}:${config.minute.toString().padStart(2, '0')}'da`;
    }
}

// Geri sayım mantığını yöneten fonksiyon
function startCountdown(config, timerElement, counterElement) {
    let targetDate = getNextTargetDate(config);
    let seen = false;

    // Her saniye geri sayımı güncelle
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // İlk güncellemeyi yap

    function getNextTargetDate() {
        const now = new Date();
        let target;
        
        if (config.type === 'yearly') {
            // Yıllık hedef tarih (1 Haziran)
            target = new Date(now.getFullYear(), config.month, config.date, config.hour, config.minute);
            if (now > target) target.setFullYear(target.getFullYear() + 1);
        } 
        else if (config.type === 'weekly') {
            // Haftalık hedef tarih (Pazar)
            target = new Date(now);
            target.setDate(now.getDate() + (config.day + 7 - now.getDay()) % 7);
            target.setHours(config.hour, config.minute, 0, 0);
            if (now > target) target.setDate(target.getDate() + 7);
        } 
        else {
            // Aylık hedef tarih
            target = new Date(now.getFullYear(), now.getMonth(), config.date, config.hour, config.minute);
            if (now > target) target.setMonth(target.getMonth() + 1);
        }
        
        return target;
    }

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        // Süre dolduysa
        if (diff <= 0) {
            timerElement.textContent = "SÜRE DOLDU!";
            if (!seen) counterElement.classList.add('blinking-red');
            clearInterval(interval);
            return;
        }

        // Kalan süreyi hesapla
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        // Formatla ve göster
        timerElement.textContent = `${days}g ${hours}s ${mins}d ${secs}sn`;

        // Uyarı efektlerini ayarla
        counterElement.classList.remove('blinking-red', 'blinking-yellow');
        if (!seen) {
            if (days <= 2) counterElement.classList.add('blinking-red');
            else if (days <= 4) counterElement.classList.add('blinking-yellow');
        }
    }
}
