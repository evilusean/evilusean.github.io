const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const slovakMonths = [
    'január', 'február', 'marec', 'apríl', 'máj', 'jún',
    'júl', 'august', 'september', 'október', 'november', 'december'
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const slovakDaysOfWeek = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

const ordinalNumbers = [
    'prvý', 'druhý', 'tretí', 'štvrtý', 'piaty', 'šiesty', 'siedmy', 'ôsmy', 'deviaty', 'desiaty',
    'jedenásty', 'dvanásty', 'trinásty', 'štrnásty', 'pätnásty', 'šestnásty', 'sedemnásty', 'osemnásty', 'devätnásty', 'dvadsiaty',
    'dvadsiaty prvý', 'dvadsiaty druhý', 'dvadsiaty tretí', 'dvadsiaty štvrtý', 'dvadsiaty piaty', 'dvadsiaty šiesty', 'dvadsiaty siedmy', 'dvadsiaty ôsmy', 'dvadsiaty deviaty', 'tridsiaty', 'tridsiaty prvý'
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
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
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day', 'empty');
        calendarElement.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.classList.add('day');
        dayElement.addEventListener('click', () => selectDay(i));
        calendarElement.appendChild(dayElement);
    }

    // Update current month display
    const currentMonthElement = document.getElementById('currentMonth');
    currentMonthElement.textContent = isShowingAnswer ? slovakMonths[month] : months[month];
}

function selectDay(day) {
    selectedDay = day;
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

    const slovakDate = `${ordinalNumbers[selectedDay - 1]} ${slovakMonths[currentMonth]}`;
    const englishDate = `${selectedDay} ${months[currentMonth]}`;

    questionElement.textContent = `How do you say "${englishDate}" in Slovak?`;
    answerElement.textContent = `Dnes je ${slovakDate}`;
    answerElement.style.display = 'none';
}

function showAnswer() {
    const answerElement = document.getElementById('answer');
    answerElement.style.display = 'block';
    isShowingAnswer = true;
    createCalendar(currentMonth, currentYear);
}

function selectRandomDay() {
    isShowingAnswer = false;
    currentMonth = Math.floor(Math.random() * 12);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    selectedDay = Math.floor(Math.random() * daysInMonth) + 1;
    createCalendar(currentMonth, currentYear);
    updateCalendarSelection();
    generateQuestion();
}

// Initialize the calendar
document.addEventListener('DOMContentLoaded', () => {
    createCalendar(currentMonth, currentYear);

    // Event listeners
    document.getElementById('randomDay').addEventListener('click', selectRandomDay);
    document.getElementById('showAnswer').addEventListener('click', showAnswer);
});