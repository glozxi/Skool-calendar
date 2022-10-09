
document.getElementById("app").innerHTML = `

<div class="calendar-month">
  <section class="calendar-month-header">
    <div
      id="selected-month"
      class="calendar-month-header-selected-month"
    >
    </div>

    <div class="calendar-month-header-selectors">
      <span id="previous-month-selector"><</span>
      <span id="present-month-selector">Today</span>
      <span id="next-month-selector">></span>
    </div>
  </section>

  <ol
    id="days-of-week"
    class="day-of-week"
  >
  </ol>

  <ol
    id="calendar-days"
    class="days-grid"
  >
  </ol>
</div>
`;


const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
// 4 digit year
const INITIAL_YEAR = dayjs().format("YYYY");
// 1 to 12
const INITIAL_MONTH = dayjs().format("M");
// Current day
const INITIAL_DAY = dayjs().format("D");
const INITIAL_WEEKDAY = dayjs().format("ddd");

// Variables for changing month and year
let month = INITIAL_MONTH;
let year = INITIAL_YEAR;

eventListeners();

// grid header element (ol)
const daysOfWeekElement = document.getElementById("days-of-week");
WEEKDAYS.forEach(weekday => {
  // make a HTML list element
  const weekDayElement = document.createElement("li");
  daysOfWeekElement.appendChild(weekDayElement);
  weekDayElement.innerText = weekday;
});

// For grid of days
// For current month
make_calendar(INITIAL_MONTH, INITIAL_YEAR);

// Make function that will display calendar grid and day for the month in the year
function make_calendar(theMonth, theYear)
{
  // First day of week in month
  const firstDayInMonth = dayjs(`${theYear}-${theMonth}-01`).format("ddd");

  const calendarDaysElement = document.getElementById("calendar-days");
  // Make empty days before first day
  for (let i = 0; i < 7; i++)
  {
    if (WEEKDAYS[i] == firstDayInMonth)
    {
      break;
    }
    else
    {
      const calendarDayElement = document.createElement("li");
      const calendarDayElementSpan = document.createElement("span");
      calendarDayElement.appendChild(calendarDayElementSpan);
      calendarDaysElement.appendChild(calendarDayElement);
    }
  }
  // Get number of days in the month, then for each day, make an element
  const NumberOfDaysInMonth = dayjs(`${theYear}-${theMonth}-01`).daysInMonth();
  for (let i = 0; i < NumberOfDaysInMonth; i++)
  {
    // Create a span element inside a li element
    const calendarDayElement = document.createElement("li");
    calendarDayElement.classList.add("calendar-day");
    const calendarDayElementSpan = document.createElement("span");
    calendarDayElement.appendChild(calendarDayElementSpan);
    calendarDaysElement.appendChild(calendarDayElement);
    calendarDayElementSpan.innerHTML = i + 1;
    if (i + 1 == INITIAL_DAY && theMonth == INITIAL_MONTH && theYear == INITIAL_YEAR)
    {
      calendarDayElementSpan.setAttribute("id", "today");
    }

    // Make scroll div to append textareas to later
    const scrollElement = document.createElement("div");
    scrollElement.classList.add("scroll");
    calendarDayElement.appendChild(scrollElement);



  }
  // Calendar month header
  const calendarMonthHeader = document.getElementById("selected-month");
  calendarMonthHeader.innerText = MONTHS[theMonth - 1] + " " + theYear;

  // Place events from event_list to the day, check month, year everytime
  for (const event of event_list)
  {

    if (theMonth == event["month"] && theYear == event["year"])
    {
      const elementsScroll = document.getElementById("calendar-days").getElementsByClassName("scroll");
      const elementsSpan = document.getElementById("calendar-days").getElementsByTagName("span");;
      for (let i = 0; i < elementsScroll.length; i++)
      {
        let childScroll = elementsScroll[i];
        // i + 1 because i starts from 0
        let childSpan = elementsSpan[i + 1];
        if (event["day"] == childSpan.innerText)
        {
          const eventsForDay = document.createElement("div");
          eventsForDay.classList.add("textarea");
          childScroll.appendChild(eventsForDay);
          eventsForDay.innerHTML = event["event"];
        }

      }

    }
  }

}



// Function to clear the calendar grid
function clearCalendar()
{
  let calendarGrid = document.getElementById("calendar-days");
  let first = calendarGrid.firstElementChild;
  while (first)
  {
    first.remove();
    first = calendarGrid.firstElementChild;
  }
}

// Function for event listeners
function eventListeners()
{
  // Event listener for left and right arrows
  document.getElementById("previous-month-selector").addEventListener("click", function(){
    clearCalendar();
    month--;
    correctMonths();
    make_calendar(month, year);
  });
  document.getElementById("next-month-selector").addEventListener("click", function(){
    clearCalendar();
    month++;
    correctMonths();
    make_calendar(month, year);
  });
  // Event listener for present month selector
  document.getElementById("present-month-selector").addEventListener("click", function(){
    clearCalendar();
    make_calendar(INITIAL_MONTH, INITIAL_YEAR);
  });

}
// Ensure no undefined months
function correctMonths()
{
  // Change year if month is 0 or 13
  if (month == 0)
  {
    month = 12;
    year--;
  }
  else if (month == 13)
  {
    month = 1;
    year++;
  }
}
