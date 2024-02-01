from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams", methods=["GET"])
def get_medical_exams():
    """
    Retrieve all medical exams
    ---
    tags:
      - Medical Exams
    responses:
      200:
        description: A list of medical exams
    """
    return list_all_medical_exams()


@app.route(f"/{BASE_ROOT}/{VERSION}/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    """
    Retrieve medical exam details by code
    ---
    tags:
      - Medical Exams
    parameters:
      - name: code
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Medical exam details retrieved successfully
    """
    return retrieve_medical_exam(code)
