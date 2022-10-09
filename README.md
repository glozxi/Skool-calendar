# Skool calendar
#### Video Demo:  https://youtu.be/8HLuL7NUNXA
#### Description:
Skool calendar is a web-based application that allows users to schedule events. It lets users register and
log in to save their schedules and after logging in, the user can look at events on the calendar, see upcoming
events and delete events that they have completed. If they want to, they can also delete their account. It uses
Flask, Bootstrap, SQL and Javascript.

Login, register and log out are implemented the same way as CS50 Finance. User information is stored in skool.db, users table. Much of the website style is also the same.

templates/layout.html is the basic layout for all pages, with the colour and navigation bar. templates/apology.html apologises to the user when an error occurs.

At the homepage, the user can see a form to make new events. They can select which date they want and write a
description of the event. If no description is entered, the description is saved as "Undescribed event". The event is saved in an SQL database, skool.db in the deadlines table.

Under the form, there is a calendar with each day having the day number and a scrollable division. The current day number is highlighted. Inside the division, scrollable textareas display the events for the day. If words in the textarea are too long, they are wrapped. The files for the homepage are templates/index.html and static/src/index.js. The calendar is styled specially by static/src/styles.css.

It was difficult to make a calendar. I adapted one from online, but it used Parcel.js, which I did not
know how to use together with Flask, so I changed the calendar use Javascript without Parcel. The calendar
months can be changed by clicking the arrows on the calendar and by clicking "Today", the calendar shows
the current month. I decided for he textareas to be in a division as I wanted the user to be able to see all of the text by scrolling, while still being able to see the day numbering. The calendar uses the Javascript library day.js to get dates, including the current date.

By clicking "Complete event", the user sees a form. They fill in a date and submit the form. Depending on which date they choose and the events on the dat, there is either "No event" or another form where they can check boxes of the events they want to delete on the selected date. After submitting the form, the events selected are deleted from the database. The page reloads with new data on the event. The appearance of the checklist form happens due to src/clear.js, which changes the HTML of templates/clear.html depending on the date selected. All event data is loaded when the page is loaded, but by implementing the date form, the page is not cluttered by events of all the days. After the reload from submitting, event data is updated and the checklist form no longer displays the deleted events.

"Upcoming events" page has a table of events for today and the future. The events are arranged by SQL selection into a list, where they are displayed in order of date using a Jinja for loop. The events' description and dates are displayed. The HTML is in templates/upcoming.html.

"Delete account" has a form with HTML templates/delete.html where the user can tick a checkbox and submit. The red text is a warning that catches the eye. After submission, all data with the user's id in skool.db will be deleted, and the user is logged out.

The file application.py enables SQL queries, log in and routes. It uses form data in SQL queries. After converting Python object to JSON object, Flask can embed the JSON object to Javascript, where it can be used. I used this to transfer the list of events selected from SQL to the Javascript files. Javascript is used to insert elements into HTML.

Thanks for reading!
