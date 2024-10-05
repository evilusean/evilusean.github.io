const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const japaneseMonths = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

const japaneseMonthsRomaji = [
    'Ichigatsu', 'Nigatsu', 'Sangatsu', 'Shigatsu', 'Gogatsu', 'Rokugatsu',
    'Shichigatsu', 'Hachigatsu', 'Kugatsu', 'Jūgatsu', 'Jūichigatsu', 'Jūnigatsu'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const japaneseDaysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

const fullDaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fullJapaneseDaysOfWeek = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const fullJapaneseDaysOfWeekRomaji = ['Nichiyōbi', 'Getsuyōbi', 'Kayōbi', 'Suiyōbi', 'Mokuyōbi', 'Kinyōbi', 'Doyōbi'];

const japaneseNumbers = [
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十', '三十一'
];

const japaneseNumbersRomaji = [
    'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū', 'jū',
    'jūichi', 'jūni', 'jūsan', 'jūyon', 'jūgo', 'jūroku', 'jūnana', 'jūhachi', 'jūkyū', 'nijū',
    'nijūichi', 'nijūni', 'nijūsan', 'nijūyon', 'nijūgo', 'nijūroku', 'nijūnana', 'nijūhachi', 'nijūkyū', 'sanjū', 'sanjūichi'
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
    const currentDaysOfWeek = isShowingAnswer ? japaneseDaysOfWeek : daysOfWeek;
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
    const currentMonths = isShowingAnswer ? japaneseMonths : months;
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
    const japaneseDayOfWeek = fullJapaneseDaysOfWeek[currentDate.getDay()];
    const japaneseDayOfWeekRomaji = fullJapaneseDaysOfWeekRomaji[currentDate.getDay()];
    const japaneseDate = `${japaneseMonths[currentMonth]}${japaneseNumbers[selectedDay - 1]}日`;
    const japaneseDateRomaji = `${japaneseMonths[currentMonth]} (${japaneseMonthsRomaji[currentMonth]}) ${japaneseNumbersRomaji[selectedDay - 1]}-nichi`;
    const englishDate = `${selectedDay}${getOrdinalSuffix(selectedDay)} of ${months[currentMonth]}`;

    questionElement.textContent = `How do you say "Today is ${dayOfWeek}. Today is the ${englishDate}" in Japanese?`;
    answerElement.innerHTML = `今日は${japaneseDayOfWeek}です。今日は${japaneseDate}です。<br>
                               Kyō wa ${japaneseDayOfWeekRomaji} desu. Kyō wa ${japaneseDateRomaji} desu.`;
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