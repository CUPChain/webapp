from flask import jsonify
from .. import db
from .model import *


def list_all_medical_exams():
    """
    Retrieve a list of all medical exams from the database.

    Returns:
        A JSON response containing the list of medical exams.
    """
    result = db.session.execute(db.select(MedicalExam))
    medical_exams_list = [medical_exam[0].toDict() for medical_exam in result]
    return jsonify({"medical_exams": medical_exams_list})


def retrieve_medical_exam(code):
    """
    Retrieve a medical exam by its code.

    Args:
        code (str): The code of the medical exam.

    Returns:
        Flask Response: The JSON response containing the medical exam or an error message.
    """
    medical_exam = db.session.execute(
        db.select(MedicalExam).filter_by(code=code)
    ).one_or_none()
    if medical_exam:
        return jsonify({"medical_exam": medical_exam[0].toDict()})
    else:
        return jsonify({"message": f"No Medical exams found with code: '{code}'"}), 404
