from time import localtime, strftime
from flask import Flask, render_template, url_for, redirect, flash
from flask_login import LoginManager, login_user, current_user, logout_user
from flask_socketio import SocketIO, send, join_room, leave_room

from wtform_fields import *
from models import *

app = Flask(__name__)
app.secret_key = 'replace later'

# Configure database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://vookgbxycfnaik:8280f591472604c08c560a3e3cb262a02' \
                                        '959805789f5db1b45db18252af77e08@ec2-54-247-79-178.eu-west-1.' \
                                        'compute.amazonaws.com:5432/d7j01h7q0t9c6o'
db = SQLAlchemy(app)

# InitIalize Flask SocketIO
socketio = SocketIO(app)
ROOMS = ['ROOM 1', 'ROOM 2']

# Configure flask login
login = LoginManager(app)
login.init_app(app)


@login.user_loader
def load_user(id):
    return User.query.get(id)


@app.route('/', methods=['GET', 'POST'])
def index():

    reg_form = RegistrationForm()
    if reg_form.validate_on_submit():
        username = reg_form.username.data
        password = reg_form.password.data

        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()

        flash("Registered successfully. Please login.", "success")
        return redirect(url_for('login'))

    return render_template('index.html', form=reg_form)


@app.route('/login', methods=['GET', 'POST'])
def login():

    login_form = LoginForm()

    if login_form.validate_on_submit():
        user_object = User.query.filter_by(username=login_form.username.data).first()
        login_user(user_object)
        return redirect(url_for('chat'))
    return render_template('login.html', form=login_form )


@app.route("/chat", methods=['GET','POST'])
def chat():
    # if not current_user.is_authenticated:
    #     flash('Please login.', 'danger')
    #     return redirect(url_for('login '))
    return render_template('chat.html', username=current_user.username, rooms=ROOMS)


@app.route("/logout", methods=['GET'])
def logout():
    logout_user()
    flash('You have logged out successfully','success')
    return redirect(url_for('login'))


@socketio.on('message')
def message(data):
    print(f"\n\n {data} \n\n")
    send({"msg": data["msg"], "username": data["username"], "time_stamp": strftime('%b-%d %I:%M%p',localtime())},
         room=data["room"])


@socketio.on('join')
def join(data):

    join_room(data['room'])
    send({'msg':data['username'] + "has joined the " + data['room'] + "room."}, room=data['room'])


@socketio.on('leave')
def leave(data):
    leave_room(data['room'])
    send({'msg': data['username'] + "has left the " + data['room'] + "room."}, room=data['room'])



if __name__ == "__main__":
    socketio.run(app, debug=True)
