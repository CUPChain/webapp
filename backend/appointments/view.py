from flask import request, jsonify
from ..app import app
from ..config import BASE_ROOT, VERSION
from .controller import *
from .model import *
from ..auth import get_account
from ..prescriptions.model import Prescription


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments",
    methods=["GET"],
    # Auth not required for this endpoint
)
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
    category = request.args.get("category")
    date = request.args.get("date")
    return list_all_appointments(category, date)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/<id>",
    methods=["GET"],
    # Auth not required for this endpoint
)
def get_appointment(id):
    """
    Retrieve appointment details by ID
    ---
    tags:
      - Appointments
    parameters:
      - name: id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Appointment details retrieved successfully
    """

    return retrieve_appointment(id)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/create",
    methods=["POST"],
    # Auth required for this endpoint
)
def make_appointment():
    """
    Create a new appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: code_medical_examination
        in: formData
        type: string
        required: true
      - name: date
        in: formData
        type: string
        required: true
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: Appointment created successfully
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is an hospital
    if account.id_hospital == None:
        return (
            jsonify({"error": f"Account {account.pkey} is not an hospital."}),
            403,
        )

    # Create the appointment
    request_form = request.form.to_dict()
    date = request_form["date"]
    code_medical_examination = request_form["code_medical_examination"]
    return create_appointment(date, code_medical_examination, account.id_hospital)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/reserve/<id_appointment>",
    methods=["POST"],
    # Auth required for this endpoint
)
def reserve_appointment(id_appointment):
    """
    Reserve an appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: id_appointment
        in: path
        type: string
        required: true
      - name: id_prescription
        in: formData
        type: string
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: Appointment reserved successfully
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is owner of the prescription
    request_form = request.form.to_dict()
    id_prescription = request_form["id_prescription"]
    prescription = Prescription.query.get(id_prescription)
    if prescription.cf_patient != account.cf_patient:
        return (
            jsonify(
                {
                    "error": f"Account {account.cf_patient} is not owner of the prescription {id_prescription}."
                }
            ),
            403,
        )

    # Book the appointment
    return book_appointment(id_prescription, id_appointment)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/cancel/<int:id_appointment>",
    methods=["POST"],
    # Auth required for this endpoint
)
def cancel_appointment(id_appointment):
    """
    Cancel an appointment
    ---
    tags:
      - Appointments
    parameters:
      - name: id_appointment
        in: path
        type: string
        required: true
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: Appointment cancelled successfully
      302:
        description: Login required
      403:
        description: Forbidden, not owwner of the prescription
      405:
        description: Method Not Allowed
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is owner of the prescription
    prescription: Prescription = Prescription.query.filter_by(
        id=Appointment.query.filter_by(id=id_appointment).first().id_prescription
    ).first()
    if prescription.cf_patient != account.cf_patient:
        return (
            jsonify(
                {
                    "error": f"Account {account.pkey} is not owner of the prescription {prescription.id}."
                }
            ),
            403,
        )

    # Cancel the appointment
    return cancel_booked_appointment(id_appointment)
