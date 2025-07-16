// İzin verilen e-posta adresleri listesi
const allowedEmails = [
  "yapiisleribanu@gmail.com",
  "mahmutkilicankara@gmail.com",
  "yapiisleribanuetiket@gmail.com",
  "mahmutkilic@bandirma.edu.tr",
  "izinli3@example.com"
];

function handleCredentialResponse(response) {
  console.log("Google yanıtı alındı");
  // Kullanıcıdan gelen token'ı işle
  const data = parseJwt(response.credential);
  console.log("Kullanıcı bilgileri:", data);

  // Kullanıcının e-posta adresini kontrol et
  if (allowedEmails.includes(data.email)) {
    console.log("E-posta izinli listede");
    // E-posta adresi izin verilenler listesinde ise kullanıcı bilgilerini göster
    document.getElementById('profile-pic').src = data.picture;
    document.getElementById('profile-name').textContent = data.name;
    document.getElementById('profile-email').textContent = data.email;
    document.getElementById('profile-info').style.display = 'block';

    // Giriş butonunu gizle
    document.getElementById('oauth-button').style.display = 'none';

    // Çıkış butonunu göster
    document.getElementById('logout-button').style.display = 'block';

    // Erişim reddedildi mesajını gizle
    document.getElementById('access-denied').style.display = 'none';

    // Kullanıcı bilgilerini localStorage içine kaydet
    localStorage.setItem('googleUser', JSON.stringify(data));
  } else {
    console.log("E-posta izinli listede DEĞİL");
    // E-posta adresi izin verilenler listesinde değilse erişim reddedildi mesajını göster
    document.getElementById('access-denied').style.display = 'block';

    // Kullanıcı bilgilerini temizle
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('oauth-button').style.display = 'block';
    document.getElementById('logout-button').style.display = 'none';

    // localStorage'dan kullanıcı bilgilerini sil
    localStorage.removeItem('googleUser');
  }
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function checkLogin() {
  console.log("checkLogin çalıştı"); // Konsolda görünüyor mu kontrol edin
  const storedUser = localStorage.getItem('googleUser');
  
  if (storedUser) {
    console.log("Kullanıcı bulundu:", storedUser);
    try {
      const data = JSON.parse(storedUser);
      
      // E-posta kontrolü ekledim
      if (allowedEmails.includes(data.email)) {
        document.getElementById('profile-pic').src = data.picture;
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-info').style.display = 'block';
        document.getElementById('oauth-button').style.display = 'none';
        document.getElementById('logout-button').style.display = 'block';
        document.getElementById('access-denied').style.display = 'none';
      } else {
        // E-posta izinli listede değilse temizle
        localStorage.removeItem('googleUser');
        document.getElementById('oauth-button').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';
        document.getElementById('access-denied').style.display = 'block';
      }
    } catch (e) {
      console.error("JSON parse hatası:", e);
      localStorage.removeItem('googleUser');
    }
  } else {
    console.log("Kullanıcı bulunamadı");
    document.getElementById('oauth-button').style.display = 'block';
    document.getElementById('logout-button').style.display = 'none';
  }
}

function logout() {
  console.log("Çıkış yapılıyor");
  // Kullanıcı oturumunu kapat
  localStorage.removeItem('googleUser');

  // Sayfayı yenileyerek oturumu sıfırla
  window.location.reload();
}

// Sayfa yüklendiğinde oturum kontrolü yap
window.onload = checkLogin;
