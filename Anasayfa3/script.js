/* Yetkili e-posta adresleri listesi */
const authorizedEmails = [
    'basis_bilgi_islem@example.com', /* Örnek yetkili e-posta */
        "yapiisleribanu@gmail.com",
      "mahmutkilicankara@gmail.com",
        "mahmutkilic@bandirma.edu.tr",
    'ikincimevcut@gmail.com', /* Örnek ikinci yetkili e-posta */
    'banuyapiisleri@gmail.com' /* Örnek e-posta: Lütfen kendi e-postanızla değiştirin */
];

/* Google One Tap ile giriş yapan kullanıcının verilerini işleyen fonksiyon */
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const userEmail = responsePayload.email;

    const profileInfo = document.getElementById('profile-info');
    const googleSigninButton = document.getElementById('google-signin-button');
    const mainSections = document.querySelectorAll('.section');
    const accessDeniedMessage = document.getElementById('access-denied');

    // Önceki durumları temizle
    profileInfo.style.display = 'none';
    googleSigninButton.style.display = 'none';
    mainSections.forEach(section => section.style.display = 'none');
    accessDeniedMessage.style.display = 'none';

    // E-posta yetkili listesinde mi kontrol et
    if (authorizedEmails.includes(userEmail)) {
        // Yetkili Kullanıcı
        document.getElementById('profile-picture').src = responsePayload.picture;
        document.getElementById('profile-name').innerText = responsePayload.name;
        document.getElementById('profile-email').innerText = userEmail;

        profileInfo.style.display = 'flex';
        mainSections.forEach(section => section.style.display = 'grid');
        document.body.style.justifyContent = 'flex-start';
        document.body.style.alignItems = 'flex-start';
    } else {
        // Yetkisiz Kullanıcı
        console.error("Erişim reddedildi: Yetkisiz e-posta adresi.");
        accessDeniedMessage.style.display = 'block';
        googleSigninButton.style.display = 'inline-block';
    }
}

/* Çıkış Yapma Fonksiyonu */
function signOut() {
    const profileInfo = document.getElementById('profile-info');
    const googleSigninButton = document.getElementById('google-signin-button');
    const mainSections = document.querySelectorAll('.section');

    profileInfo.style.display = 'none';
    googleSigninButton.style.display = 'inline-block';
    mainSections.forEach(section => section.style.display = 'none');
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
}

/* JWT Token'ı çözme yardımcı fonksiyonu */
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// "Çıkış Yap" butonuna tıklama olayını ekle
document.getElementById('logout-button').addEventListener('click', signOut);

/* Sayfa yüklendiğinde, eğer token varsa otomatik giriş yapmayı tetikle */
window.onload = function () {
    // Google One Tap kütüphanesinin yüklenmesini bekleyin.
    if (typeof google !== 'undefined' && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: "387277586108-8m32c8tdfb0oemnr5kuv2fao6rtm35c0.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.prompt();
    }
};
