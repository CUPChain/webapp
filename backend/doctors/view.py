from ..config import BASE_ROOT, VERSION
from ..app import app
from .controller import *


# @app.route(
#     f"/{BASE_ROOT}/{VERSION}/doctors",
#     methods=["GET"]
# )
# def get_doctors():
#     """
#     Retrieve all doctors
#     ---
#     tags:
#       - Doctors
#     responses:
#       200:
#         description: A list of doctors
#     """
#     return list_all_doctors()
