// 1. Tüm gerekli elementlerin seçimi
const authElements = {
    googleBtn: document.querySelector('.g_id_signin'),
    loadingText: document.createElement('div'),
    errorText: document.getElementById('access-denied'),
    profileSection: document.getElementById('profile-info')
};

// 2. Yükleniyor metnini oluştur
authElements.loadingText.className = 'auth-loading';
authElements.loadingText.textContent = 'Doğrulanıyor...';
authElements.googleBtn.parentNode.insertBefore(authElements.loadingText, authElements.googleBtn.nextSibling);

// 3. Durum yönetimi fonksiyonları
const authUI = {
    showLoading() {
        authElements.googleBtn.style.display = 'none';
        authElements.loadingText.style.display = 'block';
        authElements.errorText.style.display = 'none';
    },

    showError() {
        authElements.loadingText.style.display = 'none';
        authElements.errorText.textContent = 'Bu hesap ile giriş izniniz yok';
        authElements.errorText.style.display = 'block';
        
        // 8 saniye sonra butonu geri getir
        setTimeout(() => {
            authElements.errorText.style.display = 'none';
            authElements.googleBtn.style.display = 'block';
        }, 8000);
    },

    showProfile() {
        authElements.loadingText.style.display = 'none';
        authElements.errorText.style.display = 'none';
        authElements.profileSection.style.display = 'flex';
    }
};

// 4. Google giriş callback fonksiyonu
window.handleCredentialResponse = (response) => {
    // 1. Yükleniyor göster
    authUI.showLoading();

    // 2. 1.5 saniye bekle (simüle edilmiş doğrulama)
    setTimeout(() => {
        // TEST: Her durumda hata göster (test için)
        authUI.showError();
        
        /* GERÇEK KULLANIM İÇİN:
        if (response && isValidEmail(response.email)) {
            authUI.showProfile();
        } else {
            authUI.showError();
        }
        */
    }, 1500);
};

// 5. Sayfa yüklendiğinde butonu göster
document.addEventListener('DOMContentLoaded', () => {
    authElements.googleBtn.style.display = 'block';
});
