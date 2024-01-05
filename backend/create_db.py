import psycopg2

# Connect to the database cupchain previously created on your local machine, insert your username and password
conn = psycopg2.connect(host="localhost", dbname="cupchain", user="alessio", password="1234", port=5432)

# Open a cursor to perform database operations
cur = conn.cursor()


############## Drop all the tables if they already exist ##############
cur.execute("DROP TABLE IF EXISTS appointment CASCADE;")
cur.execute("DROP TABLE IF EXISTS prescription CASCADE;")
cur.execute("DROP TABLE IF EXISTS is_able_to_do CASCADE;")
cur.execute("DROP TABLE IF EXISTS hospital CASCADE;")
cur.execute("DROP TABLE IF EXISTS medical_exam CASCADE;")
cur.execute("DROP TABLE IF EXISTS doctor CASCADE;")
cur.execute("DROP TABLE IF EXISTS users CASCADE;")
cur.execute("DROP TABLE IF EXISTS patient CASCADE;")
cur.execute("DROP FUNCTION IF EXISTS check_hospital_can_do_medical_exam CASCADE;")
cur.execute("DROP TRIGGER IF EXISTS check_hospital_can_do_medical_exam on appointment CASCADE;")

conn.commit()


############## Create all the tables needed in our database ##############
cur.execute("""CREATE TABLE IF NOT EXISTS patient (
            cf VARCHAR(16) PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            residence VARCHAR(100) NOT NULL
);
""")            

cur.execute("""CREATE TABLE IF NOT EXISTS users (
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
            address VARCHAR(100) NOT NULL
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS medical_exam (
            code VARCHAR(10) PRIMARY KEY,
            name VARCHAR(50) NOT NULL
);
""")

cur.execute("""CREATE TABLE IF NOT EXISTS hospital (
            id INTEGER PRIMARY KEY,
            address VARCHAR(100) NOT NULL,
            name VARCHAR(50) NOT NULL
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
cur.execute("""INSERT INTO patient (cf, name, surname, residence) VALUES
            ('RSSMRA00A01H501A', 'Mario', 'Rossi', 'Via Roma 1, Milano'),
            ('VRDGPP00A01H501A', 'Giuseppe', 'Verdi', 'Via Catullo 32, Roma'),
            ('BNCLRD00A01H501A', 'Alessandro', 'Bianchi', 'Via Verdi 12, Torino');
""")

cur.execute("""INSERT INTO users (username, password, cf) VALUES
            ('mario', '1234', 'RSSMRA00A01H501A'),
            ('giuseppe', '1234', 'VRDGPP00A01H501A'),
            ('alessandro', '1234', 'BNCLRD00A01H501A');
""")

cur.execute("""INSERT INTO doctor (cf, name, surname, address) VALUES
            ('SGNLCA00A01H501A', 'Luca', 'Sognatore', 'Piazza Risorgimento 49, Milano'),
            ('BLLNCA00A01H501A', 'Carlo', 'Bellini', 'Via Egitto 12, Roma'),
            ('FRRRBT00A01H501A', 'Roberto', 'Ferrari', 'Via dei Papaveri 2, Torino');
""")

cur.execute("""INSERT INTO medical_exam (code, name) VALUES
            ('ECG', 'Elettrocardiogramma'),
            ('RX', 'Radiografia'),
            ('VD', 'Visita dermatologica'),
            ('VN', 'Visita neurologica'),
            ('VO', 'Visita oculistica');
""")

cur.execute("""INSERT INTO hospital (id, address, name) VALUES
            (1, 'Via Olgettina 60, Milano', 'Ospedale San Raffaele'),
            (2, 'Largo Agostino Gemelli 8, Roma', 'Policlinico Gemelli'),
            (3, 'Corso Bramante 88, Torino', 'Ospedale Molinette');
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

cur.execute("""INSERT INTO appointment (id_prescription, id_hospital, date) VALUES
            (1, 1, '2024-06-01 10:00:00'),
            (2, 2, '2024-11-21 11:00:00'),
            (3, 3, '2024-03-07 12:00:00'),
            (4, 1, '2024-04-18 18:00:00');
""")

conn.commit()


# Close communication with the database
cur.close()
conn.close()