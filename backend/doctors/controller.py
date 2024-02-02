from flask import jsonify

from .. import db
from .model import *


# def list_all_doctors():
#     result = db.session.execute(db.select(Doctor))
#     doctors_list = [doctor[0].toDict() for doctor in result]
#     return jsonify({"doctors": doctors_list})


def retrieve_doctor(cf):
    doctor = db.session.execute(
        db.select(Doctor).filter_by(cf=cf)).one_or_none()
    if doctor:
        return doctor[0]
    else:
        return None
