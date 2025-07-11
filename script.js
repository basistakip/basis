

// --- GERİ SAYIM KODLARI BAŞLANGIÇ ---
const countdowns = [
    { date: 10, hour: 0, minute: 0, text: 'Sayaç Okuma' },
    { date: 15, hour: 0, minute: 0, text: 'Sayaç Gönderme' },
    { date: 24, hour: 0, minute: 0, text: 'Rapor Hazırlama' },
      { date: 13, hour: 0, minute: 0, text: 'YEDEK 1' },
        { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 15, hour: 0, minute: 0, text: 'YEDEK 3' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
    { date: 14, hour: 0, minute: 0, text: 'YEDEK 2' },
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
