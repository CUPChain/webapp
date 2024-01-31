from flask import jsonify
from .. import db
from .model import *


def list_all_prescriptions():
    result = db.session.execute(db.select(Prescription))
    prescriptions_list = [prescription[0].toDict() for prescription in result]
    return jsonify({"prescriptions": prescriptions_list})


def retrieve_prescription(id):
    # - /prescriptions/id: id, categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO)
    # [TODO: autorization]
    prescription = db.session.execute(
        db.select(Prescription).filter_by(id=id)
    ).one_or_none()
    if prescription:
        return jsonify({"prescription": prescription[0].toDict()})
    else:
        return jsonify({"message": f"No Prescription found with id: '{id}'"}), 404


def create_prescription(request_form):
    # - POST /prescriptions/create: categoria, CF/address utente, dottore (preso da login), data, note. Restituisci id token, creato random, univoco

    # id = str(uuid.uuid4())
    new_prescription = Prescription(
        # id=id,
        code_medical_examination=request_form["code_medical_examination"],
        cf_patient=request_form["cf_patient"],
        cf_doctor=request_form["cf_doctor"],
        # date=request_form["date"], maybe a date of issue can be interesting?
        # note=request_form["note"], maybe a field for some note can be interesting?
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
                "prescription": [
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
                "prescription": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify({"message": "No Prescriptions found for doctor: '{cf}'"}),
            404,
        )  # not reachable since output an empty list


def retrieve_all_prescriptions_for_doctor_by_patient(cf, request_form):
    doctor = request_form["cf_doctor"]
    prescriptions = db.session.execute(
        db.select(Prescription)
        .where(Prescription.cf_doctor == doctor)
        .where(Prescription.cf_patient == cf)
    )
    if prescriptions:
        return jsonify(
            {
                "prescription": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify(
                {
                    "message": "No Prescriptions found for doctor: '{doctor}' and patient: '{cf}'"
                }
            ),
            404,
        )  # not reachable since output an empty list
