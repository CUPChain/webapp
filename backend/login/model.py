from .. import db
from sqlalchemy import inspect
import random
from ..config import NONCE_LIMIT


class Account(db.Model):
    # Login with MetaMask Fields:
    pkey = db.Column(db.String(42), nullable=False,
                     unique=True, primary_key=True)
    nonce = db.Column(
        db.Integer, nullable=False, default=random.randint(0, NONCE_LIMIT)
    )
    jwt = db.Column(db.String(1000), nullable=True)
    jwt_exp = db.Column(db.DateTime, nullable=True)
    cf_patient = db.Column(
        db.String(16), db.ForeignKey("patient.cf"), nullable=True)
    cf_doctor = db.Column(
        db.String(16), db.ForeignKey("doctor.cf"), nullable=True)
    id_hospital = db.Column(
        db.Integer, db.ForeignKey("hospital.id"), nullable=True)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
