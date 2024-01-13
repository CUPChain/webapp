import psycopg2
from dotenv import load_dotenv
import os

# Load database uri
load_dotenv()
config_mode = os.getenv("CONFIG_MODE")
full_db_url = os.getenv(config_mode.upper() + "_DATABASE_URL")

DB_URL = full_db_url.split("@")[1].split(":")[0]
DB_PORT = full_db_url.split(":")[3].split("/")[0]
DB_NAME = full_db_url.split("/")[-1]
DB_USER = full_db_url.split("://")[1].split(":")[0]
DB_PASSWORD = full_db_url.split("@")[0].split(":")[2]

# Connect to the database cupchain previously created, insert your username and password
conn = psycopg2.connect(
    host=DB_URL,
    port=DB_PORT,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
)

# Open a cursor to perform database operations
cur = conn.cursor()


############## Drop all the tables if they already exist ##############
cur.execute("DROP TABLE IF EXISTS appointment CASCADE;")
cur.execute("DROP TABLE IF EXISTS available_appointment CASCADE;")
cur.execute("DROP TABLE IF EXISTS prescription CASCADE;")
cur.execute("DROP TABLE IF EXISTS is_able_to_do CASCADE;")
cur.execute("DROP TABLE IF EXISTS hospital CASCADE;")
cur.execute("DROP TABLE IF EXISTS medical_exam CASCADE;")
cur.execute("DROP TABLE IF EXISTS user_patient CASCADE;")
cur.execute("DROP TABLE IF EXISTS user_doctor CASCADE;")
cur.execute("DROP TABLE IF EXISTS patient CASCADE;")
cur.execute("DROP TABLE IF EXISTS doctor CASCADE;")
cur.execute("DROP FUNCTION IF EXISTS check_hospital_can_do_medical_exam CASCADE;")
cur.execute("DROP TRIGGER IF EXISTS check_hospital_can_do_medical_exam on appointment CASCADE;")

conn.commit()


############## Create all the tables needed in our database ##############
cur.execute("""CREATE TABLE IF NOT EXISTS patient (
            cf VARCHAR(16) PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            address VARCHAR(100) NOT NULL,
            cap VARCHAR(5) NOT NULL,
            city VARCHAR(50) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL
);
""")            

cur.execute("""CREATE TABLE IF NOT EXISTS user_patient (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(50) NOT NULL,
            cf VARCHAR(16) NOT NULL,
            FOREIGN KEY(cf) REFERENCES patient(cf)
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS doctor (
            cf VARCHAR(16) PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            address VARCHAR(100) NOT NULL,
            cap VARCHAR(5) NOT NULL,
            city VARCHAR(50) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS user_doctor (
            username VARCHAR(50) PRIMARY KEY,
            password VARCHAR(50) NOT NULL,
            cf VARCHAR(16) NOT NULL,
            FOREIGN KEY(cf) REFERENCES doctor(cf)
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS medical_exam (
            code VARCHAR(10) PRIMARY KEY,
            name VARCHAR(50) NOT NULL
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS hospital (
            id INTEGER PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            address VARCHAR(100) NOT NULL,
            cap VARCHAR(5) NOT NULL,
            city VARCHAR(50) NOT NULL,
            latitude FLOAT NOT NULL,
            longitude FLOAT NOT NULL
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS is_able_to_do (
            id_hospital INTEGER REFERENCES hospital(id),
            code_medical_examination VARCHAR(10) REFERENCES medical_exam(code),
            PRIMARY KEY(id_hospital, code_medical_examination)
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS prescription (
            id INTEGER PRIMARY KEY,
            cf_doctor VARCHAR(16) REFERENCES doctor(cf),
            cf_patient VARCHAR(16) REFERENCES patient(cf),
            code_medical_examination VARCHAR(10) REFERENCES medical_exam(code)
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS available_appointment (
            id_hospital INTEGER REFERENCES hospital(id),
            date TIMESTAMP NOT NULL,
            code_medical_examination VARCHAR(10) REFERENCES medical_exam(code),
            PRIMARY KEY(id_hospital, date, code_medical_examination)
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS appointment (
            id_prescription INTEGER REFERENCES prescription(id) PRIMARY KEY,
            id_hospital INTEGER REFERENCES hospital(id),
            date TIMESTAMP NOT NULL
);
""")


################# create some constraints #################
# on insertion of a new appointment, we want to enforce that the hospital is able to do the medical examination contained in the prescription
cur.execute("""CREATE FUNCTION check_hospital_can_do_medical_exam()
            RETURNS TRIGGER AS $$
            DECLARE
                medical_exam_code VARCHAR(10);
            BEGIN
                SELECT code_medical_examination INTO medical_exam_code FROM prescription WHERE id = NEW.id_prescription;
                IF (SELECT COUNT(*) FROM is_able_to_do WHERE id_hospital = NEW.id_hospital AND code_medical_examination = medical_exam_code) = 0 THEN
                    RAISE EXCEPTION 'Hospital is not able to do this medical examination';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
""")

cur.execute("""CREATE TRIGGER check_hospital_can_do_medical_exam
            BEFORE INSERT ON appointment
            FOR EACH ROW
            EXECUTE PROCEDURE check_hospital_can_do_medical_exam();
""")


################# insert some random data in the tables #################
cur.execute("""INSERT INTO patient (cf, name, surname, address, cap, city, latitude, longitude) VALUES
            ('RSSMRA00A01H501A', 'Mario', 'Rossi', 'Via Torino 1', '20123',  'Milano', 45.463512, 9.188044),
            ('VRDGPP00A01H501A', 'Giuseppe', 'Verdi', 'Via Terenzio 31', '00193', 'Roma', 41.906114, 12.463239),
            ('BNCLRD00A01H501A', 'Alessandro', 'Bianchi', 'Via Giuseppe Verdi 12', '10124', 'Torino', 45.069133, 7.690493);
""")

cur.execute("""INSERT INTO user_patient (username, password, cf) VALUES
            ('mario', '1234', 'RSSMRA00A01H501A'),
            ('giuseppe', '1234', 'VRDGPP00A01H501A'),
            ('alessandro', '1234', 'BNCLRD00A01H501A');
""")

cur.execute("""INSERT INTO doctor (cf, name, surname, address, cap, city, latitude, longitude) VALUES
            ('SGNLCA00A01H501A', 'Luca', 'Sognatore', 'Piazza Risorgimento 49', '20129', 'Milano', 45.468023, 9.211227),
            ('BLLNCA00A01H501A', 'Carlo', 'Bellini', 'Via degli Olimpionici 12', '00196', 'Roma', 41.934302, 12.468421),
            ('FRRRBT00A01H501A', 'Roberto', 'Ferrari', 'Via Evangelista Torricelli 3', '10128', 'Torino', 45.053066, 7.663516);
""")

cur.execute("""INSERT INTO user_doctor (username, password, cf) VALUES
            ('luca', '1234', 'SGNLCA00A01H501A'),
            ('carlo', '1234', 'BLLNCA00A01H501A'),
            ('roberto', '1234', 'FRRRBT00A01H501A');
""")

cur.execute("""INSERT INTO medical_exam (code, name) VALUES
            ('ECG', 'Elettrocardiogramma'),
            ('RX', 'Radiografia'),
            ('VD', 'Visita dermatologica'),
            ('VN', 'Visita neurologica'),
            ('VO', 'Visita oculistica');
""")

cur.execute("""INSERT INTO hospital (id, name, address, cap, city, latitude, longitude) VALUES
            (1, 'Ospedale San Raffaele', 'Via Olgettina 60', '20132', 'Milano', 45.505659, 9.263943),
            (2, 'Policlinico Gemelli', 'Largo Agostino Gemelli 8', '00168', 'Roma', 41.932443, 12.429196),
            (3, 'Ospedale Molinette', 'Corso Bramante 88', '10126', 'Torino', 45.041498, 7.674276);
""")

cur.execute("""INSERT INTO is_able_to_do (id_hospital, code_medical_examination) VALUES
            (1, 'ECG'),
            (1, 'RX'),
            (1, 'VD'),
            (2, 'ECG'),
            (2, 'RX'),
            (2, 'VN'),
            (3, 'ECG'),
            (3, 'VN'),
            (3, 'VO');
""")

cur.execute("""INSERT INTO prescription (id, cf_doctor, cf_patient, code_medical_examination) VALUES
            (1, 'SGNLCA00A01H501A', 'RSSMRA00A01H501A', 'ECG'),
            (2, 'BLLNCA00A01H501A', 'VRDGPP00A01H501A', 'RX'),
            (3, 'BLLNCA00A01H501A', 'VRDGPP00A01H501A', 'VN'),
            (4, 'FRRRBT00A01H501A', 'BNCLRD00A01H501A', 'VD'),
            (5, 'FRRRBT00A01H501A', 'BNCLRD00A01H501A', 'VO');
""")

cur.execute("""INSERT INTO available_appointment (id_hospital, date, code_medical_examination) VALUES
            (1, '2024-06-01 10:00:00', 'ECG'),
            (1, '2024-06-01 11:00:00', 'ECG'),
            (1, '2024-06-01 12:00:00', 'ECG'),
            (1, '2024-06-01 13:00:00', 'ECG'),
            (1, '2024-06-02 14:00:00', 'RX'),
            (1, '2024-06-02 15:00:00', 'RX'),
            (1, '2024-06-02 16:00:00', 'RX'),
            (1, '2024-06-02 17:00:00', 'RX'),
            (1, '2024-06-03 16:00:00', 'VD'),
            (1, '2024-06-03 17:00:00', 'VD'),
            (1, '2024-06-03 18:00:00', 'VD'),
            (1, '2024-06-03 19:00:00', 'VD'),
            (2, '2024-05-21 11:00:00', 'RX'),
            (2, '2024-05-21 12:00:00', 'RX'),
            (2, '2024-05-21 13:00:00', 'RX'),
            (2, '2024-05-21 14:00:00', 'RX'),
            (2, '2024-05-22 15:00:00', 'VN'),
            (2, '2024-05-22 16:00:00', 'VN'),
            (2, '2024-05-22 17:00:00', 'VN'),
            (2, '2024-05-22 18:00:00', 'VN'),
            (2, '2024-05-23 16:00:00', 'ECG'),
            (2, '2024-05-23 17:00:00', 'ECG'),
            (2, '2024-05-23 18:00:00', 'ECG'),
            (2, '2024-05-23 19:00:00', 'ECG'),
            (3, '2024-05-07 12:00:00', 'ECG'),
            (3, '2024-05-07 13:00:00', 'ECG'),
            (3, '2024-05-07 14:00:00', 'ECG'),
            (3, '2024-05-07 15:00:00', 'ECG'),
            (3, '2024-05-08 16:00:00', 'VN'),
            (3, '2024-05-08 17:00:00', 'VN'),
            (3, '2024-05-08 18:00:00', 'VN'),
            (3, '2024-05-08 19:00:00', 'VN'),
            (3, '2024-05-09 16:00:00', 'VO'),
            (3, '2024-05-09 17:00:00', 'VO'),
            (3, '2024-05-09 18:00:00', 'VO'),
            (3, '2024-05-09 19:00:00', 'VO');
""")

cur.execute("""INSERT INTO appointment (id_prescription, id_hospital, date) VALUES
            (1, 1, '2024-06-01 9:00:00'),
            (2, 2, '2024-11-21 11:00:00'),
            (3, 3, '2024-03-07 12:00:00'),
            (4, 1, '2024-04-18 18:00:00');
""")

conn.commit()


# Close communication with the database
cur.close()
conn.close()