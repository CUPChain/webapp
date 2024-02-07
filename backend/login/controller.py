import datetime
import jwt
import random
import os
from ..config import NONCE_LIMIT
from .. import db
from .model import Account


def get_nonce(pkey: str) -> str:
    """
    Get the nonce from the database corresponding to the address and sends it to the client.

    Args:
        pkey (str): The address of the account.

    Returns:
        str: The nonce of the account.
    """
    # Get nonce from database
    nonce = db.session.execute(
        db.select(Account).filter_by(pkey=pkey)).one_or_none()
    if nonce:
        return nonce[0].nonce
    else:
        return None


def create_jwt_token(pkey: str) -> str:
    """
    Create JWT token for the address and store it in the database.
    Also, update the nonce of the account.

    Args:
        pkey (str): The address of the account.

    Returns:
        str: The JWT token.
    """
    # Generate JWT token
    exp_date = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    token = jwt.encode(
        payload={"pkey": pkey, "exp": exp_date}, key=os.getenv("JWT_SECRET_KEY"))
    # Update the nonce of the account
    db.session.execute(
        db.update(Account)
        .where(Account.pkey == pkey)
        .values(nonce=random.randint(0, NONCE_LIMIT), jwt=token)
    )
    db.session.commit()
    return token


def get_role_account(pkey: str) -> str:
    """
    Get the role of the account from the database corresponding to the address.

    Args:
        pkey (str): The address of the account.

    Returns:
        str: The role of the account. It can be "hospital", "doctor", "patient" or "".
    """
    # Get account from database
    account = db.session.execute(
        db.select(Account).filter_by(pkey=pkey)).one_or_none()
    
    # If account is None, then return empty string
    if not account:
        return ""
    else:
        # If has id_hospital, then is a hospital
        if account[0].id_hospital:
            return "hospital"
        # If has cf_doctor, then is a doctor
        elif account[0].cf_doctor:
            return "doctor"
        # If has cf_patient, then is a patient
        elif account[0].cf_patient:
            return "patient"
        else:
            return ""


def delete_jwt_token(jwt: str):
    """
    Delete the JWT token from the database.

    Args:
        jwt (str): The JWT token to delete.
    """
    # Delete JWT token from database
    db.session.execute(
        db.update(Account)
        .where(Account.jwt == jwt)
        .values(jwt=None)
    )
    db.session.commit()