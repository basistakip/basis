
        document.addEventListener('DOMContentLoaded', () => {
            // HTML elementlerini seç
            const profileInfo = document.getElementById('profile-info');
            const profilePicture = document.getElementById('profile-picture');
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const logoutButton = document.getElementById('logout-button');
            const accessDeniedMessage = document.getElementById('access-denied');
            const googleSignInButton = document.querySelector('.g_id_signin');
            const contentArea = document.getElementById('content-area');

            // --- İZİN VERİLEN E-POSTA ADRESLERİ LİSTESİ ---
            const allowedEmails = [
                "mahmutkilicankara@gmail.com",
                "ikinci.izinli.kullanici@example.com",
                "ucuncu.kullanici@gmail.com"
            ];
            // --------------------------------------------------------

            // Global fonksiyon: Google kimlik bilgileri yanıtını işler
            window.handleCredentialResponse = (response) => {
                const idToken = response.credential;
                const decodedToken = parseJwt(idToken);

                if (decodedToken && decodedToken.email) {
                    const userEmail = decodedToken.email.toLowerCase().trim();

                    if (allowedEmails.includes(userEmail)) {
                        // Yetkili kullanıcı
                        profilePicture.src = decodedToken.picture;
                        profileName.textContent = decodedToken.name;
                        profileEmail.textContent = userEmail;

                        // localStorage yerine sessionStorage kullanabiliriz
                        sessionStorage.setItem('google_id_token', idToken);
                        sessionStorage.setItem('user_email', userEmail);

                        displayAuthorizedUI(decodedToken);
                        google.accounts.id.cancel();
                    } else {
                        // Yetkisiz kullanıcı
                        console.warn("Yetkisiz e-posta: " + userEmail);
                        showAccessDenied("'" + userEmail + "' ile bu içeriğe erişim izniniz yok. Lütfen yetkili bir hesapla giriş yapın.");
                        
                        // Sadece giriş butonunu gizle, erişim reddi mesajını göster
                        googleSignInButton.style.display = 'none';
                        profileInfo.style.display = 'none';
                        contentArea.style.display = 'none';
                        
                        sessionStorage.removeItem('google_id_token');
                        sessionStorage.removeItem('user_email');
                        google.accounts.id.cancel();
                    }
                } else {
                    console.error("Kimlik doğrulama başarısız.");
                    showAccessDenied("Giriş başarısız oldu. Lütfen tekrar deneyin.");
                    resetUI();
                }
            };

            // JWT çözümleme fonksiyonu
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

            // Erişim engellendi mesajını göster
            function showAccessDenied(message) {
                accessDeniedMessage.textContent = message;
                accessDeniedMessage.style.display = 'block';
                if (window.accessDeniedTimeout) {
                    clearTimeout(window.accessDeniedTimeout);
                }
                window.accessDeniedTimeout = setTimeout(() => {
                    accessDeniedMessage.style.display = 'none';
                    window.accessDeniedTimeout = null;
                    // Mesaj gizlendikten sonra giriş butonunu tekrar göster
                    googleSignInButton.style.display = 'block';
                }, 8000);
            }

            // Yetkili kullanıcı UI'ını göster
            function displayAuthorizedUI(decodedToken) {
                profileInfo.style.display = 'flex';
                googleSignInButton.style.display = 'none';
                accessDeniedMessage.style.display = 'none';
                contentArea.style.display = 'block';

                // Burada özel içerik ekleyebilirsiniz
                document.getElementById('user-content').innerHTML = `
                    <p><strong>Kullanıcı Bilgileri:</strong></p>
                    <p>Ad: ${decodedToken.name}</p>
                    <p>E-posta: ${decodedToken.email}</p>
                    <p>Giriş Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
                `;
            }

            // UI'ı başlangıç durumuna sıfırla
            function resetUI() {
                profileInfo.style.display = 'none';
                googleSignInButton.style.display = 'block';
                accessDeniedMessage.style.display = 'none';
                contentArea.style.display = 'none';
            }

            // Çıkış yap butonu
            logoutButton.addEventListener('click', () => {
                google.accounts.id.disableAutoSelect();
                sessionStorage.removeItem('google_id_token');
                sessionStorage.removeItem('user_email');
                resetUI();
                alert("Başarıyla çıkış yaptınız.");
                google.accounts.id.prompt();
            });

            // Sayfa yüklendiğinde oturum kontrolü
            function initializeAuthFlow() {
                const savedToken = sessionStorage.getItem('google_id_token');
                const savedEmail = sessionStorage.getItem('user_email');
                
                if (savedToken && savedEmail) {
                    const decodedToken = parseJwt(savedToken);
                    const isTokenExpired = decodedToken && decodedToken.exp * 1000 < Date.now();

                    if (decodedToken && !isTokenExpired && allowedEmails.includes(savedEmail)) {
                        console.log("Kayıtlı ve geçerli oturum bulundu.");
                        profilePicture.src = decodedToken.picture;
                        profileName.textContent = decodedToken.name;
                        profileEmail.textContent = savedEmail;
                        displayAuthorizedUI(decodedToken);
                    } else {
                        console.warn("Kayıtlı oturum geçersiz veya süresi dolmuş.");
                        sessionStorage.removeItem('google_id_token');
                        sessionStorage.removeItem('user_email');
                        resetUI();
                        google.accounts.id.prompt();
                    }
                } else {
                    console.log("Kayıtlı oturum bulunamadı.");
                    resetUI();
                    google.accounts.id.prompt();
                }
            }

            // Uygulamayı başlat
            initializeAuthFlow();

            // Global erişim için fonksiyonları dışa aktar (isteğe bağlı)
            window.loginSystem = {
                isLoggedIn: () => !!sessionStorage.getItem('google_id_token'),
                getCurrentUser: () => {
                    const token = sessionStorage.getItem('google_id_token');
                    return token ? parseJwt(token) : null;
                },
                logout: () => logoutButton.click()
            };
        });

