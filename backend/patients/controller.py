from flask import jsonify

from .. import db
from .model import *


def retrieve_patient(cf):
    patient = db.session.execute(
        db.select(Patient).filter_by(cf=cf)
    ).one_or_none()
    if patient:
        return patient[0]
    else:
        return None
