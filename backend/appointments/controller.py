from flask import jsonify
import datetime

from backend.hospitals.model import Hospital

from .. import db
from .model import *
from ..hospitals.model import Hospital


def list_all_appointments(category=None, date=None):
    """
    Retrieve a list of all appointments based on the given category and date.

    Args:
        category (str): The category of the medical examination.
        date (datetime): The date from which to retrieve the appointments.

    Returns:
        dict: A JSON response containing the list of appointments.

    """
    now = datetime.datetime.now()

    if category and date:
        result = db.session.execute(
            db.select(Appointment)
            .where(Appointment.date >= date)
            .where(Appointment.code_medical_examination == category)
            .where(Appointment.id_prescription == None)
        )
    elif category:
        result = db.session.execute(
            db.select(Appointment)
            .where(Appointment.code_medical_examination == category)
            .where(Appointment.date >= now)
            .where(Appointment.id_prescription == None)
        )
    elif date:
        result = db.session.execute(
            db.select(Appointment)
            .where(Appointment.date >= date)
            .where(Appointment.id_prescription == None)
        )
    else:
        result = db.session.execute(
            db.select(Appointment)
            .where(Appointment.date >= now)
            .where(Appointment.id_prescription == None)
        )
    appointments_list = [appointment[0].toDict() for appointment in result]
    return jsonify({"appointments": appointments_list})


def retrieve_appointment(id):
    # - /appointments/id: id, ospedale, categoria, id dottore che fa la visita, nome dottore

    appointment = (
        db.session.query(Appointment, Hospital)
        .filter(Appointment.id == id)
        .join(Appointment, Appointment.id_hospital == Hospital.id)
        .one_or_none()
    )
    # .execute(
    #     db.select(Appointment).filter_by(id=id).join(
    #         Hospital, Appointment.id_hospital == Hospital.id),
    # ).one_or_none()
    # appointment = db.one_or_404(
    #     db.select(Appointment).filter_by(id_prescription=id_prescription),
    #     description=f"No appointments associated with the id of the prescription: '{id_prescription}'.",
    # )

    if appointment:
        return jsonify(
            {
                "appointment": appointment[0].toDict(),
                "hospital": appointment[1].toDict(),
            }
        )
    else:
        return (
            jsonify(
                {
                    "message": f"No appointments associated with the id of the prescription: '{id}'"
                }
            ),
            404,
        )


def create_appointment(request_form, id_hospital):
    """
    Create a new appointment.

    Args:
        request_form (dict): The form data containing the appointment details.
        id_hospital (int): The ID of the hospital.

    Returns:
        dict: The response containing the details of the created appointment.
    """
    new_appointment = Appointment(
        id_hospital=int(id_hospital),
        date=request_form["date"],
        code_medical_examination=request_form["code_medical_examination"],
    )

    db.session.add(new_appointment)
    db.session.commit()

    response = Appointment.query.get(new_appointment.id).toDict()
    return jsonify(response)


def book_appointment(id_prescription, request_form):
    """
    Books an appointment by updating the prescription ID of the available appointment.

    Args:
        id_prescription (int): The ID of the prescription.
        request_form (dict): The form data containing the appointment ID.

    Returns:
        dict: The response containing the details of the booked appointment.
    """
    available_appointment = Appointment.query.get(request_form["id"])

    available_appointment.id_prescription = id_prescription
    db.session.commit()

    response = Appointment.query.get(request_form["id"]).toDict()
    return jsonify(response)


def cancel_booked_appointment(id_prescription):
    """
    Cancel a booked appointment by setting the id_prescription to None.

    Args:
        id_prescription (int): The ID of the prescription associated with the appointment.

    Returns:
        dict: A JSON response containing the details of the cancelled appointment.
    """
    booked_appointment = Appointment.query.get(id_prescription)
    booked_appointment.id_prescription = (
        None  # TODO: check if this is correct or sqlalchemy.sql.null() is needed
    )
    db.session.commit()

    response = Appointment.query.get(id_prescription).toDict()
    return jsonify(response)
