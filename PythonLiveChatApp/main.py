from flask import Flask, render_template, request, session, redirect
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase


#basic setup for any flask webserver/application
app = Flask(__name__)
app.config["SECRET_KEY"] = "abcde12345"
socketio = SocketIO(app)

rooms = {}
def generate_unique_code(Length):
    while True:
        code = ""
        for _ in range(length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code

@app.route("/", methods=["POST", "GET"])
def home():
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

        if not name:
            return render_template("home.html", error="Please Enter a Name.")
        
        if join != False and not code:
            return render_template("home.html", error="Please Enter a Room Code.")
        
        room = code 
        if create != False:
            room = generate_unique_code(4)

if __name__ == "__main__":
    socketio.run(app, debug=True)
