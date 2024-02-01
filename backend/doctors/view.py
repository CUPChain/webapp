from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *


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
