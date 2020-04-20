from models import *
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo, ValidationError


def invalid_credentials(form, field):
    """ Username and password checker"""

    username_entered = form.username.data
    password_entered = field.data

    user_object = User.query.filter_by(username=username_entered).first()
    if user_object is None:
        raise ValidationError("Username or password is incorrect")
    elif password_entered != user_object.password:
        raise  ValidationError('Password is incorrect')


class RegistrationForm(FlaskForm):
    """ Registration form """

    username = StringField('user_name_label',
                           validators=[InputRequired(message="Username required"),
                                       Length(min=4, max=25, message="User name must be between 4 and 25 characters")])
    password = PasswordField('password_label',
                             validators=[InputRequired(message="Password required"),
                                       Length(min=4, max=25, message="Password must be between 4 and 25 characters")])
    confirm_pswd = PasswordField('confirm_pswd_label',
                                 validators=[InputRequired(message="Password required"),
                                             EqualTo('password', message="Passwords must match!"),])
    submit_button = SubmitField("Creat")

    def validate_username(self, username):
        user_object = User.query.filter_by(username=username.data).first()
        if user_object:
            raise ValidationError("Username already exists. Select a different username please.")


class LoginForm(FlaskForm):
    """ Login form """

    username = StringField("username_label", validators=[InputRequired(message="Username is required.")])
    password = PasswordField("password_label", validators=[InputRequired(message="Password is required."),
                                                         invalid_credentials])
    submit_button = SubmitField('Login')