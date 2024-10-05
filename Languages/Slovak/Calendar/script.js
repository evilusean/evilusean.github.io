const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const slovakMonths = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const slovakDaysOfWeek = ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'];

const ordinalNumbers = [
    'prvý', 'druhý', 'tretí', 'štvrtý', 'piaty', 'šiesty', 'siedmy', 'ôsmy', 'deviaty', 'desiaty',
    'jedenásty', 'dvanásty', 'trinásty', 'štrnásty', 'pätnásty', 'šestnásty', 'sedemnásty', 'osemnásty', 'devätnásty', 'dvadsiaty',
    'dvadsiaty prvý', 'dvadsiaty druhý', 'dvadsiaty tretí', 'dvadsiaty štvrtý', 'dvadsiaty piaty', 'dvadsiaty šiesty', 'dvadsiaty siedmy', 'dvadsiaty ôsmy', 'dvadsiaty deviaty', 'tridsiaty', 'tridsiaty prvý'
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
    const headerDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    headerDays.forEach(day => {
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

    // Update current month display
    const currentMonthElement = document.getElementById('currentMonth');
    currentMonthElement.textContent = isShowingAnswer ? slovakMonths[month] : months[month];

    // Update month dropdown
    const monthDropdown = document.getElementById('monthDropdown');
    monthDropdown.value = month;
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

    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    const slovakDayOfWeek = slovakDaysOfWeek[currentDate.getDay()];
    const slovakDate = `${ordinalNumbers[selectedDay - 1]} ${slovakMonths[currentMonth]}`;
    const englishDate = `${selectedDay}${getOrdinalSuffix(selectedDay)} of ${months[currentMonth]}`;

    questionElement.textContent = `How do you say "Today is ${dayOfWeek}. Today is the ${englishDate}" in Slovak?`;
    answerElement.textContent = `Dnes je ${slovakDayOfWeek}. Dnes je ${slovakDate}`;
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
    // Create month container
    const monthContainer = document.createElement('div');
    monthContainer.id = 'monthContainer';

    // Create current month display
    const currentMonthElement = document.createElement('h2');
    currentMonthElement.id = 'currentMonth';
    monthContainer.appendChild(currentMonthElement);

    // Create month dropdown
    const monthDropdown = document.createElement('select');
    monthDropdown.id = 'monthDropdown';
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthDropdown.appendChild(option);
    });
    monthDropdown.addEventListener('change', changeMonth);
    monthContainer.appendChild(monthDropdown);

    // Insert month container before the calendar
    const calendarElement = document.getElementById('calendar');
    calendarElement.parentNode.insertBefore(monthContainer, calendarElement);

    createCalendar(currentMonth, currentYear);
    updateCalendarSelection();
    generateQuestion();

    // Event listeners
    document.getElementById('randomDay').addEventListener('click', selectRandomDay);
    document.getElementById('showAnswer').addEventListener('click', showAnswer);
});