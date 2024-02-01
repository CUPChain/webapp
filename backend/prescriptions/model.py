from .. import db
from sqlalchemy import inspect


class Prescription(db.Model):
    __tablename__ = "prescription"
    id = db.Column(db.Integer, primary_key=True)
    cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    cf_patient = db.Column(db.String(16), db.ForeignKey("patient.cf"))
    code_medical_examination = db.Column(db.Integer, db.ForeignKey("medical_exam.code"))

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
