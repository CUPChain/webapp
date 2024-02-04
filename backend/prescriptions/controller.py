from flask import jsonify
from .. import db
from .model import *
from ..medical_exam.model import MedicalExam
from ..login.model import Account


def retrieve_prescription(id):
    """
    Retrieve a prescription by its ID.

    Args:
        id (int): The ID of the prescription to retrieve.

    Returns:
        flask.Response: The JSON response containing the prescription and associated medical exam data,
        or a message indicating that no prescription was found with the given ID.
    """
    prescription = (
        db.session.query(Prescription, MedicalExam)
        .filter(Prescription.id == id)
        .join(Prescription, Prescription.code_medical_examination == MedicalExam.code)
        .one_or_none()
    )

    if prescription:
        return jsonify(
            {
                "prescription": prescription[0].toDict(),
                "medical_exam": prescription[1].toDict(),
            }
        )
    else:
        return jsonify({"message": f"No Prescription found with id: '{id}'"}), 404


def create_prescription(request_form, cf_doctor):
    """
    Create a prescription for a patient.

    Args:
        request_form (dict): The form data containing the prescription details.
        cf_doctor (str): The CF (Codice Fiscale) of the doctor creating the prescription.

    Returns:
        dict: The JSON response containing the created prescription details.
    """
    # Get the patient from the pkey
    account = db.session.execute(
        db.select(Account).filter_by(pkey=request_form["pkey_patient"])
    ).one_or_none()
    if account == None:
        return (
            jsonify(
                {
                    "error": f"Patient with pkey '{request_form['pkey_patient']}' not found."
                }
            ),
            404,
        )

    # Create the prescription using the request form and the patient
    new_prescription = Prescription(
        code_medical_examination=request_form["code_medical_examination"],
        cf_patient=account[0].cf_patient,
        cf_doctor=cf_doctor,
    )
    db.session.add(new_prescription)
    db.session.commit()

    # no need of storing hash since we can query and recalculate the hash

    response = Prescription.query.get(new_prescription.id).toDict()
    return jsonify(response)


def delete_prescription(id):
    """
    Delete a prescription with the given ID from the database.

    Args:
        id (int): The ID of the prescription to be deleted.

    Returns:
        str: A success message indicating that the prescription has been deleted.
    """
    Prescription.query.filter_by(id=id).delete()
    db.session.commit()

    return ('Prescription with Id "{}" deleted successfully!').format(id)


def retrieve_all_prescriptions_by_patient(cf):
    """
    Retrieve all prescriptions for a given patient.

    Args:
        cf (str): The patient's fiscal code.

    Returns:
        A JSON response containing the prescriptions for the patient,
        or a JSON response with an error message if no prescriptions are found.
    """
    prescriptions = db.session.execute(
        db.select(Prescription).where(Prescription.cf_patient == cf)
    )
    if prescriptions:
        return jsonify(
            {
                "prescriptions": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify({"message": f"No Prescriptions found for patient: '{cf}'"}),
            404,
        )  # not reachable since output an empty list


def retrieve_all_prescriptions_by_doctor(cf):
    """
    Retrieve all prescriptions for a given doctor.

    Args:
        cf (str): The doctor's CF (Codice Fiscale).

    Returns:
        A JSON response containing the list of prescriptions for the doctor.
        If no prescriptions are found, a JSON response with an error message is returned.
    """
    prescriptions = db.session.execute(
        db.select(Prescription).where(Prescription.cf_doctor == cf)
    )
    if prescriptions:
        return jsonify(
            {
                "prescriptions": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify({"message": f"No Prescriptions found for doctor: '{cf}'"}),
            404,
        )  # not reachable since output an empty list
