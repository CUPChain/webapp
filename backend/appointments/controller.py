from flask import jsonify
import datetime

from backend.hospitals.model import Hospital

from .. import db
from .model import *
from ..hospitals.model import Hospital


def list_all_appointments(category=None, date=None):
    """
    Retrieve a list of all available appointments based on the given category and date.

    Args:
        category (str): The category of the medical examination.
        date (datetime): The date from which to retrieve the appointments.

    Returns:
        dict: A JSON response containing the list of appointments.

    """
    now = datetime.datetime.now()
    if not date or date < now:
        date = now

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
    else:
        result = db.session.execute(
            db.select(Appointment)
            .where(Appointment.date >= date)
            .where(Appointment.id_prescription == None)
        )
    # else:
    #     result = db.session.execute(
    #         db.select(Appointment)
    #         .where(Appointment.date >= now)
    #         .where(Appointment.id_prescription == None)
    #     )
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
                    "message": f"No appointments associated with the id of the appointment: '{id}'"
                }
            ),
            404,
        )


def create_appointment(date: datetime, code_medical_examination: int, id_hospital: int):
    """
    Create a new appointment.

    Args:
        date: The date and time of the appointment
        code_medical_examination: the type of medical examination asociated to the appointment
        id_hospital (int): The ID of the hospital.

    Returns:
        dict: The response containing the details of the created appointment.
    """
    new_appointment = Appointment(
        id_hospital=int(id_hospital),
        date=date,
        code_medical_examination=int(code_medical_examination),
    )

    db.session.add(new_appointment)
    db.session.commit()

    response = Appointment.query.get(new_appointment.id).toDict()
    return jsonify(response)


def book_appointment(id_prescription, id_appointment):
    """
    Books an appointment by associating it with a prescription.

    Args:
        id_prescription (int): The ID of the prescription to associate with the appointment.
        id_appointment (int): The ID of the appointment to book.

    Returns:
        tuple: A tuple containing the JSON response and the HTTP status code.
            The JSON response contains the appointment details if the booking is successful,
            otherwise it contains an error message.
    """
    available_appointment = Appointment.query.filter_by(id=id_appointment).one_or_none()
    if available_appointment == None:
        return (
            jsonify({"error": f"No appointment found with ID '{id_appointment}'."}),
            404,
        )

    if available_appointment.id_prescription != None:
        return (
            jsonify(
                {
                    "error": f"The appointment with ID '{id_appointment}' is already booked."
                }
            ),
            400,
        )
    else:
        available_appointment.id_prescription = int(id_prescription)
        db.session.commit()

        response = Appointment.query.get(id_appointment).toDict()
        return jsonify(response)


def cancel_booked_appointment(id_appointment):
    """
    Cancel a booked appointment by setting the id_prescription to None.

    Args:
        id_appointment (int): The ID of the appointment.

    Returns:
        dict: A JSON response containing the details of the cancelled appointment.
    """
    appointment = Appointment.query.filter_by(id=id_appointment).one_or_none()
    if appointment == None:
        return (
            jsonify({"error": f"No appointment found with ID '{id_appointment}'."}),
            404,
        )

    if appointment.id_prescription == None:
        return (
            jsonify(
                {
                    "error": f"The appointment with ID '{id_appointment}' is not booked."
                }
            ),
            400,
        )
    else:
        appointment.id_prescription = None
        db.session.commit()

        response = Appointment.query.get(id_appointment).toDict()
        return jsonify(response)
