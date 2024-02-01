from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *


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
