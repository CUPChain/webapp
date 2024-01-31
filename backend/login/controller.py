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
        db.select(Account).filter_by(pkey=pkey)
    ).one_or_none()
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
    token = jwt.encode(payload={"pkey": pkey}, key=os.getenv("JWT_SECRET_KEY"))
    # Update the nonce of the account
    db.session.execute(
        db.update(Account)
        .where(Account.pkey == pkey)
        .values(nonce=random.randint(0, NONCE_LIMIT))
    )
    # Insert the JWT token in the database
    db.session.execute(
        db.update(Account)
        .where(Account.pkey == pkey)
        .values(jwt=token, jwt_exp=datetime.datetime.utcnow() + datetime.timedelta(days=1))
    )
    db.session.commit()
    return token
