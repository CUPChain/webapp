from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "postgresql://your_username:your_password@localhost/your_database"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# Define your models
class Doctor(db.Model):
    __tablename__ = "doctor"
    cf = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    residence = db.Column(db.String(100))


class Prescription(db.Model):
    __tablename__ = "prescription"
    id = db.Column(db.Integer, primary_key=True)
    cf_Patient = db.Column(db.String(10), db.ForeignKey("patient.cf"))
    code_Medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.code")
    )


class Patient(db.Model):
    __tablename__ = "patient"
    cf = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    residence = db.Column(db.String(100))


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    code = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))


class Appointment(db.Model):
    __tablename__ = "appointment"
    id_prescription = db.Column(
        db.Integer, db.ForeignKey("prescription.id"), primary_key=True
    )
    id_hospital = db.Column(db.Integer, db.ForeignKey("hospital.id"), primary_key=True)


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


# REST API routes for CRUD operations
@app.route("/doctors", methods=["GET"])
def get_doctors():
    doctors = Doctor.query.all()
    doctors_list = [
        {
            "cf": doctor.cf,
            "name": doctor.name,
            "surname": doctor.surname,
            "residence": doctor.residence,
        }
        for doctor in doctors
    ]
    return jsonify({"doctors": doctors_list})


@app.route("/doctors/<cf>", methods=["GET"])
def get_doctor(cf):
    doctor = Doctor.query.get(cf)
    if doctor:
        doctor_data = {
            "cf": doctor.cf,
            "name": doctor.name,
            "surname": doctor.surname,
            "residence": doctor.residence,
        }
        return jsonify({"doctor": doctor_data})
    else:
        return jsonify({"message": "Doctor not found"}), 404


@app.route("/prescriptions", methods=["GET"])
def get_prescription():
    prescriptions = Prescription.query.all()
    prescriptions_list = [
        {
            "id": prescription.id,
            "cf_patient": prescription.cf_Patient,
            "code_medical_examination": prescription.code_Medical_examination,
        }
        for prescription in prescriptions
    ]
    return jsonify({"prescriptions": prescriptions_list})


@app.route("/prescriptions/<id>", methods=["GET"])
def get_prescription(id):
    prescription = Prescription.query.get(id)
    if prescription:
        prescription_data = {
            "id": prescription.id,
            "cf_patient": prescription.cf_Patient,
            "code_medical_examination": prescription.code_Medical_examination,
        }
        return jsonify({"prescription": prescription_data})
    else:
        return jsonify({"message": "Prescription not found"}), 404


@app.route("/patients", methods=["GET"])
def get_patients():
    patients = Patient.query.all()
    patients_list = [
        {
            "cf": patient.cf,
            "name": patient.name,
            "surname": patient.surname,
            "residence": patient.residence,
        }
        for patient in patients
    ]
    return jsonify({"patients": patients_list})


@app.route("/patients/<cf>", methods=["GET"])
def get_patient(cf):
    patient = Patient.query.get(cf)
    if patient:
        patient_data = {
            "cf": patient.cf,
            "name": patient.name,
            "surname": patient.surname,
            "residence": patient.residence,
        }
        return jsonify({"patient": patient_data})
    else:
        return jsonify({"message": "patient not found"}), 404


@app.route("/medical_exams", methods=["GET"])
def get_medical_exams():
    medical_exams = MedicalExam.query.all()
    medical_exams_list = [
        {"code": medical_exam.code, "name": medical_exam.name}
        for medical_exam in medical_exams
    ]
    return jsonify({"medical_exams": medical_exams_list})


@app.route("/medical_exams/<code>", methods=["GET"])
def get_medical_exam(code):
    medical_exam = MedicalExam.query.get(code)
    if medical_exam:
        medical_exam_data = {"code": medical_exam.code, "name": medical_exam.name}
        return jsonify({"medical_exam": medical_exam_data})
    else:
        return jsonify({"message": "medical_exam not found"}), 404


@app.route("/appointments", methods=["GET"])
def get_appointments():
    appointments = Appointment.query.all()
    appointments_list = [
        {
            "id_prescription": appointment.id_prescription,
            "id_ospital": appointment.id_ospital,
        }
        for appointment in appointments
    ]
    return jsonify({"appointments": appointments_list})


@app.route("/appointments/<id_prescription>", methods=["GET"])
def get_appointment(id_prescription):
    appointment = Appointment.query.get(id_prescription)
    if appointment:
        appointment_data = {
            "id_prescription": appointment.id_prescription,
            "id_ospital": appointment.id_ospital,
        }
        return jsonify({"appointment": appointment_data})
    else:
        return jsonify({"message": "appointment not found"}), 404


@app.route("/hospitals", methods=["GET"])
def get_hospitals():
    hospitals = Hospital.query.all()
    hospitals_list = [
        {"id": hospital.id, "address": hospital.address, "name": hospital.name}
        for hospital in hospitals
    ]
    return jsonify({"hospitals": hospitals_list})


@app.route("/hospitals/<id_hospital>", methods=["GET"])
def get_hospital(id_hospital):
    hospital = Hospital.query.get(id_hospital)
    if hospital:
        hospital_data = {
            "id": hospital.id,
            "address": hospital.address,
            "name": hospital.name,
        }
        return jsonify({"hospital": hospital_data})
    else:
        return jsonify({"message": "hospital not found"}), 404


@app.route("/is_able_to_dos", methods=["GET"])
def get_is_able_to_dos():
    is_able_to_dos = IsAbleToDo.query.all()
    is_able_to_dos_list = [
        {
            "id_hospital": is_able_to_do.id_hospital,
            "code_medical_examination": is_able_to_do.code_medical_examination,
        }
        for is_able_to_do in is_able_to_dos
    ]
    return jsonify({"is_able_to_dos": is_able_to_dos_list})


@app.route("/is_able_to_dos/<id_is_able_to_do>", methods=["GET"])
def get_is_able_to_do(id_is_able_to_do):
    is_able_to_do = IsAbleToDo.query.get(id_is_able_to_do)
    if is_able_to_do:
        is_able_to_do_data = {
            "id_hospital": is_able_to_do.id_hospital,
            "code_medical_examination": is_able_to_do.code_medical_examination,
        }
        return jsonify({"is_able_to_do": is_able_to_do_data})
    else:
        return jsonify({"message": "is_able_to_do not found"}), 404


# Similar routes can be created for other tables (Prescription, Patient, MedicalExam, Appointment, Hospital, IsAbleToDo)

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
