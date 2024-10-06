const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const slovakMonths = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
];

const slovakMonthsGenitive = [
    'Januára', 'Februára', 'Marca', 'Apríla', 'Mája', 'Júna',
    'Júla', 'Augusta', 'Septembra', 'Októbra', 'Novembra', 'Decembra'
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const slovakDaysOfWeek = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fullSlovakDaysOfWeek = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];

const ordinalNumbers = [
    'prvý', 'druhý', 'tretí', 'štvrtý', 'piaty', 'šiesty', 'siedmy', 'ôsmy', 'deviaty', 'desiaty',
    'jedenásty', 'dvanásty', 'trinásty', 'štrnásty', 'pätnásty', 'šestnásty', 'sedemnásty', 'osemnásty', 'devätnásty', 'dvadsiaty',
    'dvadsiaty prvý', 'dvadsiaty druhý', 'dvadsiaty tretí', 'dvadsiaty štvrtý', 'dvadsiaty piaty', 'dvadsiaty šiesty', 'dvadsiaty siedmy', 'dvadsiaty ôsmy', 'dvadsiaty deviaty', 'tridsiaty', 'tridsiaty prvý'
];

const ordinalNumbersGenitive = [
    'prvého', 'druhého', 'tretieho', 'štvrtého', 'piateho', 'šiesteho', 'siedmeho', 'ôsmeho', 'deviateho', 'desiateho',
    'jedenásteho', 'dvanásteho', 'trinásteho', 'štrnásteho', 'pätnásteho', 'šestnásteho', 'sedemnásteho', 'osemnásteho', 'devätnásteho', 'dvadsiateho',
    'dvadsiateho prvého', 'dvadsiateho druhého', 'dvadsiateho tretieho', 'dvadsiateho štvrtého', 'dvadsiateho piateho', 'dvadsiateho šiesteho', 'dvadsiateho siedmeho', 'dvadsiateho ôsmeho', 'dvadsiateho deviateho', 'tridsiateho', 'tridsiateho prvého'
];

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDay = currentDate.getDate();
let isShowingAnswer = false;

function createCalendar(month, year) {
    const calendarElement = document.getElementById('calendar');
    calendarElement.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Add day of week headers
    const currentDaysOfWeek = isShowingAnswer ? slovakDaysOfWeek : daysOfWeek;
    currentDaysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day', 'header');
        calendarElement.appendChild(dayElement);
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (firstDay.getDay() + 6) % 7; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        calendarElement.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.classList.add('day');
        if (i === selectedDay) {
            dayElement.classList.add('selected');
        }
        dayElement.addEventListener('click', () => selectDay(i));
        calendarElement.appendChild(dayElement);
    }

    // Update month dropdown
    updateMonthDropdown();
}

function updateMonthDropdown() {
    const monthDropdown = document.getElementById('monthDropdown');
    monthDropdown.innerHTML = '';
    const currentMonths = isShowingAnswer ? slovakMonths : months;
    currentMonths.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) {
            option.selected = true;
        }
        monthDropdown.appendChild(option);
    });
}

function selectDay(day) {
    selectedDay = day;
    currentDate = new Date(currentYear, currentMonth, day);
    updateCalendarSelection();
    generateQuestion();
}

function updateCalendarSelection() {
    const days = document.querySelectorAll('.day:not(.empty):not(.header)');
    days.forEach((dayElement, index) => {
        if (index + 1 === selectedDay) {
            dayElement.classList.add('selected');
        } else {
            dayElement.classList.remove('selected');
        }
    });
}

function generateQuestion() {
    if (selectedDay === null) return;

    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');

    const dayOfWeek = fullDaysOfWeek[currentDate.getDay()];
    const slovakDayOfWeek = fullSlovakDaysOfWeek[currentDate.getDay()];
    const slovakDate = `${ordinalNumbers[selectedDay - 1]} ${slovakMonths[currentMonth]}`;
    const slovakDateGenitive = `${ordinalNumbersGenitive[selectedDay - 1]} ${slovakMonthsGenitive[currentMonth]}`;
    const englishDate = `${selectedDay}${getOrdinalSuffix(selectedDay)} of ${months[currentMonth]}`;

    questionElement.textContent = `How do you say "Today is ${dayOfWeek}. Today is the ${englishDate}" in Slovak?`;
    answerElement.innerHTML = `
        <p>Dnes je ${slovakDayOfWeek}. Dnes je ${slovakDate}.</p>
        <p>Dnes je ${slovakDateGenitive}.</p>
    `;
    answerElement.style.display = 'none';
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

function showAnswer() {
    const answerElement = document.getElementById('answer');
    answerElement.style.display = 'block';
    isShowingAnswer = true;
    createCalendar(currentMonth, currentYear);
    updateMonthDropdown();
}

function selectRandomDay() {
    isShowingAnswer = false;
    currentMonth = Math.floor(Math.random() * 12);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    selectedDay = Math.floor(Math.random() * daysInMonth) + 1;
    currentDate = new Date(currentYear, currentMonth, selectedDay);
    createCalendar(currentMonth, currentYear);
    updateCalendarSelection();
    generateQuestion();
}

function changeMonth(event) {
    currentMonth = parseInt(event.target.value);
    createCalendar(currentMonth, currentYear);
    updateCalendarSelection();
    generateQuestion();
}

// Initialize the calendar
document.addEventListener('DOMContentLoaded', () => {
    // Create month dropdown
    const monthDropdown = document.createElement('select');
    monthDropdown.id = 'monthDropdown';
    monthDropdown.addEventListener('change', changeMonth);

    // Insert month dropdown before the calendar
    const calendarElement = document.getElementById('calendar');
    calendarElement.parentNode.insertBefore(monthDropdown, calendarElement);

    createCalendar(currentMonth, currentYear);
    updateCalendarSelection();
    generateQuestion();

    // Event listeners
    document.getElementById('randomDay').addEventListener('click', selectRandomDay);
    document.getElementById('showAnswer').addEventListener('click', showAnswer);
});