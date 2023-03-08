from flask import Flask, render_template, request, session, redirect
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase


#basic setup for any flask webserver/application
app = Flask(__name__)
app.config["SECRET_KEY"] = "abcde12345"
socketio = SocketIO(app)


@app.route("/", methods=["POST", "GET"])
def home():
    return render_template("home.html")

if __name__ == "__main__":
    socketio.run(app, debug=True)
