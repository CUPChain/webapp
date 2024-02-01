from flask import jsonify
from .. import db
from .model import *


def list_all_hospitals():
    result = db.session.execute(db.select(Hospital))
    hospitals_list = [hospital[0].toDict() for hospital in result]
    return jsonify({"hospitals": hospitals_list})


def retrieve_hospital(id_hospital):
    # - /hospitals/id(o address): nome, indirizzo, cap, citta, latlon
    hospital = db.session.execute(
        db.select(Hospital).filter_by(id=id_hospital)
    ).one_or_none()
    if hospital:
        return jsonify({"hospital": hospital[0].toDict()})
    else:
        return jsonify({"message": "Hospital not found"}), 404


def retrieve_all_hospital_is_able_to_do(id_is_able_to_do):
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.id_hospital == id_is_able_to_do)
    )
    if result:
        is_able_to_do_data = [is_able_to_do[0].toDict() for is_able_to_do in result]
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return (
            jsonify({"message": "Is able to do not found"}),
            404,
        )  # impossible to reach since output an empty list


def list_all_is_able_to_do():
    result = db.session.execute(db.select(IsAbleToDo))
    is_able_to_do_list = [is_able_to_do[0].toDict() for is_able_to_do in result]
    return jsonify({"is_able_to_do": is_able_to_do_list})


def retrieve_all_is_able_to_do_code(code):
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
