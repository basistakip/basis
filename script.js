document.querySelectorAll('.system-button').forEach(button => {
  // URL eşleştirmeleri
  const urlMappings = {
    "Basis Drive": "https://www.youtube.com/",
    "Rektörlük Binası": "/rektörlük-binası",
    "Kapalı Spor Salonu": "/kapalı-spor-salonu",
    "Spor Akademisi": "/spor-akademisi",
    "Merkezi Derslik": "/merkezi-derslik",
    "ÖYM": "/öğrenci-işleri",
    "Mühendislik": "/mühendislik-fakültesi",
    "Denizcilik": "/denizcilik-fakültesi",
    "İlahiyat Binası": "/ilahiyat-fakültesi",
    "Susurluk MYO": "/susurluk-myo",
    "Erdek MYO": "/erdek-myo",
    "Manyas MYO": "/manyas-myo",
    "Gönen MYO": "/gönen-myo",
    "Bandırma MYO": "/bandırma-myo",
    "Denizcilik MYO": "/denizcilik-myo",
    "Edincik MYO": "/edincik-myo",
    "Binalar/Talepler": "/bina-talepleri",
    "UPS'ler": "/ups-sistemleri",
    "Yangın": "/yangın-sistemleri",
    "Kayar Kapılar": "/kayar-kapılar",
    "Raporlar": "/raporlar",
    "Elektrik Yerleşkesi": "/elektrik-sistemi",
    "Klima Santrali": "/klima-santrali",
    "Asansörler": "/asansörler",
    "Projeler": "/projeler",
    "VRF Sistemi": "/vrf-sistemi",
    "Chiller Soğutma": "/chiller-sistemi",
    "Malzeme/Envanter Takibi": "/envanter-takip",
    "Jeneratör": "/jeneratör-sistemi",
    "Yazılım Teknik": "/yazılım-destek",
    "İletişim": "/iletişim",
    "Aydınlatma Otomasyon": "/aydınlatma-otomasyon",
    "Araştır": "/arama",
    "Etiketler": "/etiketler",
    "Notlar/Takip": "/notlar",
    "Genel Teknik": "/teknik-destek",
    "Sayaçlar/Faturalar": "/sayaç-faturalar",
    "Diğerleri": "/diğer-sistemler",
    "Evraklar": "/evrak-yönetimi",
    "Rehber": "/rehber",
    "Banü Üni": "/banu-universitesi",
    "Ubys": "/ubys-sistemi",
    "E-Posta": "/eposta",
    "Talep Yaz": "/talep-olustur",
    "Otomasyon Aydınlatma": "/otomasyon-aydınlatma",
    "Destek Sayfası": "/destek",
    "Kişisel Sayfa": "/kisisel-sayfa",
    "Eğitim Kapısı": "/egitim-kapisi",
    "Teknik Döküman": "/teknik-dokumanlar"
  };

  button.addEventListener('click', function() {
    // Tıklama efekti
    this.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      this.style.transform = 'translateY(-8px)';
    }, 150);

    const systemNameElement = this.querySelector('span');
    const systemName = systemNameElement ? systemNameElement.textContent : 'Bilinmeyen Sistem';
    
    // Öncelikle data-url özelliğine bak, yoksa mapping'den al
    const targetUrl = this.getAttribute('data-url') || urlMappings[systemName];

    if (targetUrl) {
      console.log(`${systemName} sistemine yönlendiriliyor: ${targetUrl}`);
      // Gerçek uygulamada:
      // window.location.href = targetUrl;
      alert(`"${systemName}" sayfasına yönlendiriliyor...\nURL: ${targetUrl}`);
    } else {
      console.log(`${systemName} sistemi için bir URL tanımlanmamış.`);
      alert(`${systemName} sistemi için URL tanımlanmamış.`);
    }
  });
});
