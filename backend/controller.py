from flask import request, jsonify
import uuid

from . import db
from .models import *

# # Configuration Mode => development, testing, staging, or production
# CONFIG_MODE = development # change this line to production for the hosted db

# # POSTGRESQL_DATABASE_URI => 'postgresql://user:password@host:port/database'
# DEVELOPMENT_DATABASE_URL = 'postgresql://user:password@localhost:port/database'
# TEST_DATABASE_URL        = ''
# STAGING_DATABASE_URL     = ''
# PRODUCTION_DATABASE_URL  = 'postgresql://user:password@davehost:port/database'


def list_all_appointments():
    result = db.session.execute(db.select(Appointment))
    appointments_list = [appointment[0].toDict() for appointment in result]
    return jsonify({"appointments": appointments_list})


def retrieve_appointment(id_prescription):
    appointment = db.session.execute(
        db.select(Appointment).filter_by(id_prescription=id_prescription),
    ).one_or_none()
    # appointment = db.one_or_404(
    #     db.select(Appointment).filter_by(id_prescription=id_prescription),
    #     description=f"No appointments associated with the id of the prescription: '{id_prescription}'.",
    # )

    if appointment:
        return jsonify({"appointment": appointment[0].toDict()})
    else:
        return (
            jsonify(
                {
                    "message": f"No appointments associated with the id of the prescription: '{id_prescription}'"
                }
            ),
            404,
        )


def list_all_doctors():
    result = db.session.execute(db.select(Doctor))
    doctors_list = [doctor[0].toDict() for doctor in result]
    return jsonify({"doctors": doctors_list})


def retrieve_doctor(cf):
    doctor = db.session.execute(db.select(Doctor).filter_by(cf=cf)).one_or_none()
    if doctor:
        return jsonify({"doctor": doctor[0].toDict()})
    else:
        return jsonify({"message": f"No Doctor found with cf: '{cf}'"}), 404


def list_all_hospitals():
    result = db.session.execute(db.select(Hospital))
    hospitals_list = [hospital[0].toDict() for hospital in result]
    return jsonify({"hospitals": hospitals_list})


def retrieve_hospital(id_hospital):
    hospital = db.session.execute(
        db.select(Hospital).filter_by(id=id_hospital)
    ).one_or_none()
    if hospital:
        return jsonify({"hospital": hospital[0].toDict()})
    else:
        return jsonify({"message": "Hospital not found"}), 404


def list_all_is_able_to_do():
    result = db.session.execute(db.select(IsAbleToDo))
    is_able_to_do_list = [is_able_to_do[0].toDict() for is_able_to_do in result]
    return jsonify({"is_able_to_do": is_able_to_do_list})


def retrieve_all_hospital_is_able_to_do(id_is_able_to_do):
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.id_hospital == id_is_able_to_do)
    )
    if result:
        is_able_to_do_data = [is_able_to_do[0].toDict() for is_able_to_do in result]
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return (
            jsonify({"message": "Is able to do not found"}),
            404,
        )  # impossible to reach since output an empty list


def retrieve_all_is_able_to_do_code(code):
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.code_medical_examination == code)
    )
    if result:
        is_able_to_do_data = [is_able_to_do[0].toDict() for is_able_to_do in result]
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return (
            jsonify({"message": "Is able to do not found"}),
            404,
        )  # impossible to reach since output an empty list


def list_all_medical_exams():
    result = db.session.execute(db.select(MedicalExam))
    medical_exams_list = [medical_exam[0].toDict() for medical_exam in result]
    return jsonify({"medical_exams": medical_exams_list})


def retrieve_medical_exam(code):
    medical_exam = db.session.execute(
        db.select(MedicalExam).filter_by(code=code)
    ).one_or_none()
    if medical_exam:
        return jsonify({"medical_exam": medical_exam[0].toDict()})
    else:
        return jsonify({"message": f"No Medical exams found with code: '{code}'"}), 404


def list_all_patients():
    result = db.session.execute(db.select(Patient))
    patients_list = [patient[0].toDict() for patient in result]
    return jsonify({"patients": patients_list})


def retrieve_patient(cf):
    patient = db.session.execute(db.select(Patient).filter_by(cf=cf)).one_or_none()
    if patient:
        return jsonify({"patient": patient[0].toDict()})
    else:
        return jsonify({"message": f"No Patient found with cf: '{cf}'"}), 404


def list_all_prescriptions():
    result = db.session.execute(db.select(Prescription))
    prescriptions_list = [prescription[0].toDict() for prescription in result]
    return jsonify({"prescriptions": prescriptions_list})


def retrieve_prescription(id):
    prescription = db.session.execute(
        db.select(Prescription).filter_by(id=id)
    ).one_or_none()
    if prescription:
        return jsonify({"prescription": prescription[0].toDict()})
    else:
        return jsonify({"message": f"No Prescription found with id: '{id}'"}), 404


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


if __name__ == "__main__":
    app.run(debug=True)
