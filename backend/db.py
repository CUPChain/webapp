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
    CF = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    residence = db.Column(db.String(100))


class Prescription(db.Model):
    __tablename__ = "prescription"
    ID = db.Column(db.Integer, primary_key=True)
    CF_Patient = db.Column(db.String(10), db.ForeignKey("patient.CF"))
    Code_Medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.Code")
    )


class Patient(db.Model):
    __tablename__ = "patient"
    CF = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    residence = db.Column(db.String(100))


class MedicalExam(db.Model):
    __tablename__ = "medical_exam"
    Code = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(50))


class Appointment(db.Model):
    __tablename__ = "appointment"
    ID_prescription = db.Column(
        db.Integer, db.ForeignKey("prescription.ID"), primary_key=True
    )
    ID_hospital = db.Column(db.Integer, db.ForeignKey("hospital.ID"), primary_key=True)


class Hospital(db.Model):
    __tablename__ = "hospital"
    ID = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(100))
    name = db.Column(db.String(50))


class IsAbleToDo(db.Model):
    __tablename__ = "is_able_to_do"
    ID_hospital = db.Column(db.Integer, db.ForeignKey("hospital.ID"), primary_key=True)
    Code_medical_examination = db.Column(
        db.String(10), db.ForeignKey("medical_exam.Code"), primary_key=True
    )


# REST API routes for CRUD operations
# Example routes for Doctor table
@app.route("/doctors", methods=["GET"])
def get_doctors():
    doctors = Doctor.query.all()
    doctors_list = [
        {
            "CF": doctor.CF,
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
            "CF": doctor.CF,
            "name": doctor.name,
            "surname": doctor.surname,
            "residence": doctor.residence,
        }
        return jsonify({"doctor": doctor_data})
    else:
        return jsonify({"message": "Doctor not found"}), 404


# Similar routes can be created for other tables (Prescription, Patient, MedicalExam, Appointment, Hospital, IsAbleToDo)

if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
