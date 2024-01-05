from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from dotenv import load_dotenv
import os

# load environment variables
load_dotenv()
DB_URL = os.getenv("DB_URL")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")  # this is not  a good practice try to avoid it!

app = Flask(__name__)
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_URL}:{DB_PORT}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Appointment(db.Model):
    __tablename__ = "appointment"
    id_prescription = db.Column(
        db.Integer, db.ForeignKey("prescription.id"), primary_key=True
    )
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"))
    date = db.Column(db.DateTime, nullable=False)  # pay attention here, need attention

    # validate that this is correct since the dates can be interpreted weirdly from db to python to json and viceversa
    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Doctor(db.Model):
    __tablename__ = "doctor"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Hospital(db.Model):
    __tablename__ = "hospital"
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(50), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class IsAbleToDo(db.Model):
    __tablename__ = "is_able_to_do"
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"), primary_key=True)
    code_medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.code"), primary_key=True
    )

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    code = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Patient(db.Model):
    __tablename__ = "patient"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    surname = db.Column(db.String(50), nullable=False)
    residence = db.Column(db.String(100), nullable=False)

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


class Prescription(db.Model):
    __tablename__ = "prescription"
    id = db.Column(db.Integer, primary_key=True)
    cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    cf_patient = db.Column(db.String(16), db.ForeignKey("patient.cf"))
    code_medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.code")
    )

    def toDict(self):
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}


# REST API routes for CRUD operations
@app.route("/api/v1/appointments", methods=["GET"])
def get_appointments():
    result = db.session.execute(db.select(Appointment))
    appointments_list = [appointment[0].toDict() for appointment in result]
    return jsonify({"appointments": appointments_list})


@app.route("/api/v1/appointments/<id_prescription>", methods=["GET"])
def get_appointment(id_prescription):
    appointment = db.session.execute(
        db.select(Appointment).filter_by(id_prescription=id_prescription),
    ).one_or_none()
    # appointment = db.one_or_404(
    #     db.select(Appointment).filter_by(id_prescription=id_prescription),
    #     description=f"No appointments associated with the id of the prescription: '{id_prescription}'.",
    # )

    if appointment:
        return jsonify({"appointment": appointment[0].toDict()})
    else:
        return (
            jsonify(
                {
                    "message": f"No appointments associated with the id of the prescription: '{id_prescription}'"
                }
            ),
            404,
        )


@app.route("/api/v1/doctors", methods=["GET"])
def get_doctors():
    result = db.session.execute(db.select(Doctor))
    doctors_list = [doctor[0].toDict() for doctor in result]
    return jsonify({"doctors": doctors_list})


@app.route("/api/v1/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    doctor = db.session.execute(db.select(Doctor).filter_by(cf=cf)).one_or_none()
    if doctor:
        return jsonify({"doctor": doctor[0].toDict()})
    else:
        return jsonify({"message": f"No Doctor found with cf: '{cf}'"}), 404


@app.route("/api/v1/hospitals", methods=["GET"])
def get_hospitals():
    result = db.session.execute(db.select(Hospital))
    hospitals_list = [hospital[0].toDict() for hospital in result]
    return jsonify({"hospitals": hospitals_list})


@app.route("/api/v1/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    hospital = db.session.execute(
        db.select(Hospital).filter_by(id=id_hospital)
    ).one_or_none()
    if hospital:
        return jsonify({"hospital": hospital[0].toDict()})
    else:
        return jsonify({"message": "Hospital not found"}), 404


@app.route("/api/v1/is_able_to_do", methods=["GET"])
def get_is_able_to_do():
    result = db.session.execute(db.select(IsAbleToDo))
    is_able_to_do_list = [is_able_to_do[0].toDict() for is_able_to_do in result]
    return jsonify({"is_able_to_do": is_able_to_do_list})


@app.route("/api/v1/hospital_is_able_to_do/<id_is_able_to_do>", methods=["GET"])
def get_hospital_is_able_to_do(id_is_able_to_do):
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


@app.route("/api/v1/is_able_to_do_code/<code>", methods=["GET"])
def get_is_able_to_do_code(code):
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


@app.route("/api/v1/medical_exams", methods=["GET"])
def get_medical_exams():
    result = db.session.execute(db.select(MedicalExam))
    medical_exams_list = [medical_exam[0].toDict() for medical_exam in result]
    return jsonify({"medical_exams": medical_exams_list})


@app.route("/api/v1/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    medical_exam = db.session.execute(
        db.select(MedicalExam).filter_by(code=code)
    ).one_or_none()
    if medical_exam:
        return jsonify({"medical_exam": medical_exam[0].toDict()})
    else:
        return jsonify({"message": f"No Medical exams found with code: '{code}'"}), 404


@app.route("/api/v1/patients", methods=["GET"])
def get_patients():
    result = db.session.execute(db.select(Patient))
    patients_list = [patient[0].toDict() for patient in result]
    return jsonify({"patients": patients_list})


@app.route("/api/v1/patients/<cf>", methods=["GET"])
def get_patient(cf):
    patient = db.session.execute(db.select(Patient).filter_by(cf=cf)).one_or_none()
    if patient:
        return jsonify({"patient": patient[0].toDict()})
    else:
        return jsonify({"message": f"No Patient found with cf: '{cf}'"}), 404


@app.route("/api/v1/prescriptions", methods=["GET"])
def get_prescriptions():
    result = db.session.execute(db.select(Prescription))
    prescriptions_list = [prescription[0].toDict() for prescription in result]
    return jsonify({"prescriptions": prescriptions_list})


@app.route("/api/v1/prescriptions/<id>", methods=["GET"])
def get_prescription(id):
    prescription = db.session.execute(
        db.select(Prescription).filter_by(id=id)
    ).one_or_none()
    if prescription:
        return jsonify({"prescription": prescription[0].toDict()})
    else:
        return jsonify({"message": f"No Prescription found with id: '{id}'"}), 404


@app.route("/api/v1/prescriptions_by_patient/<cf>", methods=["GET"])
def get_prescription_by_patient(cf):
    prescriptions = db.session.execute(
        db.select(Prescription).where(Prescription.cf_patient == cf)
    )
    if prescriptions:
        return jsonify(
            {
                "prescription": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify({"message": "No Prescriptions found for patinet: '{cf}'"}),
            404,
        )  # not reachable since output an empty list


@app.route("/api/v1/prescriptions_by_doctor/<cf>", methods=["GET"])
def get_prescription_by_doctor(cf):
    prescriptions = db.session.execute(
        db.select(Prescription).where(Prescription.cf_doctor == cf)
    )
    if prescriptions:
        return jsonify(
            {
                "prescription": [
                    prescription[0].toDict() for prescription in prescriptions
                ]
            }
        )
    else:
        return (
            jsonify({"message": "No Prescriptions found for doctor: '{cf}'"}),
            404,
        )  # not reachable since output an empty list


if __name__ == "__main__":
    app.run(debug=True)
