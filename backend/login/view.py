from flask import request, jsonify

from backend.auth import get_account
from backend.doctors.controller import retrieve_doctor
from backend.doctors.model import Doctor
from backend.hospitals.controller import retrieve_hospital
from backend.hospitals.model import Hospital
from backend.patients.controller import retrieve_patient
from backend.patients.model import Patient
from ..app import app
from .controller import *
from web3.auto import w3
from eth_account.messages import encode_defunct


# - POST /login_challenge: (richiede address) mandare random number, salvare number+address richiesto da qualche parte
# - POST /login: (richiede address) Implementare jwt, check signature e' corretta, check number era salvato

@app.route(
    "/api/v1/profile",
    methods=["GET"]
    # Auth required for this endpoint
)
def get_profile():
    """
    Retrieve the profile of the account
    ---
    tags:
      - Authentication
    parameters:
      - name: auth
        in: header
        type: string
        required: true
    responses:
      200:
        description: The profile of the account
        content:
          application/json:
            schema:
              type: object
              properties:
                pkey:
                  type: string
                  description: The public key of the account
                role:
                  type: string
                  description: The role of the account
    """
    # Get the account from the JWT token
    account = get_account()
    if account == None:
        return (
            jsonify({"error": f"Login required."}),
            302,
        )

    # Get the role of the account from the database
    role = get_role_account(account.pkey)

    # Return usefull information
    if role == "patient":
        patient: Patient = retrieve_patient(account.cf_patient)
        return jsonify({
            "name": patient.name,
            "surname": patient.surname,
            "address": patient.address,
            "city": patient.city,
            "cap": patient.cap
        })
    elif role == "doctor":
        doctor: Doctor = retrieve_doctor(account.cf_doctor)
        return jsonify({
            "name": doctor.name,
            "surname": doctor.surname,
            "address": doctor.address,
            "city": doctor.city,
            "cap": doctor.cap
        })
    elif role == "hospital":
        hospital: Hospital = retrieve_hospital(account.id_hospital)
        return jsonify({
            "name": hospital.name,
            "address": hospital.address,
            "city": hospital.city,
            "cap": hospital.cap
        })
    else:
        return jsonify({
            "error": f"No role for account {account}",
            "nonce": None
        }, 500)


@app.route(
    "/api/v1/challenge/<pkey>",
    methods=["GET"]
    # Auth not required for this endpoint
)
def get_challenge(pkey: str):
    """
    Client sends the address to the server.
    Server loads the nonce from the database corresponding to the address and sends it to the client.
    ---
    tags:
      - Authentication
    parameters:
      - name: pkey
        in: path
        type: string
        required: true
        description: The public key of the account

    responses:
      200:
        description: The nonce associated with the address
        content:
          application/json:
            schema:
              type: object
              properties:
                nonce:
                  type: string
                  description: The nonce associated with the address
    """
    nonce = get_nonce(pkey)
    if nonce:
        return jsonify({"nonce": nonce})
    else:
        return (
            jsonify(
                {
                    "error": f"No nonce associated with the address: '{pkey}'.",
                    "nonce": None,
                }
            ),
            404,
        )


@app.route(
    "/api/v1/login",
    methods=["POST"]
    # Auth not required for this endpoint
)
def login():
    """
    Client sends the signed nonce and the address to the server.
    Server verifies the signature and the address.
    ---
    tags:
      - Authentication
    requestBody:
        content:
            application/json:
            schema:
                type: object
                properties:
                signature:
                    type: string
                    description: The signed nonce
                pkey:
                    type: string
                    description: The public key of the account
    responses:
        200:
            description: The JWT token and the role of the account
            content:
            application/json:
                schema:
                type: object
                properties:
                    token:
                    type: string
                    description: The JWT token
                    role:
                    type: string
                    description: The role of the account
        404:
            description: The signature verification failed
            content:
            application/json:
                schema:
                type: object
                properties:
                    error:
                    type: string
                    description: The error message
                    nonce:
                    type: string
                    description: The nonce associated with the address
    """
    # Get the signed nonce and the address from the request body
    signed_nonce = request.json.get("signature")
    pkey = request.json.get("pkey")

    # Get nonce from database
    nonce = get_nonce(pkey)
    if nonce == None:
        return (
            jsonify(
                {
                    "error": f"The specified address: '{pkey}' is not enrolled.",
                    "nonce": None,
                }
            ),
            404,
        )

    # Verify the signature and the address
    message = encode_defunct(text=str(nonce))
    signed_address = w3.eth.account.recover_message(
        message, signature=signed_nonce
    ).lower()

    if signed_address == pkey.lower():
        # Generate JWT token
        auth = create_jwt_token(pkey)

        # Get the role of the account from the database
        role = get_role_account(pkey)

        # Return the auth token and the role
        return jsonify({"auth": auth, "role": role})
    else:
        return (
            jsonify(
                {
                    "error": f"Signature verification failed.",
                    "nonce": None,
                }
            ),
            404,
        )


@app.route(
    "/api/v1/logout",
    methods=["GET"]
    # Auth not required for this endpoint
)
def logout():
    """
    Client tell the server to delete the JWT token associated with my session.
    ---
    tags:
      - Authentication
    parameters:
      - name: auth
        in: header
        type: string
        required: true
    responses:
        200:
            description: The logout was successful
            content:
            application/json:
                schema:
                type: object
                properties:
                    message:
                    type: string
                    description: The message
        404:
            description: The logout failed
            content:
            application/json:
                schema:
                type: object
                properties:
                    error:
                    type: string
                    description: The error message
    """
    # Get the JWT token from the request header
    jwt = request.headers.get("auth")

    try:
        # Delete the JWT token from the database
        delete_jwt_token(jwt)
        return jsonify({"message": "Logout successful."})
    except:
        # If the JWT token is not in the database, return an error
        return (
            jsonify(
                {
                    "error": f"Logout failed.",
                }
            ),
            404,
        )
