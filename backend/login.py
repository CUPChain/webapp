from flask import request

from .app import app
from .controller import *
from web3.auto import w3
from eth_account.messages import encode_defunct

# REST API routes for CRUD operations


@app.route("/api/v1/challenge/<address>", methods=["GET"])
def get_challenge(address):
    """
    Client sends the address to the server.
    Server loads the nonce from the database corresponding to the address and sends it to the client.
    """
    nonce = get_nonce(address)
    if nonce:
        return jsonify({"nonce": nonce})
    else:
        return (
            jsonify(
                {
                    "error": f"No nonce associated with the address: '{address}'.",
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
    address = request.json.get("address")

    # Get nonce from database
    nonce = get_nonce(address)
    if nonce == None:
        return (
            jsonify(
                {
                    "error": f"The specified address: '{address}' is not enrolled.",
                    "nonce": None,
                }
            ),
            404,
        )

    # Verify the signature and the address
    message = encode_defunct(text=nonce)
    signed_address = w3.eth.account.recover_message(
        message, signature=signed_nonce
    ).lower()

    if signed_address == address.lower():
        # Generate JWT token
        token = create_jwt_token(address)

        # Return the token
        return jsonify({
            "token": token
        })
