#socket server: uses sockets to communicate without refreshing the page, transmits to all clients listening for the updated messages
from flask import flask, render_template, request, session, redirect
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase

app = Flask(__name__)
app.config["SECRET_KEY"] = "abcde12345"
socketio = SocketIO(app)
