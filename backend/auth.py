from flask import request
import os
import jwt
from . import db
from .login.model import Account


def validate_jwt_token(token: str) -> bool:
    """
    Validate the JWT token.

    Args:
        token (str): The JWT token.

    Returns:
        bool: True if the token is valid, False otherwise.
    """
    try:
        jwt.decode(token, key=os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
        return True
    except:
        return False


def get_account() -> Account:
    """
    Get the account from the database corresponding to the address.+

    Returns:
        Account: The account.
    """
    # Get the JWT token from the request header
    jwt = request.headers.get("auth")
    if not validate_jwt_token(jwt):
        return None
    
    # Get the account from the database
    account = db.session.execute(db.select(Account).filter_by(jwt=jwt)).one_or_none()
    if account:
        return account[0]
    else:
        return None
