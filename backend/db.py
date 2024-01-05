from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# load environment variables
load_dotenv()
DB_URL = os.getenv("DB_URL")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

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
    date = db.Column(db.DateTime)


class Doctor(db.Model):
    __tablename__ = "doctor"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    address = db.Column(db.String(100))


class Hospital(db.Model):
    __tablename__ = "hospital"
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(100))
    name = db.Column(db.String(50))


class IsAbleToDo(db.Model):
    __tablename__ = "is_able_to_do"
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"), primary_key=True)
    code_medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.code"), primary_key=True
    )


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    code = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))


class Patient(db.Model):
    __tablename__ = "patient"
    cf = db.Column(db.String(16), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    residence = db.Column(db.String(100))


class Prescription(db.Model):
    __tablename__ = "prescription"
    id = db.Column(db.Integer, primary_key=True)
    cf_doctor = db.Column(db.String(16), db.ForeignKey("doctor.cf"))
    cf_patient = db.Column(db.String(16), db.ForeignKey("patient.cf"))
    code_medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.code")
    )


# REST API routes for CRUD operations
@app.route("/api/v1/doctors", methods=["GET"])
def get_doctors():
    result = db.session.execute(db.select(Doctor))
    doctors_list = [
        {
            "cf": doctor.cf,
            "name": doctor.name,
            "surname": doctor.surname,
            "address": doctor.address,
        }
        for doctor in result
    ]
    return jsonify({"doctors": doctors_list})


@app.route("/api/v1/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    result = db.session.execute(db.select(Doctor).where(Doctor.cf == cf))
    doctor = result.fetchone()
    if doctor:
        doctor_data = {
            "cf": doctor.cf,
            "name": doctor.name,
            "surname": doctor.surname,
            "address": doctor.address,
        }
        return jsonify({"doctor": doctor_data})
    else:
        return jsonify({"message": "Doctor not found"}), 404


@app.route("/api/v1/prescriptions", methods=["GET"])
def get_prescriptions():
    result = db.session.execute(db.select(Prescription))
    prescriptions_list = [
        {
            "id": prescription.id,
            "cf_patient": prescription.cf_patient,
            "code_medical_examination": prescription.code_medical_examination,
        }
        for prescription in result
    ]
    return jsonify({"prescriptions": prescriptions_list})


@app.route("/api/v1/prescriptions/<id>", methods=["GET"])
def get_prescription(id):
    result = db.session.execute(db.select(Prescription).where(Prescription.id == id))
    prescription = result.fetchone()
    if prescription:
        prescription_data = {
            "id": prescription.id,
            "cf_patient": prescription.cf_patient,
            "code_medical_examination": prescription.code_medical_examination,
        }
        return jsonify({"prescription": prescription_data})
    else:
        return jsonify({"message": "Prescription not found"}), 404


@app.route("/api/v1/patients", methods=["GET"])
def get_patients():
    result = db.session.execute(db.select(Patient))
    patients_list = [
        {
            "cf": patient.cf,
            "name": patient.name,
            "surname": patient.surname,
            "residence": patient.residence,
        }
        for patient in result
    ]
    return jsonify({"patients": patients_list})


@app.route("/api/v1/patients/<cf>", methods=["GET"])
def get_patient(cf):
    result = db.session.execute(db.select(Patient).where(Patient.cf == cf))
    patient = result.fetchone()
    if patient:
        patient_data = {
            "cf": patient.cf,
            "name": patient.name,
            "surname": patient.surname,
            "residence": patient.residence,
        }
        return jsonify({"patient": patient_data})
    else:
        return jsonify({"message": "Patient not found"}), 404


@app.route("/api/v1/medical_exams", methods=["GET"])
def get_medical_exams():
    result = db.session.execute(db.select(MedicalExam))
    medical_exams_list = [
        {"code": medical_exam.code, "name": medical_exam.name}
        for medical_exam in result
    ]
    return jsonify({"medical_exams": medical_exams_list})


@app.route("/api/v1/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    result = db.session.execute(db.select(MedicalExam).where(MedicalExam.code == code))
    medical_exam = result.fetchone()
    if medical_exam:
        medical_exam_data = {"code": medical_exam.code, "name": medical_exam.name}
        return jsonify({"medical_exam": medical_exam_data})
    else:
        return jsonify({"message": "Medical exam not found"}), 404


@app.route("/api/v1/appointments", methods=["GET"])
def get_appointments():
    result = db.session.execute(db.select(Appointment))
    appointments_list = [
        {
            "id_prescription": appointment.id_prescription,
            "id_hospital": appointment.id_ospital,
        }
        for appointment in result
    ]
    return jsonify({"appointments": appointments_list})


@app.route("/api/v1/appointments/<id_prescription>", methods=["GET"])
def get_appointment(id_prescription):
    result = db.session.execute(
        db.select(Appointment).where(Appointment.id_prescription == id_prescription)
    )
    appointment = result.fetchone()
    if appointment:
        appointment_data = {
            "id_prescription": appointment.id_prescription,
            "id_hospital": appointment.id_ospital,
        }
        return jsonify({"appointment": appointment_data})
    else:
        return jsonify({"message": "Appointment not found"}), 404


@app.route("/api/v1/hospitals", methods=["GET"])
def get_hospitals():
    result = db.session.execute(db.select(Hospital))
    hospitals_list = [
        {"id": hospital.id, "address": hospital.address, "name": hospital.name}
        for hospital in result
    ]
    return jsonify({"hospitals": hospitals_list})


@app.route("/api/v1/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    result = db.session.execute(db.select(Hospital).where(Hospital.id == id_hospital))
    hospital = result.fetchone()
    if hospital:
        hospital_data = {
            "id": hospital.id,
            "address": hospital.address,
            "name": hospital.name,
        }
        return jsonify({"hospital": hospital_data})
    else:
        return jsonify({"message": "Hospital not found"}), 404


@app.route("/api/v1/is_able_to_dos", methods=["GET"])
def get_is_able_to_dos():
    result = db.session.execute(db.select(IsAbleToDo))
    is_able_to_dos_list = [
        {
            "id_hospital": is_able_to_do.id_hospital,
            "code_medical_examination": is_able_to_do.code_medical_examination,
        }
        for is_able_to_do in result
    ]
    return jsonify({"is_able_to_dos": is_able_to_dos_list})


@app.route("/api/v1/is_able_to_dos/<id_is_able_to_do>", methods=["GET"])
def get_is_able_to_do(id_is_able_to_do):
    result = db.session.execute(
        db.select(IsAbleToDo).where(IsAbleToDo.id_hospital == id_is_able_to_do)
    )
    is_able_to_do = result.fetchone()
    if is_able_to_do:
        is_able_to_do_data = {
            "id_hospital": is_able_to_do.id_hospital,
            "code_medical_examination": is_able_to_do.code_medical_examination,
        }
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return jsonify({"message": "Is able to do not found"}), 404


# Similar routes can be created for other tables (Prescription, Patient, MedicalExam, Appointment, Hospital, IsAbleToDo)

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
