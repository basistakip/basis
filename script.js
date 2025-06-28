document.querySelectorAll('.system-button').forEach(button => {
  button.addEventListener('click', function(e) {
    // Tıklama efekti
    this.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      this.style.transform = 'translateY(-8px)';
    }, 150);

    // Öncelikle data-url özelliğini kontrol et
    const targetUrl = this.getAttribute('data-url');
    const systemName = this.querySelector('span').textContent;

    if (targetUrl) {
      console.log(`${systemName} sistemine yönlendiriliyor: ${targetUrl}`);
      
      // Mutlak URL kontrolü (http/https ile başlıyorsa doğrudan aç)
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.open(targetUrl, '_blank');
      } 
      // Göreli URL ise (/) base URL ekleyerek aç
      else if (targetUrl.startsWith('/')) {
        window.open(window.location.origin + targetUrl, '_blank');
      }
      // Diğer durumlarda doğrudan aç
      else {
        window.open(targetUrl, '_blank');
      }
    } else {
      console.log(`${systemName} sistemi için bir URL tanımlanmamış.`);
      alert(`${systemName} sistemi için URL tanımlanmamış.`);
    }
    
    // Sayfanın yeniden yüklenmesini engelle
    e.preventDefault();
    e.stopPropagation();
  });
});
