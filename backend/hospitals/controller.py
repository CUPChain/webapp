from flask import jsonify
from .. import db
from .model import *


def list_all_hospitals():
    """
    Retrieve a list of all hospitals from the database.

    Returns:
        A JSON response containing a list of hospitals.
    """
    result = db.session.execute(db.select(Hospital))
    hospitals_list = [hospital[0].toDict() for hospital in result]
    return jsonify({"hospitals": hospitals_list})


def retrieve_hospital(id_hospital: int) -> Hospital:
    """
    Retrieve a hospital by its ID.

    Args:
        id_hospital (int): The ID of the hospital.

    Returns:
        Hospital: The hospital with the given ID.
    """
    hospital = db.session.execute(
        db.select(Hospital).filter_by(id=id_hospital)
    ).one_or_none()
    if hospital:
        return hospital[0]
    else:
        return None


def retrieve_all_hospital_is_able_to_do(id_is_able_to_do):
    """
    Retrieve all hospital is able to do based on the given id_is_able_to_do.

    Args:
        id_is_able_to_do (int): The id of the is_able_to_do.

    Returns:
        Flask.Response: The JSON response containing the is_able_to_do data or an error message.

    """
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.id_hospital == id_is_able_to_do)
    )
    if result:
        is_able_to_do_data = [is_able_to_do[0].code_medical_examination for is_able_to_do in result]
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return (
            jsonify({"message": "Is able to do not found"}),
            404,
        )  # impossible to reach since output an empty list


def list_all_is_able_to_do():
    """
    Retrieves a list of all the abilities of hospitals.

    Returns:
        A JSON response containing the list of abilities.
    """
    result = db.session.execute(db.select(IsAbleToDo))
    is_able_to_do_list = [is_able_to_do[0].toDict() for is_able_to_do in result]
    return jsonify({"is_able_to_do": is_able_to_do_list})


def retrieve_all_is_able_to_do_code(code):
    """
    Retrieve all the data for a given medical examination code.

    Args:
        code (str): The code of the medical examination.

    Returns:
        Response: The JSON response containing the data of the medical examination.
            If the code is found, the response will include the data.
            If the code is not found, the response will include an error message and a 404 status code.
    """
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.code_medical_examination == code)
    )
    if result:
        is_able_to_do_data = [is_able_to_do[0].toDict() for is_able_to_do in result]
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return (
            jsonify({"message": "Is able to do not found"}),
            404,
        )  # impossible to reach since output an empty list
