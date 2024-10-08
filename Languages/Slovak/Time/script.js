const analogClock = document.querySelector('.analog-clock');
const digitalClock = document.querySelector('.digital-clock');
const timeInput = document.getElementById('time-input');
const setTimeBtn = document.getElementById('set-time');
const generateTimeBtn = document.getElementById('generate-time');
const showCurrentTimeBtn = document.getElementById('show-current-time');
const showSlovakTimeBtn = document.getElementById('show-slovak-time');
const slovakTimeDisplay = document.getElementById('slovak-time');

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
    digitalClock.textContent = currentTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
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
    timeInput.value = currentTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
}

function showSlovakTime() {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    const slovakHours = [
        'dvanásť', 'jedna', 'dve', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť', 'desať', 'jedenásť'
    ];

    const slovakMinutes = [
        'nula', 'jedna', 'dve', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť', 'desať',
        'jedenásť', 'dvanásť', 'trinásť', 'štrnásť', 'pätnásť', 'šestnásť', 'sedemnásť', 'osemnásť', 'devätnásť'
    ];

    const slovakTens = ['dvadsať', 'tridsať', 'štyridsať', 'päťdesiat'];

    let slovakTime = '';

    // Handle special cases
    if (minutes === 0) {
        if (hours === 1) {
            slovakTime = 'Je jedna hodina.';
        } else if (hours >= 2 && hours <= 4) {
            slovakTime = `Sú ${slovakHours[hours % 12]} hodiny.`;
        } else {
            slovakTime = `Je ${slovakHours[hours % 12]} hodín.`;
        }
    } else if (minutes === 15) {
        slovakTime = `Je štvrť na ${slovakHours[(hours % 12 + 1) % 12]}.`;
    } else if (minutes === 30) {
        slovakTime = `Je pol ${slovakHours[(hours % 12 + 1) % 12]}.`;
    } else if (minutes === 45) {
        slovakTime = `Je trištvrte na ${slovakHours[(hours % 12 + 1) % 12]}.`;
    } else {
        // General case
        slovakTime = `Je ${slovakHours[hours % 12]} hodín a `;

        if (minutes <= 20) {
            slovakTime += slovakMinutes[minutes];
        } else {
            const tens = Math.floor(minutes / 10) - 2;
            const ones = minutes % 10;
            slovakTime += slovakTens[tens];
            if (ones > 0) {
                slovakTime += slovakMinutes[ones];
            }
        }

        slovakTime += ' minút.';
    }

    slovakTimeDisplay.textContent = slovakTime;
}

setTimeBtn.addEventListener('click', setTime);
generateTimeBtn.addEventListener('click', generateRandomTime);
showCurrentTimeBtn.addEventListener('click', showCurrentTime);
showSlovakTimeBtn.addEventListener('click', showSlovakTime);

// Update clocks every second
setInterval(updateClocks, 1000);

// Initial update
updateClocks();