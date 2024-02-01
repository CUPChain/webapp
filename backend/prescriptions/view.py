from flask import request
from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *


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
