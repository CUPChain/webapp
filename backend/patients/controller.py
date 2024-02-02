from flask import jsonify

from .. import db
from .model import *


def retrieve_patient(cf):
    """
    Retrieve a patient from the database based on their CF (Codice Fiscale).

    Args:
        cf (str): The CF of the patient to retrieve.

    Returns:
        Patient or None: The retrieved patient object if found, None otherwise.
    """
    patient = db.session.execute(db.select(Patient).filter_by(cf=cf)).one_or_none()
    if patient:
        return patient[0]
    else:
        return None
