from .. import db
from sqlalchemy import inspect


class Hospital(db.Model):
    __tablename__ = "hospital"
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(50), nullable=False)
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


class IsAbleToDo(db.Model):
    __tablename__ = "is_able_to_do"
    id_hospital = db.Column(db.Integer, db.ForeignKey(
        "hospital.id"), primary_key=True)
    code_medical_examination = db.Column(
        db.Integer, db.ForeignKey("medical_exam.code"), primary_key=True
    )

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
