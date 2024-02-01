from sqlalchemy import inspect
from flask_validator import *

from .. import db  # from __init__.py


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
    # pkey = db.Column(db.LargeBinary, nullable=False)

    def toDict(self):
        return {
            c.key: getattr(self, c.key)
            if c.key != "pkey"
            else getattr(self, c.key).decode("utf-8")
            for c in inspect(self).mapper.column_attrs
        }
