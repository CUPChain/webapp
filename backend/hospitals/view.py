from flask import request
from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *
from ..auth import get_account


@app.route(
    f"/{BASE_ROOT}/{VERSION}/hospitals",
    methods=["GET"]
    # Auth not required for this endpoint
)
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


@app.route(
    f"/{BASE_ROOT}/{VERSION}/hospitals/<id_hospital>",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_hospital(id_hospital):
    """
    Retrieve hospital details by ID
    ---
    tags:
      - Hospitals
    parameters:
      - name: id_hospital
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Hospital details retrieved successfully
    """
    hospital = retrieve_hospital(id_hospital)
    if hospital:
        return jsonify(hospital.toDict())
    else:
        return jsonify({"message": "Hospital not found"}), 404


@app.route(
    f"/{BASE_ROOT}/{VERSION}/hospital_is_able_to_do/<id_is_able_to_do>",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_hospital_is_able_to_do(id_is_able_to_do):
    """
    Retrieve hospital's ability details by ID
    ---
    tags:
      - Hospital Abilities
    parameters:
      - name: id_is_able_to_do
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Hospital's ability details retrieved successfully
    """
    return retrieve_all_hospital_is_able_to_do(id_is_able_to_do)

@app.route(
    f"/{BASE_ROOT}/{VERSION}/am_able_to_do",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_am_able_to_do():
    """
    Retrieve the caller's ability details by ID
    ---
    tags:
      - Hospital Abilities
    responses:
      200:
        description: Hospital's ability details retrieved successfully
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
    return retrieve_all_hospital_is_able_to_do(account.id_hospital)


@app.route(
    f"/{BASE_ROOT}/{VERSION}/is_able_to_do",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_is_able_to_do():
    """
    Retrieve all abilities
    ---
    tags:
      - Hospital Abilities
    responses:
      200:
        description: A list of abilities
    """
    return list_all_is_able_to_do()


@app.route(
    f"/{BASE_ROOT}/{VERSION}/is_able_to_do_code/<code>",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_is_able_to_do_code(code):
    """
    Retrieve ability details by code
    ---
    tags:
      - Hospital Abilities
    parameters:
      - name: code
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Ability details retrieved successfully
    """
    return retrieve_all_is_able_to_do_code(code)
