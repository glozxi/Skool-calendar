import os

from datetime import datetime, timezone, date

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash
import json

from helpers import apology, login_required

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True


# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///skool.db")

@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    # Get dictionary of deadlines by user
    event_list = get_event_list()
    if request.method == "POST":
        # Check if date is correct, then add to database, then do back to calendar
        if not request.form.get("date"):
            return apology("must provide date")
        else:
            # Date is in YYYY-MM-DD format
            date = request.form.get("date")
            # Split string with separator "-"
            yyyy_mm_dd = date.split("-")
            yyyy = int(yyyy_mm_dd[0])
            mm = int(yyyy_mm_dd[1])
            dd = int(yyyy_mm_dd[2])
            event = request.form.get("event")
            if not event:
                event = "Undescribed event"
            db.execute("INSERT INTO deadlines (userid, year, month, day, event) VALUES (?, ?, ?, ?, ?)", session["user_id"], yyyy, mm, dd, event)
            event_list = get_event_list()
            return render_template("index.html", event_list = json.dumps(event_list))
    else:
        return render_template("index.html", event_list = json.dumps(event_list))

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        # No username entered
        if not request.form.get("username"):
            return apology("must provide username")
        # See if username already exists
        # Query database
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))
        if len(rows) == 1:
            return apology("username already exists")
        # No password entered
        if not request.form.get("password") or not request.form.get("confirmation"):
            return apology("must provide password")
        # Confirmation not the same as password
        if request.form.get("password") != request.form.get("confirmation"):
            return apology("passwords do not match")
        username = request.form.get("username")
        password = request.form.get("password")
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?);", username, generate_password_hash(password))

        # Login after registering
        session.clear()
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)
        session["user_id"] = rows[0]["id"]

        # Redirect to homepage
        return redirect("/")

    else:
        return render_template("register.html")

@app.route("/delete", methods=["GET", "POST"])
@login_required
def delete():
    """Delete user's account"""
    if request.method == "POST":
        # delete transactions and account, then log them out
        db.execute("DELETE FROM deadlines WHERE userid=?", session["user_id"])
        db.execute("DELETE FROM users WHERE id = ?", session["user_id"])
        return redirect("/logout")
    else:
        return render_template("delete.html")

@app.route("/clear", methods=["GET", "POST"])
@login_required
def clear():
    """Delete events from database"""
    event_list = get_event_list()
    if request.method == "POST":
        # Returns list of checkbox value in string
        event_id = request.form.getlist("checkbox")
        if len(event_id) == 0:
            return apology("no date selected")
        for id in event_id:
            db.execute("DELETE FROM deadlines WHERE id=? AND userid=?", id, session["user_id"])
        # Updated event_list
        event_list = get_event_list()
        return render_template("clear.html", event_list = json.dumps(event_list))
    else:
        return render_template("clear.html", event_list = json.dumps(event_list))

@app.route("/upcoming", methods=["GET", "POST"])
@login_required
def upcoming():
    """Table of events today and future"""
    # Get today's date
    today = date.today()
    # dd/mm/YY
    ddmmyy = today.strftime("%d/%m/%Y")
    today_list = ddmmyy.split("/")
    # Convert to integer
    for str in today_list:
        str = int(str)
    # Present and future where year > this year, or same year but month > this month, or same year
    # and month but day >= this day
    # For future years
    future_year_list = db.execute("SELECT * FROM deadlines WHERE userid=? AND year>? ORDER BY year,month,day", session["user_id"], today_list[2])
    # For future months
    future_month_list = db.execute("SELECT * FROM deadlines WHERE userid=? AND year=? AND month>? ORDER BY month,day", session["user_id"], today_list[2], today_list[1])
    # For today and future days
    day_list = db.execute("SELECT * FROM deadlines WHERE userid=? AND year=? AND month=? AND day>=? ORDER BY day", session["user_id"], today_list[2], today_list[1], today_list[0])
    # List of dictionaries
    event_list = day_list + future_month_list + future_year_list
    # Arrange order by most recent to least recent

    return render_template("upcoming.html", event_list = event_list)

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

# Function to return list of dictionaries of user's events in deadlines
def get_event_list():
    event_list = db.execute("SELECT * FROM deadlines WHERE userid=?", session["user_id"])
    return event_list
