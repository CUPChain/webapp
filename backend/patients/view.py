from flask import jsonify
from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *
from ..auth import get_account


@app.route(
    f"/{BASE_ROOT}/{VERSION}/patients/<cf>",
    methods=["GET"]
    # Auth required for this endpoint
)
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
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: Patient details retrieved successfully
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Check if the account is a doctor or he requested his own patient details
    if account.cf_doctor == None and account.cf_patient != cf:
        return (
            jsonify({"error": f"Only doctors can retrieve patient details."}),
            403,
        )


    # Check if the doctor is the patient's doctor
    return retrieve_patient(cf)
