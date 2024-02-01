from flask import request
from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *
from ..auth import get_account


@app.route(
    f"/{BASE_ROOT}/{VERSION}/prescriptions",
    methods=["GET"]
    # Auth required for this endpoint
)
def get_prescriptions():
    """
    Retrieve all prescriptions created by the logged in doctor
    or given to the logged in patient
    ---
    tags:
      - Prescriptions
    responses:
      200:
        description: A list of prescriptions
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # If the account is a doctor, retrieve all prescriptions for that doctor
    if account.cf_doctor != None:
        # Retrieve all prescriptions for a doctor
        return retrieve_all_prescriptions_by_doctor(account.cf_doctor)
    # If the account is a patient, retrieve all prescriptions for that patient
    elif account.cf_patient != None:
        # Retrieve all prescriptions for a patient
        return retrieve_all_prescriptions_by_patient(account.cf_patient)
    else:
        return (
            jsonify(
                {"error": f"Only doctors and patients can retrieve prescriptions."}),
            403,
        )


@app.route(
    f"/{BASE_ROOT}/{VERSION}/prescriptions/create",
    methods=["POST"]
    # Auth required for this endpoint
)
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
      - name: pkey_patient
        in: formData
        type: string
        required: true
    responses:
      200:
        description: Prescription created successfully
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is a doctor
    if account.cf_doctor == None:
        return (
            jsonify({"error": f"Only doctors can create prescriptions."}),
            403,
        )

    # Get the request form
    request_form = request.form.to_dict()

    # Check all required fields are present
    if (
        request_form.get("code_medical_examination") == None
        or request_form.get("pkey_patient") == None
    ):
        return (
            jsonify({"message": "Missing required field(s)",
                    "request": request_form}),
            400,
        )

    # Create the prescription
    return create_prescription(request_form, account.cf_doctor)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/prescriptions/<id>",
    methods=["GET", "DELETE"]
    # Auth required for this endpoint
)
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
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is a doctor or if he requested his own prescription
    prescription: Prescription = Prescription.query.get(id)
    if prescription == None:
        # TODO: better to return a different error because we don't want to leak
        return (
            jsonify({"error": f"Prescription not found."}),
            404,
        )

    # Check if the account is a doctor or if he requested his own prescription
    if account.cf_doctor == None and account.cf_patient != prescription.cf_patient:
        return (
            jsonify({"error": f"Not authorized to retrieve this prescription."}),
            403,
        )

    if request.method == "GET":
        return retrieve_prescription(id)
    elif request.method == "DELETE":
        return delete_prescription(id)
    else:
        return (
            jsonify({"message": "Method not allowed"}),
            405,
        )
