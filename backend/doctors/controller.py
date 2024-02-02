from flask import jsonify

from .. import db
from .model import *


# def list_all_doctors():
#     """
#     Retrieves a list of all doctors from the database.
#     Returns:
#         A JSON response containing the list of doctors.
#     """
#     result = db.session.execute(db.select(Doctor))
#     doctors_list = [doctor[0].toDict() for doctor in result]
#     return jsonify({"doctors": doctors_list})


def retrieve_doctor(cf):
    """
    Retrieve a doctor from the database based on their CF (Codice Fiscale).

    Args:
        cf (str): The CF of the doctor to retrieve.

    Returns:
        Doctor or None: The retrieved doctor object if found, None otherwise.
    """
    doctor = db.session.execute(db.select(Doctor).filter_by(cf=cf)).one_or_none()
    if doctor:
        return doctor[0]
    else:
        return None
