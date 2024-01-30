from sqlalchemy import inspect
from datetime import datetime
from flask_validator import *
from sqlalchemy.orm import validates
import random

from . import db  # from __init__.py


# for future when I do the account stuff
class Account(db.Model):
    # Auto Generated Fields:
    id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
    created = db.Column(
        db.DateTime(timezone=True), default=datetime.now
    )  # The Date of the Instance Creation => Created one Time when Instantiation
    updated = db.Column(
        db.DateTime(timezone=True), default=datetime.now, onupdate=datetime.now
    )  # The Date of the Instance Update => Changed with Every Update

    # Input by User Fields:
    email = db.Column(db.String(100), nullable=False, unique=True)
    username = db.Column(db.String(50), nullable=False)
    birthday = db.Column(db.Date)
    country = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))

    # Login with MetaMask Fields:
    address = db.Column(db.String(100), nullable=False, unique=True)
    nonce = db.Column(
        db.Integer, nullable=False, default=random.randint(0, 2**32 - 1)
    )
    jwt = db.Column(db.String(1000), nullable=False, default="")
    jwt_exp = db.Column(
        db.DateTime(timezone=True), nullable=False, default=datetime.now
    )

    # Validations => https://flask-validator.readthedocs.io/en/latest/index.html
    @classmethod
    def __declare_last__(cls):
        ValidateEmail(
            Account.email, True, True, "The email is not valid. Please check it"
        )  # True => Allow internationalized addresses, True => Check domain name resolution.
        ValidateString(Account.username, True, True, "The username type must be string")
        ValidateCountry(Account.country, True, True, "The country is not valid")

    # Set an empty string to null for username field => https://stackoverflow.com/a/57294872
    @validates("username")
    def empty_string_to_null(self, key, value):
        if isinstance(value, str) and value == "":
            return None
        else:
            return value

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Appointment(db.Model):
    __tablename__ = "appointment"
    id = db.Column(db.Integer, primary_key=True)
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"))
    date = db.Column(db.DateTime, nullable=False)  # pay attention here, need attention
    # cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    code_medical_examination = db.Column(db.Integer, db.ForeignKey("medical_exam.code"))
    id_prescription = db.Column(db.Integer, db.ForeignKey("prescription.id"))

    # validate that this is correct since the dates can be interpreted weirdly from db to python to json and viceversa
    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

    @classmethod
    def __declare_last__(cls):
        ValidateInteger(cls.id_prescription)
        ValidateInteger(cls.id_hospital)


class Doctor(db.Model):
    __tablename__ = "doctor"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    cap = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    pkey = db.Column(db.LargeBinary, nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Hospital(db.Model):
    __tablename__ = "hospital"
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    cap = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    pkey = db.Column(db.LargeBinary, nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class IsAbleToDo(db.Model):
    __tablename__ = "is_able_to_do"
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"), primary_key=True)
    code_medical_examination = db.Column(
        db.Integer, db.ForeignKey("medical_exam.code"), primary_key=True
    )

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    code = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Patient(db.Model):
    __tablename__ = "patient"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    residence = db.Column(db.String(100), nullable=False)
    cap = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Prescription(db.Model):
    __tablename__ = "prescription"
    id = db.Column(db.Integer, primary_key=True)
    cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    cf_patient = db.Column(db.String(16), db.ForeignKey("patient.cf"))
    code_medical_examination = db.Column(db.Integer, db.ForeignKey("medical_exam.code"))

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
