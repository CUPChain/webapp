from flask import request

from .app import app
from .controller import *

BASE_ROOT = "api"
VERSION = "v1"


# REST API routes for CRUD operations
@app.route(f"/{BASE_ROOT}/{VERSION}/appointments", methods=["GET"])
def get_appointments():
    # here I can manage GET PUT etc...
    return list_all_appointments()


@app.route(f"/{BASE_ROOT}/{VERSION}/appointments/create", methods=["POST"])
def make_appointment():
    # - POST /appointments/create: categoria, ospedale (preso da login), data, dottore, id_prescription=null. Restituisci id token, creato random, univoco
    request_form = request.form.to_dict()
    return create_appointment(request_form)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/reserve/<id_prescription>", methods=["POST"]
)
def reserve_appointment(id_prescription):
    # - PUT /appointments/update/id: aggiorna appointment con id_prescription inviato # for me is a POST
    request_form = request.form.to_dict()
    return book_appointment(id_prescription, request_form)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/cancel/<id_prescription>", methods=["POST"]
)
def cancel_appointment(id_prescription):
    return cancel_booked_appointment(id_prescription)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/<id_prescription>",
    methods=["GET"],
)
def get_appointment(id_prescription):
    if request.method == "GET":
        return retrieve_appointment(id_prescription)


# - /available_appointments?categoria&data: (categoria, data > today, id_prescription=null) [TODO: filter for category and data]
# category = request.args.get("category")
# data = request.args.get("data")


@app.route(f"/{BASE_ROOT}/{VERSION}/doctors", methods=["GET"])
def get_doctors():
    return list_all_doctors()


@app.route(f"/{BASE_ROOT}/{VERSION}/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    return retrieve_doctor(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/hospitals", methods=["GET"])
def get_hospitals():
    return list_all_hospitals()


@app.route(f"/{BASE_ROOT}/{VERSION}/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    return retrieve_hospital(id_hospital)


@app.route(f"/{BASE_ROOT}/{VERSION}/is_able_to_do", methods=["GET"])
def get_is_able_to_do():
    return list_all_is_able_to_do()


@app.route(
    f"/{BASE_ROOT}/{VERSION}/hospital_is_able_to_do/<id_is_able_to_do>", methods=["GET"]
)
def get_hospital_is_able_to_do(id_is_able_to_do):
    return retrieve_all_hospital_is_able_to_do(id_is_able_to_do)


@app.route(f"/{BASE_ROOT}/{VERSION}/is_able_to_do_code/<code>", methods=["GET"])
def get_is_able_to_do_code(code):
    return retrieve_all_is_able_to_do_code(code)


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams", methods=["GET"])
def get_medical_exams():
    return list_all_medical_exams()


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    return retrieve_medical_exam(code)


@app.route(f"/{BASE_ROOT}/{VERSION}/patients", methods=["GET"])
def get_patients():
    return list_all_patients()


@app.route(f"/{BASE_ROOT}/{VERSION}/patients/<cf>", methods=["GET"])
def get_patient(cf):
    return retrieve_patient(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions", methods=["GET"])
def get_prescriptions():
    return list_all_prescriptions()


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions/create", methods=["POST"])
def make_prescription():
    # - POST /prescriptions/create: categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO) [TODO: autorization]
    request_form = request.form.to_dict()

    # Check all required fields are present
    if (request_form.get("code_medical_examination") == None or request_form.get("cf_patient") == None):
        return  (
            jsonify({"message": "Missing required field(s)", "request": request_form}),
            400,
        ) 
    return create_prescription(request_form)


# - /prescriptions/id: id, categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO) [TODO: autorization]
@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions/<id>", methods=["GET", "DELETE"])
def get_prescription(id):
    if request.method == "GET":
        return retrieve_prescription(id)
    if request.method == "DELETE":
        return delete_prescription(id)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions_by_patient/<cf>", methods=["GET"])
def get_prescriptions_by_patient(cf):
    return retrieve_all_prescriptions_by_patient(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions_by_doctor/<cf>", methods=["GET"])
def get_prescriptions_by_doctor(cf):
    return retrieve_all_prescriptions_by_doctor(cf)
