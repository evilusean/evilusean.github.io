const analogClock = document.querySelector('.analog-clock');
const digitalClock = document.querySelector('.digital-clock');
const timeInput = document.getElementById('time-input');
const setTimeBtn = document.getElementById('set-time');
const generateTimeBtn = document.getElementById('generate-time');
const showCurrentTimeBtn = document.getElementById('show-current-time');
const showJapaneseTimeBtn = document.getElementById('show-japanese-time');
const japaneseTimeKanjiDisplay = document.getElementById('japanese-time-kanji');
const japaneseTimeRomajiDisplay = document.getElementById('japanese-time-romaji');

let currentTime = new Date();

function updateClocks() {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Update analog clock
    const hourDeg = (hours % 12 + minutes / 60) * 30;
    const minuteDeg = minutes * 6;

    analogClock.querySelector('.hour-hand').style.transform = `rotate(${hourDeg}deg)`;
    analogClock.querySelector('.minute-hand').style.transform = `rotate(${minuteDeg}deg)`;

    // Update digital clock
    digitalClock.textContent = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function setTime() {
    const [hours, minutes] = timeInput.value.split(':');
    currentTime.setHours(hours, minutes, 0);
    updateClocks();
}

function generateRandomTime() {
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    currentTime.setHours(randomHours, randomMinutes, 0);
    updateClocks();
    
    // Update time input box
    timeInput.value = `${randomHours.toString().padStart(2, '0')}:${randomMinutes.toString().padStart(2, '0')}`;
}

function showCurrentTime() {
    currentTime = new Date();
    updateClocks();
    timeInput.value = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function getMinuteReading(number) {
    const punReadings = ['pun', 'pun', 'fun', 'pun', 'fun', 'fun', 'pun', 'fun', 'pun', 'pun'];
    return punReadings[number % 10];
}

function showJapaneseTime() {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    const japaneseHoursRomaji = [
        'juu ni', 'ichi', 'ni', 'san', 'yo', 'go', 'roku', 'shichi', 'hachi', 'ku', 'juu', 'juu ichi'
    ];

    const japaneseMinutesRomaji = [
        'rei', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyuu', 'juu',
        'juu ichi', 'juu ni', 'juu san', 'juu yon', 'juu go', 'juu roku', 'juu nana', 'juu hachi', 'juu kyuu'
    ];

    const japaneseTensRomaji = ['ni juu', 'san juu', 'yon juu', 'go juu'];

    let japaneseTimeKanji = `${hours}時`;
    let japaneseTimeRomaji = `${japaneseHoursRomaji[hours % 12]} ji`;

    if (minutes === 0) {
        japaneseTimeKanji += 'ちょうど';
        japaneseTimeRomaji += ' choudo';
    } else if (minutes === 30) {
        japaneseTimeKanji += '半';
        japaneseTimeRomaji += ' han';
    } else {
        japaneseTimeKanji += `${minutes}分`;
        if (minutes <= 20) {
            japaneseTimeRomaji += ` ${japaneseMinutesRomaji[minutes]} ${getMinuteReading(minutes)}`;
        } else {
            const tens = Math.floor(minutes / 10) - 2;
            const ones = minutes % 10;
            japaneseTimeRomaji += ` ${japaneseTensRomaji[tens]}`;
            if (ones > 0) {
                japaneseTimeRomaji += ` ${japaneseMinutesRomaji[ones]}`;
            }
            japaneseTimeRomaji += ` ${getMinuteReading(minutes)}`;
        }
    }

    japaneseTimeKanjiDisplay.textContent = japaneseTimeKanji;
    japaneseTimeRomajiDisplay.textContent = japaneseTimeRomaji;
}

setTimeBtn.addEventListener('click', setTime);
generateTimeBtn.addEventListener('click', generateRandomTime);
showCurrentTimeBtn.addEventListener('click', showCurrentTime);
showJapaneseTimeBtn.addEventListener('click', showJapaneseTime);

// Update clocks every second
setInterval(updateClocks, 1000);

// Initial update
updateClocks();