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
    // Sadece bu listedeki e-posta adresleri içeriğe erişebilir.
    // E-posta adreslerini KÜÇÜK HARFLE ve BAŞINDA/SONUNDA BOŞLUK OLMADAN yazmaya dikkat edin.
    const allowedEmails = [
        "mahmutkilicankara@gmail.com", // Kendi e-postanızı buraya ekleyin
        "ikinci.izinli.kullanici@example.com", // İzin vermek istediğiniz diğer e-postalar
        "ucuncu.kullanici@gmail.com"
    ];
    // --------------------------------------------------------
function showAccessDenied(message) {
    accessDeniedMessage.textContent = message;
    accessDeniedMessage.style.display = 'block';
    // Önceki zamanlayıcı varsa temizle
    if (window.accessDeniedTimeout) {
        clearTimeout(window.accessDeniedTimeout);
    }
    // Yeni zamanlayıcıyı ayarla
    window.accessDeniedTimeout = setTimeout(() => {
        accessDeniedMessage.style.display = 'none';
        window.accessDeniedTimeout = null; // Zamanlayıcıyı sıfırla
    }, 8000); // 8 saniye sonra gizle
}
    // Fonksiyon: Google kimlik bilgileri yanıtını işler
    window.handleCredentialResponse = (response) => {
        const idToken = response.credential;
        const decodedToken = parseJwt(idToken);

        if (decodedToken && decodedToken.email) {
            // Kullanıcının e-postasını küçük harfe çevir ve boşlukları temizle
            const userEmail = decodedToken.email.toLowerCase().trim();

            console.log("Giriş denemesi: " + userEmail);
            console.log("İzin verilen e-postalar: ", allowedEmails);
            console.log("E-posta izin verilenler listesinde mi? " + allowedEmails.includes(userEmail));

            // Giriş yapan kullanıcının e-posta adresinin izin verilenler listesinde olup olmadığını kontrol et
            if (allowedEmails.includes(userEmail)) {
                // Giriş başarılı, kullanıcı bilgilerini göster
                profilePicture.src = decodedToken.picture;
                profileName.textContent = decodedToken.name;
                profileEmail.textContent = userEmail;

                profileInfo.style.display = 'flex'; // Profil bilgilerini göster (CSS'inize göre 'block' veya 'flex')
                logoutButton.style.display = 'block'; // Çıkış butonunu göster
                googleSignInButton.style.display = 'none'; // Google giriş butonunu gizle
                accessDeniedMessage.style.display = 'none'; // Erişim engellendi mesajını gizle (önemli!)

                // Tüm sistem butonlarını etkinleştir ve görünür yap
                systemButtons.forEach(button => {
                    button.style.pointerEvents = 'auto'; // Tıklanabilir yap
                    button.style.opacity = '1'; // Tamamen görünür yap
                });
                
                // Ana sistem bölümlerini görünür yap (index.html'deki CSS'e uygun olarak)
                document.getElementById('main-systems-section').style.display = 'grid'; // Veya 'block', 'flex' CSS'inize göre ayarlayın
                document.getElementById('other-systems-section').style.display = 'grid'; // Veya 'block', 'flex' CSS'inize göre ayarlayın

            } else {
                // Yetkisiz e-posta adresi
                console.warn("Erişim Reddedildi: " + userEmail + " adresi için yetki yok.");
                showAccessDenied("Bu e-posta (" + userEmail + ") ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                
                profileInfo.style.display = 'none'; // Profil bilgisini gizle
                logoutButton.style.display = 'block'; // Sadece çıkış butonu kalsın
                googleSignInButton.style.display = 'none'; // Google giriş butonunu gizle

                // Tüm sistem butonlarını devre dışı bırak ve yarı saydam yap
                systemButtons.forEach(button => {
                    button.style.pointerEvents = 'none'; // Tıklanamaz yap
                    button.style.opacity = '0.5'; // Yarı saydam yap
                });

                // Google One-Tap'ın tekrar otomatik açılmasını engellemek için iptal et
                google.accounts.id.cancel();
            }
        } else {
            console.error("Kimlik doğrulama başarısız: E-posta bulunamadı veya token geçersiz.");
            showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
            resetUI(); // Arayüzü sıfırla
        }
    };

    // Fonksiyon: JWT'yi çözümle
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

    // Fonksiyon: Erişim engellendi mesajını göster
    // Mesajın kaybolması için bir setTimeout kullanırız.
    function showAccessDenied(message) {
        accessDeniedMessage.textContent = message;
        accessDeniedMessage.style.display = 'block';
        // Önceki zamanlayıcı varsa temizle
        if (window.accessDeniedTimeout) {
            clearTimeout(window.accessDeniedTimeout);
        }
        // Yeni zamanlayıcıyı ayarla
        window.accessDeniedTimeout = setTimeout(() => {
            accessDeniedMessage.style.display = 'none';
            window.accessDeniedTimeout = null; // Zamanlayıcıyı sıfırla
        }, 8000); // 8 saniye sonra gizle
    }

    // Çıkış yap butonu dinleyicisi
    logoutButton.addEventListener('click', () => {
        // Google oturumunu kapat
        google.accounts.id.disableAutoSelect(); // Otomatik seçimi devre dışı bırak
        // İsteğe bağlı: Eğer Google oturumunu tamamen sonlandırmak isterseniz
        // google.accounts.id.revoke(localStorage.getItem('g_csrf_token'), done => {
        //     console.log('Oturum kapatıldı:', done);
        //     localStorage.removeItem('g_csrf_token'); // Token'ı depodan kaldır
        // });
        resetUI(); // Arayüzü sıfırla
        alert("Başarıyla çıkış yaptınız.");
        // İsterseniz sayfayı yeniden yükleyebilirsiniz: window.location.reload();
    });

    // Arayüzü başlangıç durumuna sıfırla
    function resetUI() {
        profileInfo.style.display = 'none';
        logoutButton.style.display = 'none';
        googleSignInButton.style.display = 'block'; // Google giriş butonunu göster
        accessDeniedMessage.style.display = 'none'; // Hata mesajını gizle

        // Tüm sistem bölümlerini gizle
        document.getElementById('main-systems-section').style.display = 'none';
        document.getElementById('other-systems-section').style.display = 'none';

        // Tüm butonları devre dışı bırak ve yarı saydam yap
        systemButtons.forEach(button => {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    // Sayfa yüklendiğinde başlangıçta tüm butonları devre dışı bırak ve giriş butonunu göster
    resetUI();

    // Buton tıklama olayları (yetkilendirme sonrası aktif olacaklar)
    systemButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            if (url) {
                // Güvenlik: Eğer butona basıldığında yetkisizse bu link çalışmamalı.
                // handleCredentialResponse içindeki pointer-events: none; bunu sağlar.
                // Yine de backend kontrolü en güvenlisidir.
                window.open(url, '_blank');
            }
        });
    });

    // Klima Santrali ikonundaki pervaneleri döndür (eğer animasyon CSS'inizde tanımlıysa)
    // Bu kısım, sadece ikonun görselleştirilmesi içindir, işlevsellikle ilgili değildir.
    const fanBlades = document.querySelectorAll('.klima .fan-blade');
    if (fanBlades.length === 3) {
        fanBlades[0].style.setProperty('--angle', '0deg');
        fanBlades[1].style.setProperty('--angle', '120deg');
        fanBlades[2].style.setProperty('--angle', '240deg');
    }
});
