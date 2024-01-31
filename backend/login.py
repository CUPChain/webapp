from flask import request

from .app import app
from .controller import *
from web3.auto import w3
from eth_account.messages import encode_defunct

# REST API routes for CRUD operations


@app.route("/api/v1/challenge/<pkey>", methods=["GET"])
def get_challenge(pkey: str):
    """
    Client sends the address to the server.
    Server loads the nonce from the database corresponding to the address and sends it to the client.
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


@app.route("/api/v1/login", methods=["POST"])
def login():
    """
    Client sends the signed nonce and the address to the server.
    Server verifies the signature and the address.    
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
        token = create_jwt_token(pkey)

        # Return the token
        return jsonify({
            "token": token
        })
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
