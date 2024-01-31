from flask import request
from flasgger import Swagger

from .app import app
from .controller import *

BASE_ROOT = "api"
VERSION = "v1"

swagger = Swagger(app)


# REST API routes for CRUD operations
@app.route(f"/{BASE_ROOT}/{VERSION}/appointments", methods=["GET"])
def get_appointments():
    """
    Retrieve all appointments
    ---
    tags:
      - Appointments
    responses:
      200:
        description: A list of appointments
    """
    # here I can manage GET PUT etc...
    # - /available_appointments?categoria&data: (categoria, data > today, id_prescription=null) [TODO: filter for category and data]
    category = request.args.get("category")
    print(category)
    date = request.args.get("date")
    print(date)
    return list_all_appointments(category, date)


@app.route(f"/{BASE_ROOT}/{VERSION}/appointments/create", methods=["POST"])
def make_appointment():
    """
    Create a new appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: category
        in: formData
        type: string
        required: true
      - name: id_hospital
        in: formData
        type: integer
        required: true
      - name: data
        in: formData
        type: datetime
        required: true
      - name: id_prescription
        in: formData
        type: string
    responses:
      200:
        description: Appointment created successfully
    """
    # - POST /appointments/create: categoria, ospedale (preso da login), data, dottore, id_prescription=null. Restituisci id token, creato random, univoco
    request_form = request.form.to_dict()
    return create_appointment(request_form)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/reserve/<id_prescription>", methods=["POST"]
)
def reserve_appointment(id_prescription):
    """
    Reserve an appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: id_prescription
        in: path
        type: string
        required: true
      - name: category
        in: formData
        type: string
        required: true
      - name: id_hospital
        in: formData
        type: integer
        required: true
      - name: data
        in: formData
        type: datetime
        required: true
      - name: id_prescription
        in: formData
        type: string
    responses:
      200:
        description: Appointment reserved successfully
    """
    # - PUT /appointments/update/id: aggiorna appointment con id_prescription inviato # for me is a POST
    request_form = request.form.to_dict()
    return book_appointment(id_prescription, request_form)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/cancel/<id_prescription>", methods=["POST"]
)
def cancel_appointment(id_prescription):
    """
    Cancel an appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: id_prescription
        in: path
        type: string
        required: true
      - name: category
        in: formData
        type: string
        required: true
      - name: id_hospital
        in: formData
        type: integer
        required: true
      - name: data
        in: formData
        type: datetime
        required: true
      - name: id_prescription
        in: formData
        type: string
    responses:
      200:
        description: Appointment cancelled successfully
    """
    return cancel_booked_appointment(id_prescription)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/<id_prescription>",
    methods=["GET"],
)
def get_appointment(id_prescription):
    """
    Retrieve appointment details by ID
    ---
    tags:
      - Appointments
    parameters:
      - name: id_prescription
        in: path
        type: string
        required: true
    responses:
      200:
        description: Appointment details retrieved successfully
    """

    return retrieve_appointment(id_prescription)


@app.route(f"/{BASE_ROOT}/{VERSION}/doctors", methods=["GET"])
def get_doctors():
    """
    Retrieve all doctors
    ---
    tags:
      - Doctors
    responses:
      200:
        description: A list of doctors
    """
    return list_all_doctors()


@app.route(f"/{BASE_ROOT}/{VERSION}/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    """
    Retrieve doctor details by CF
    ---
    tags:
      - Doctors
    parameters:
      - name: cf
        in: path
        type: string
        required: true
    responses:
      200:
        description: Doctor details retrieved successfully
    """
    return retrieve_doctor(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/hospitals", methods=["GET"])
def get_hospitals():
    """
    Retrieve all hospitals
    ---
    tags:
      - Hospitals
    responses:
      200:
        description: A list of hospitals
    """
    return list_all_hospitals()


@app.route(f"/{BASE_ROOT}/{VERSION}/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    """
    Retrieve hospital details by ID
    ---
    tags:
      - Hospitals
    parameters:
      - name: id_hospital
        in: path
        type: string
        required: true
    responses:
      200:
        description: Hospital details retrieved successfully
    """
    return retrieve_hospital(id_hospital)


@app.route(f"/{BASE_ROOT}/{VERSION}/is_able_to_do", methods=["GET"])
def get_is_able_to_do():
    """
    Retrieve all abilities
    ---
    tags:
      - Abilities
    responses:
      200:
        description: A list of abilities
    """
    return list_all_is_able_to_do()


@app.route(
    f"/{BASE_ROOT}/{VERSION}/hospital_is_able_to_do/<id_is_able_to_do>", methods=["GET"]
)
def get_hospital_is_able_to_do(id_is_able_to_do):
    """
    Retrieve hospital's ability details by ID
    ---
    tags:
      - Abilities
    parameters:
      - name: id_is_able_to_do
        in: path
        type: string
        required: true
    responses:
      200:
        description: Hospital's ability details retrieved successfully
    """
    return retrieve_all_hospital_is_able_to_do(id_is_able_to_do)


@app.route(f"/{BASE_ROOT}/{VERSION}/is_able_to_do_code/<code>", methods=["GET"])
def get_is_able_to_do_code(code):
    """
    Retrieve ability details by code
    ---
    tags:
      - Abilities
    parameters:
      - name: code
        in: path
        type: string
        required: true
    responses:
      200:
        description: Ability details retrieved successfully
    """
    return retrieve_all_is_able_to_do_code(code)


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams", methods=["GET"])
def get_medical_exams():
    """
    Retrieve all medical exams
    ---
    tags:
      - Medical Exams
    responses:
      200:
        description: A list of medical exams
    """
    return list_all_medical_exams()


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    """
    Retrieve medical exam details by code
    ---
    tags:
      - Medical Exams
    parameters:
      - name: code
        in: path
        type: string
        required: true
    responses:
      200:
        description: Medical exam details retrieved successfully
    """
    return retrieve_medical_exam(code)


@app.route(f"/{BASE_ROOT}/{VERSION}/patients", methods=["GET"])
def get_patients():
    """
    Retrieve all patients
    ---
    tags:
      - Patients
    responses:
      200:
        description: A list of patients
    """
    return list_all_patients()


@app.route(f"/{BASE_ROOT}/{VERSION}/patients/<cf>", methods=["GET"])
def get_patient(cf):
    """
    Retrieve patient details by CF
    ---
    tags:
      - Patients
    parameters:
      - name: cf
        in: path
        type: string
        required: true
    responses:
      200:
        description: Patient details retrieved successfully
    """
    return retrieve_patient(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions", methods=["GET"])
def get_prescriptions():
    """
    Retrieve all prescriptions
    ---
    tags:
      - Prescriptions
    responses:
      200:
        description: A list of prescriptions
    """
    return list_all_prescriptions()


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions/create", methods=["POST"])
def make_prescription():
    """
    Create a new prescription
    ---
    tags:
      - Prescriptions
    parameters:
      - name: code_medical_examination
        in: formData
        type: string
        required: true
      - name: cf_patient
        in: formData
        type: string
        required: true
      - name: categoria
        in: formData
        type: string
        required: true
      - name: id_doctor
        in: formData
        type: string
        required: true
      - name: doctor_name
        in: formData
        type: string
        required: true
      - name: note
        in: formData
        type: string
      - name: data
        in: formData
        type: string
    responses:
      200:
        description: Prescription created successfully
    """
    # - POST /prescriptions/create: categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO) [TODO: autorization]
    request_form = request.form.to_dict()

    # Check all required fields are present
    if (
        request_form.get("code_medical_examination") == None
        or request_form.get("cf_patient") == None
    ):
        return (
            jsonify({"message": "Missing required field(s)", "request": request_form}),
            400,
        )
    return create_prescription(request_form)


# - /prescriptions/id: id, categoria, id dottore, nome dottore, note, data (SE AUTORIZZATO) [TODO: autorization]
@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions/<id>", methods=["GET", "DELETE"])
def get_prescription(id):
    """
    Retrieve or delete prescription by ID
    ---
    tags:
      - Prescriptions
    parameters:
      - name: id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Prescription details retrieved successfully
      204:
        description: Prescription deleted successfully
    """
    if request.method == "GET":
        return retrieve_prescription(id)
    if request.method == "DELETE":
        return delete_prescription(id)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions_by_patient/<cf>", methods=["GET"])
def get_prescriptions_by_patient(cf):
    """
    Retrieve all prescriptions for a patient
    ---
    tags:
      - Prescriptions
    parameters:
      - name: cf
        in: path
        type: string
        required: true
    responses:
      200:
        description: A list of prescriptions for the patient
    """
    return retrieve_all_prescriptions_by_patient(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions_by_doctor/<cf>", methods=["GET"])
def get_prescriptions_by_doctor(cf):
    """
    Retrieve all prescriptions by a doctor
    ---
    tags:
      - Prescriptions
    parameters:
      - name: cf
        in: path
        type: string
        required: true
    responses:
      200:
        description: A list of prescriptions by the doctor
    """
    return retrieve_all_prescriptions_by_doctor(cf)


@app.route(f"/{BASE_ROOT}/{VERSION}/prescriptions_for_doctor/<cf>", methods=["POST"])
def get_prescriptions_for_doctor_by_pat(cf):
    """
    Retrieve all prescriptions for a doctor by patient
    ---
    tags:
      - Prescriptions
    parameters:
      - name: cf
        in: path
        type: string
        required: true
      - name: cf_doctor
        in: formData
        type: string
        required: true

    responses:
      200:
        description: A list of prescriptions from the doctor for a patient
    """
    # cf is the cf of a patient
    request_form = request.form.to_dict()
    return retrieve_all_prescriptions_for_doctor_by_patient(cf, request_form)
