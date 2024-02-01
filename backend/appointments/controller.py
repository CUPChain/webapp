from flask import jsonify
import datetime

from backend.hospitals.model import Hospital

from .. import db
from .model import *
from ..hospitals.model import Hospital


def list_all_appointments(category=None, date=None):
    # - /available_appointments?categoria&data: (categoria, data > today, id_prescription=null) [TODO: filter for category and data]
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
        .join(Appointment, Appointment.id_hospital == Hospital.id)
        .filter(Appointment.id == id)
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


def create_appointment(request_form):
    # - POST /appointments/create: id_ospedale (preso da login), categoria, data, dottore, id_prescription=null. Restituisci id token, creato random, univoco
    # TODO: only authenticated hospital can create an appointment

    new_appointment = Appointment(
        id_hospital=int(request_form["id_hospital"]),
        date=request_form["date"],
        code_medical_examination=request_form["code_medical_examination"],
        # cf_doctor=request_form["cf_doctor"],
    )

    db.session.add(new_appointment)
    db.session.commit()

    response = Appointment.query.get(new_appointment.id).toDict()
    return jsonify(response)


# - PUT /appointments/update/id: aggiorna appointment con id_prescription inviato
def book_appointment(id_prescription, request_form):
    available_appointment = Appointment.query.get(request_form["id"])

    available_appointment.id_prescription = id_prescription
    db.session.commit()

    response = Appointment.query.get(request_form["id"]).toDict()
    return jsonify(response)


def cancel_booked_appointment(id_prescription):
    booked_appointment = Appointment.query.get(id_prescription)
    booked_appointment.id_prescription = (
        None  # TODO: check if this is correct or sqlalchemy.sql.null() is needed
    )
    db.session.commit()

    response = Appointment.query.get(id_prescription).toDict()
    return jsonify(response)
