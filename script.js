// --- BUTON TIKLAMA YÖNETİMİ BAŞLANGIÇ ---
document.addEventListener('DOMContentLoaded', function() {
    // Tüm system-button elementlerini seç
    const buttons = document.querySelectorAll('.system-button');
    
    // Buton URL'leri (data-url attribute'undan alınacak)
    const buttonUrls = {
        // Ana Sistemler
        'BASİS İNTERAKTİF ANASAYFA': 'https://basistakip.github.io/basis/index.html',
        'Basis Drive': 'https://drive.google.com/drive/u/0/folders/1LdEk5nnMH5ONEFurrsaJkopXvvuAahlC',
        'Haritada Yeri': 'HARITA_LINKİ',
        
        // Kısayollar
        'UBYS': 'https://ubys.bandirma.edu.tr/',
        'E-POSTA': 'https://mail.google.com/',
        'WHATSAPP': 'https://web.whatsapp.com/',
        'DUYURU': 'https://www.bandirma.edu.tr/tr/www/Duyuru/Liste?k=-1',
        'REHBER': 'https://rehber.bandirma.edu.tr/',
        
        // Genel Erişim
        'Projeler': 'https://drive.google.com/drive/folders/1LeiOLaTU8JixvIOjldPiJVTLPgsZt8t0?usp=drive_link',
        'Talepler': 'https://docs.google.com/spreadsheets/d/1RNYkQd9bml7M74ciecpxPbY-VSS28HzbJgkeHUc2axg/edit?gid=109557683#gid=109557683',
        'Talep Yaz': 'TALEP_YAZ_LINKI',
        'Özel Parçalar': 'OZEL_PARCA_LINKI',
        'Isıtma/Soğutma': 'ISITMA_SOGUTMA_LINKI',
        'UPS\'ler': 'https://drive.google.com/drive/folders/1KnjaNFmmKqHedHci7bGuPCFabh2sm-lMOGjAhTQOPTch2UKm_1ifs0Htv3gLO-JJbKVRApEa?usp=sharing',
        'Jeneratör': 'JENERATOR_LINKI',
        'Yangın': 'https://drive.google.com/drive/folders/1LQEMoJIGTYbt_H_AYLF9_TKcnLDfrtPrmDcvxDQ01R0VdeA8YJQWM8k0GNnN9ZTsLFZxkXoa?usp=sharing',
        'Kapılar': 'https://drive.google.com/drive/folders/134Q0b-jeuilwSM-8No1sVo6T4U8qDJ3k5gHeZGtymAVqlgmy0eqq7oK3Y4UkA_V7jGG4E8ez?usp=sharing',
        'Asansörler': 'https://drive.google.com/drive/folders/1pfgWPMp47KvKXnjopyANH5xGY5imP3UFpo2LglZYYeg1R5mLdNaS7qNT3ltlFcfVZNesUujT?usp=sharing',
        'ARA GÜVENLİK İletişim': 'ILETISIM_LINKI',
        'EVRAKLAR': 'https://drive.google.com/drive/folders/1FPuI4a8XbyKh10ybDIeF_GIBf1g8_k-90EqCUl3WfvlydGvjVi-FmZZE9i068iBh_kTHNRJR?usp=drive_link',
        'Raporlar': 'https://drive.google.com/drive/folders/1Bq8BgeYdaxkzCyxzWDlGzQOeE9AKBURs?usp=sharing',
        'Elektrik Yerleşkesi': 'https://drive.google.com/drive/folders/1L5odcO5nLoAjRGmiUaYsgdKnxJKM1w9NmXtfho5kcJT9ZDjpsce1Lu3ZJsbajZ6vzNnvxeqT?usp=sharing',
        'Aydınlatma Otomayon': 'OTOMASYON_LINKI',
        'GitHub Web Yapiisleribanu_': 'GITHUB_LINKI',
        
        // Binalar
        'Rektörlük Binası': 'https://drive.google.com/drive/folders/1jSrb6uypTKJsfYBnC5_1uwocLaubOw2gwwj06WCBpTdrC7l3UETK67D-bUC0MJSkMOuX7b8S?usp=sharing',
        'Kapalı Spor Salonu': 'https://drive.google.com/drive/folders/1N-rdUOu98ZSLd_WJLMNd5332qGAJ8HOdDTdRn1qOZ6DfTUgtUb4AuvnbdKUovc19ow1vNtcF',
        'Spor Akademisi': 'https://drive.google.com/drive/folders/1dLwbe0hBNFASEfx6U_FgmF8KB5lp2pKJX-sgyIUj0RFe803SpiUVP71v28oZbrTHkzfEHot6',
        'Merkezi Derslik': 'https://drive.google.com/drive/folders/1r06zRd6eEISG9I326JGR2QL4bbxManul_U9jBU3dY7IWpLqFuezVePQ9odOYrJogy_ortKB9',
        'ÖYM': 'https://drive.google.com/drive/folders/1tRwRLRRWVqNk4gHnBeNBlwFNtYvkh1MEl3ZMljFppLKdAEhXCMsiXDL0mW-1H41B99cRhmOn',
        'Mühendislik': 'https://drive.google.com/drive/folders/1uB4ockbREFNf6CcssejK9mD6PAs9IfAdI3Ux7Svk2Nep9gmdG7c6-9Ltv126R0v9lbgteRzl',
        'Denizcilik': 'https://drive.google.com/drive/folders/1ZYsVVhI4hydIBoVo1W_J-VoJa5fo7XQ_3jV6TsN7XfM1cWRnRysoUkenNsRLjsUfauAmDerP',
        'İlahiyat Binası': 'https://drive.google.com/drive/folders/1zqqeHVUV7rTb8tQ_8n7ZbG10Y4idNLPV6FYvkbli4a2KYmyp3rV1tT8rGM59pSGHjvyhuMk-',
        'Susurluk MYO': 'https://drive.google.com/drive/folders/1QMpzrWtSivxm7S9Mk0dLTTo7d9NMq_KfRSGBHpG8EDnmH-Z-9SVbvHcRfZu_hgqtEn3KE8d0',
        'Erdek MYO': 'https://drive.google.com/drive/folders/1czb0F-Hx6homzZM5uf6eUkX9oh_uXvn2qOeUMB6C-GYtaBDhv_w6EvxOTwp3jmCxe8vKhP9T',
        'Manyas MYO': 'https://drive.google.com/drive/folders/1HVvf9wcEgRUvJ1Yrlvpq-vG3ALeLanW1UWCDhWjiyspRCovRqfnlHZThVy-qOKW7chN5u3-G',
        'Gönen MYO': 'https://drive.google.com/drive/folders/16zvos9NdCSDx-YZF1egTdB9wBByS7ygK51BA-IOzKHzsCXaVKHYlG4D9xj14MhbzyNmFpuMX',
        'Bandırma MYO': 'https://drive.google.com/drive/folders/1D26Pcmer3vCRwHtgjMyDLMiyXppXBVyMjzf2-fnLAHggiPEje5OqyQh7xNw5w69wlMFjVWbE',
        'Denizcilik MYO': 'https://drive.google.com/drive/folders/1aPAoVuyzc14TVujADHvOrtoHV__sQ5UNDh9hbAHr9W6WaOXUCvWInSLpG-QCslAO9LUWeUJo',
        'Edincik MYO': 'https://drive.google.com/drive/folders/1SBCk4EUhkGFliXFfyJoIsJdF98le08PMqn2v-dfkQHikTsgb-SsyL_t3g0Pmc'
    };

    // Her buton için click eventi ekle
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Buton içindeki span metnini bul
            const buttonText = button.querySelector('span')?.textContent.trim();
            
            // Eğer bu bir arama butonuysa veya özel bir iframe içeriyorsa işlem yapma
            if (button.classList.contains('search-bar-wide') || button.querySelector('iframe')) {
                return;
            }

            // URL'yi bul
            const url = button.getAttribute('data-url') || buttonUrls[buttonText];
            
            if (url && url !== '#') {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        });
    });
});
// --- BUTON TIKLAMA YÖNETİMİ BİTİŞ ---

// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
const countdowns = [
    { date: 10, hour: 0, minute: 0, text: 'Sayaç Okuma' },
    { date: 15, hour: 0, minute: 0, text: 'Sayaç Gönderme' },
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama' },
    { date: 13, hour: 0, minute: 0, text: 'YEDEK 1' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 15, hour: 0, minute: 0, text: 'YEDEK 3' }
];

function createCountdown(date, hour, minute, text) {
    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.innerHTML = `
        <p>${text}</p>
        <p id="timer-${text.replace(/\s+/g, '-')}"></p>
        <button>Gördüm</button>
    `;

    document.getElementById('counters').appendChild(counter);
    const timer = counter.querySelector('p:nth-child(2)');
    const button = counter.querySelector('button');

    let targetDate;
    let seen = false;

    function getNextTargetDate() {
        const now = new Date();
        let target = new Date(now.getFullYear(), now.getMonth(), date, hour, minute, 0);
        
        if (now > target) {
            target.setMonth(target.getMonth() + 1);
        }
        return target;
    }

    function update() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            timer.textContent = "SÜRE DOLDU!";
            if (!seen) counter.classList.add('blinking-red');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        timer.textContent = `${days}g ${Math.floor(hours)}s ${mins}d ${secs}sn`;

        // Efektleri yönet
        counter.classList.remove('blinking-red', 'blinking-yellow');
        if (!seen) {
            if (days <= 2) counter.classList.add('blinking-red');
            else if (days <= 4) counter.classList.add('blinking-yellow');
        }
    }

    button.addEventListener('click', () => {
        seen = true;
        counter.classList.remove('blinking-red', 'blinking-yellow');
        counter.style.background = '#e6f2ff';
    });

    targetDate = getNextTargetDate();
    setInterval(update, 1000);
    update();
}

// Tüm geri sayımları oluştur
countdowns.forEach(c => createCountdown(c.date, c.hour, c.minute, c.text));
// --- GERİ SAYIM KODLARI BİTİŞ ---


