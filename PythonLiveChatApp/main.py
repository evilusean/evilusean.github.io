from flask import Flask, render_template, request, session, redirect
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase
#import modules
#socket server: uses sockets to communicate without refreshing the page,
# transmits to all clients listening for the updated messages


#basic setup for any flask webserver/application
app = Flask(__name__)
app.config["SECRET_KEY"] = "abcde12345"
socketio = SocketIO(app)

if __name__ == "__main__":
    socketio.run(app, debug=True)
