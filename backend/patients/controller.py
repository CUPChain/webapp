from flask import jsonify

from .. import db
from .model import *


def list_all_patients():
    result = db.session.execute(db.select(Patient))
    patients_list = [patient[0].toDict() for patient in result]
    return jsonify({"patients": patients_list})


# - /me: info persona loggata


def retrieve_patient(cf):
    patient = db.session.execute(db.select(Patient).filter_by(cf=cf)).one_or_none()
    if patient:
        return jsonify({"patient": patient[0].toDict()})
    else:
        return jsonify({"message": f"No Patient found with cf: '{cf}'"}), 404
