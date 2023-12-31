from flask import request

from .app import app
from .controller import *


# REST API routes for CRUD operations
@app.route("/api/v1/appointments", methods=["GET"])
def get_appointments():
    # here I can manage GET PUT etc...
    return list_all_appointments()


@app.route("/api/v1/appointments/<id_prescription>", methods=["GET"])
def get_appointment(id_prescription):
    return retrieve_appointment(id_prescription)


@app.route("/api/v1/doctors", methods=["GET"])
def get_doctors():
    return list_all_doctors()


@app.route("/api/v1/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    return retrieve_doctor(cf)


@app.route("/api/v1/hospitals", methods=["GET"])
def get_hospitals():
    return list_all_hospitals()


@app.route("/api/v1/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    return retrieve_hospital(id_hospital)


@app.route("/api/v1/is_able_to_do", methods=["GET"])
def get_is_able_to_do():
    return list_all_is_able_to_do()


@app.route("/api/v1/hospital_is_able_to_do/<id_is_able_to_do>", methods=["GET"])
def get_hospital_is_able_to_do(id_is_able_to_do):
    return retrieve_all_hospital_is_able_to_do(id_is_able_to_do)


@app.route("/api/v1/is_able_to_do_code/<code>", methods=["GET"])
def get_is_able_to_do_code(code):
    return retrieve_all_is_able_to_do_code(code)


@app.route("/api/v1/medical_exams", methods=["GET"])
def get_medical_exams():
    return list_all_medical_exams()


@app.route("/api/v1/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    return retrieve_medical_exam(code)


@app.route("/api/v1/patients", methods=["GET"])
def get_patients():
    return list_all_patients()


@app.route("/api/v1/patients/<cf>", methods=["GET"])
def get_patient(cf):
    return retrieve_patient(cf)


@app.route("/api/v1/prescriptions", methods=["GET"])
def get_prescriptions():
    return list_all_prescriptions()


@app.route("/api/v1/prescriptions/<id>", methods=["GET"])
def get_prescription(id):
    return retrieve_prescription(id)


@app.route("/api/v1/prescriptions_by_patient/<cf>", methods=["GET"])
def get_prescriptions_by_patient(cf):
    return retrieve_all_prescriptions_by_patient(cf)


@app.route("/api/v1/prescriptions_by_doctor/<cf>", methods=["GET"])
def get_prescriptions_by_doctor(cf):
    return retrieve_all_prescriptions_by_doctor(cf)
