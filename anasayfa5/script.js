document.addEventListener('DOMContentLoaded', () => {
    // 1. Gerekli elementleri seç
    const googleSignInButton = document.querySelector('.g_id_signin');
    const loadingText = document.createElement('div');
    const accessDenied = document.getElementById('access-denied');
    
    // 2. Yükleniyor metnini oluştur ve ekle
    loadingText.id = 'auth-loading';
    loadingText.textContent = 'Doğrulanıyor...';
    loadingText.style.display = 'none';
    googleSignInButton.parentNode.insertBefore(loadingText, googleSignInButton.nextSibling);

    // 3. Global callback fonksiyonu
    window.handleCredentialResponse = (response) => {
        // Aşama 1: Yükleniyor göster
        googleSignInButton.style.display = 'none';
        loadingText.style.display = 'block';
        accessDenied.style.display = 'none';

        // Aşama 2: 1.5 saniye bekle (simüle edilmiş doğrulama)
        setTimeout(() => {
            // Aşama 3: Yükleniyor gizle
            loadingText.style.display = 'none';
            
            // Aşama 4: HER DURUMDA sonucu göster
            accessDenied.textContent = "Bu hesap ile giriş izniniz yok";
            accessDenied.style.display = 'block';
            
            // Aşama 5: 8 saniye sonra butonu geri getir
            setTimeout(() => {
                accessDenied.style.display = 'none';
                googleSignInButton.style.display = 'block';
            }, 8000);
        }, 1500);
    };
});
