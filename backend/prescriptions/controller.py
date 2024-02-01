from flask import jsonify
from .. import db
from .model import *
from ..medical_exam.model import MedicalExam
from ..login.model import Account


def retrieve_prescription(id):
    # - /prescriptions/id: id, categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO)
    # [TODO: autorization]

    prescription = (
        db.session.query(Prescription, MedicalExam)
        .filter(Prescription.id == id)
        .join(Prescription, Prescription.code_medical_examination == MedicalExam.code)
        .one_or_none()
    )
    # prescription = db.session.execute(
    #     db.select(Prescription).filter_by(id=id)
    # ).one_or_none()
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
    # Get the patient from the pkey
    account = db.session.execute(
        db.select(Account).filter_by(pkey=request_form["pkey_patient"])
    ).one_or_none()
    if account == None:
        return (
            jsonify(
                {"error": f"Patient with pkey '{request_form['pkey_patient']}' not found."}),
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

    response = Prescription.query.get(
        new_prescription.id  # TODO: test if new_prescription.id works
    ).toDict()
    return jsonify(response)


def delete_prescription(id):
    Prescription.query.filter_by(id=id).delete()
    db.session.commit()

    return ('Prescription with Id "{}" deleted successfully!').format(id)


def retrieve_all_prescriptions_by_patient(cf):
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
            jsonify({"message": "No Prescriptions found for patinet: '{cf}'"}),
            404,
        )  # not reachable since output an empty list


def retrieve_all_prescriptions_by_doctor(cf):
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
            jsonify({"message": "No Prescriptions found for doctor: '{cf}'"}),
            404,
        )  # not reachable since output an empty list
