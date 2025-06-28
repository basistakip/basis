document.querySelectorAll('.system-button').forEach(button => {
  button.addEventListener('click', function(e) {
    // Tıklama efekti
    this.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      this.style.transform = 'translateY(-8px)';
    }, 150);

    // URL kontrolü
    const targetUrl = this.getAttribute('data-url');
    const systemName = this.querySelector('span').textContent;

    if (!targetUrl) {
      console.error(`${systemName} sistemi için URL tanımlanmamış`);
      return;
    }

    console.log(`${systemName} sistemine yönlendiriliyor: ${targetUrl}`);
    
    try {
      // Yeni sekmede açma işlemi
      const newWindow = window.open('', '_blank');
      
      if (newWindow) {
        // Tarayıcı pop-up engelleyiciyi aşmak için
        newWindow.location.href = targetUrl;
      } else {
        // Pop-up engellendi uyarısı
        const confirmRedirect = confirm(
          `"${systemName}" sayfasına yönlendirilmek istiyor musunuz?\n\n` +
          `Tarayıcınız yeni sekme açmayı engelledi. ` +
          `URL: ${targetUrl}\n\n"Tamam"a basarak yönlendirileceksiniz.`
        );
        
        if (confirmRedirect) {
          window.location.href = targetUrl;
        }
      }
    } catch (error) {
      console.error('Yönlendirme hatası:', error);
      alert(`Yönlendirme sırasında hata oluştu: ${error.message}`);
    }
    
    // Varsayılan davranışı engelle
    e.preventDefault();
    e.stopPropagation();
  });
});
