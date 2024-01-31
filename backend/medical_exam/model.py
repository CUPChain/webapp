from sqlalchemy import inspect
from flask_validator import *

from .. import db  # from __init__.py


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    code = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


