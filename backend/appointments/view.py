from flask import request, jsonify
from ..app import app
from ..config import BASE_ROOT, VERSION
from .controller import *
from .model import *
from ..auth import get_account
from ..prescriptions.model import Prescription


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments",
    methods=["GET"]
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
    # here I can manage GET PUT etc...
    # - /available_appointments?categoria&data: (categoria, data > today, id_prescription=null) [TODO: filter for category and data]
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
    methods=["POST"]
    # Auth required for this endpoint
)
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
      - name: date
        in: formData
        type: datetime
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
    return create_appointment(request_form, account.id_hospital)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/reserve/<id_prescription>",
    methods=["POST"]
    # Auth required for this endpoint
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
      - name: date
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
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is owner of the prescription
    prescription = Prescription.query.filter_by(id=id_prescription).first()
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
    request_form = request.form.to_dict()
    return book_appointment(id_prescription, request_form)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/appointments/cancel/<id_prescription>",
    methods=["POST"]
    # Auth required for this endpoint
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
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: Appointment cancelled successfully
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
        id=id_prescription).first()
    if prescription.cf_patient != account.cf_patient:
        return (
            jsonify(
                {
                    "error": f"Account {account.cf_patient} is not owner of the prescription {id_prescription}."
                }
            ),
            403,
        )

    # Cancel the appointment
    return cancel_booked_appointment(id_prescription)
