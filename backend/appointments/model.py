from sqlalchemy import inspect
from flask_validator import *

from .. import db  # from __init__.py


class Appointment(db.Model):
    """
    The Appointment model is used to create, book, and cancel appointments.
    """

    __tablename__ = "appointment"
    id = db.Column(db.Integer, primary_key=True)
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"))
    # pay attention here, need attention
    date = db.Column(db.DateTime, nullable=False)
    # cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    code_medical_examination = db.Column(
        db.Integer, db.ForeignKey("medical_exam.code"), nullable=False
    )
    id_prescription = db.Column(
        db.Integer, db.ForeignKey("prescription.id"), nullable=True
    )

    # validate that this is correct since the dates can be interpreted weirdly from db to python to json and viceversa
    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

    @classmethod
    def __declare_last__(cls):
        ValidateInteger(cls.id_prescription)
        ValidateInteger(cls.id_hospital)
