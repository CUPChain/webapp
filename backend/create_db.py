import psycopg2
from dotenv import load_dotenv
import os

def create_from_scratch():
    """
    This function creates the database from scratch, dropping all the tables if they already exist and creating them again.
    It also inserts some random data in the tables.
    """

    # Load database uri
    load_dotenv()
    config_mode = os.getenv("CONFIG_MODE")
    full_db_url = os.getenv(config_mode.upper() + "_DATABASE_URL")

    # parse main information from the full database uri
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
    cur.execute("DROP TABLE IF EXISTS prescription CASCADE;")
    cur.execute("DROP TABLE IF EXISTS is_able_to_do CASCADE;")
    cur.execute("DROP TABLE IF EXISTS hospital CASCADE;")
    cur.execute("DROP TABLE IF EXISTS medical_exam CASCADE;")
    cur.execute("DROP TABLE IF EXISTS account CASCADE;")
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

    cur.execute("""CREATE TABLE IF NOT EXISTS medical_exam (
                code INTEGER PRIMARY KEY,
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

    cur.execute("""CREATE TABLE IF NOT EXISTS account (
                pkey VARCHAR(42) PRIMARY KEY,
                nonce INTEGER NOT NULL,
                jwt VARCHAR(1000),
                jwt_exp TIMESTAMP,
                cf_patient VARCHAR(16) REFERENCES patient(cf),
                cf_doctor VARCHAR(16) REFERENCES doctor(cf),
                id_hospital INTEGER REFERENCES hospital(id)
    );
    """)

    cur.execute("""CREATE TABLE IF NOT EXISTS is_able_to_do (
                id_hospital INTEGER REFERENCES hospital(id),
                code_medical_examination INTEGER REFERENCES medical_exam(code),
                PRIMARY KEY(id_hospital, code_medical_examination)
    );
    """)

    cur.execute("""CREATE TABLE IF NOT EXISTS prescription (
                id SERIAL PRIMARY KEY,
                cf_doctor VARCHAR(16) REFERENCES doctor(cf),
                cf_patient VARCHAR(16) REFERENCES patient(cf),
                code_medical_examination INTEGER REFERENCES medical_exam(code)
    );
    """)

    cur.execute("""CREATE TABLE IF NOT EXISTS appointment (
                id SERIAL PRIMARY KEY,
                id_hospital INTEGER REFERENCES hospital(id),
                date TIMESTAMP NOT NULL,
                code_medical_examination INTEGER REFERENCES medical_exam(code),
                id_prescription INTEGER REFERENCES prescription(id)
    );
    """)


    # ################# Create some constraints #################
    # on insertion of a new appointment, we want to enforce that the hospital is able to do the medical examination contained in the prescription
    # and that the appointment is appropriate for the prescription
    cur.execute("""CREATE FUNCTION check_hospital_can_do_medical_exam()
                RETURNS TRIGGER AS $$
                DECLARE
                    medical_exam_code INTEGER;
                BEGIN
                    IF NEW.id_prescription IS NULL THEN
                        RETURN NEW;
                    END IF; 
                    SELECT code_medical_examination INTO medical_exam_code FROM prescription WHERE id = NEW.id_prescription;
                    IF medical_exam_code <> NEW.code_medical_examination THEN
                        RAISE EXCEPTION 'Medical examination code in prescription and in appointment are different';
                    END IF;
                    IF (SELECT COUNT(*) FROM is_able_to_do WHERE id_hospital = NEW.id_hospital AND code_medical_examination = medical_exam_code) = 0 THEN
                        RAISE EXCEPTION 'Hospital is not able to do this medical examination';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
    """)

    cur.execute("""CREATE TRIGGER check_hospital_can_do_medical_exam
                BEFORE INSERT OR UPDATE ON appointment
                FOR EACH ROW
                EXECUTE PROCEDURE check_hospital_can_do_medical_exam();
    """)


    ################# Insert some random data in the tables #################
    cur.execute("""INSERT INTO patient (cf, name, surname, address, cap, city, latitude, longitude) VALUES
                ('RSSMRA00A01H501A', 'Mario', 'Rossi', 'Via Torino 1', '20123',  'Milano', 45.463512, 9.188044),
                ('VRDGPP00A01H501A', 'Giuseppe', 'Verdi', 'Via Terenzio 31', '00193', 'Roma', 41.906114, 12.463239),
                ('BNCLRD00A01H501A', 'Alessandro', 'Bianchi', 'Via Giuseppe Verdi 12', '10124', 'Torino', 45.069133, 7.690493);
    """)

    cur.execute("""INSERT INTO doctor (cf, name, surname, address, cap, city, latitude, longitude) VALUES
                ('SGNLCA00A01H501A', 'Luca', 'Sognatore', 'Piazza Risorgimento 49', '20129', 'Milano', 45.468023, 9.211227),
                ('BLLNCA00A01H501A', 'Carlo', 'Bellini', 'Via degli Olimpionici 12', '00196', 'Roma', 41.934302, 12.468421),
                ('FRRRBT00A01H501A', 'Roberto', 'Ferrari', 'Via Evangelista Torricelli 3', '10128', 'Torino', 45.053066, 7.663516);
    """)

    cur.execute("""INSERT INTO medical_exam (code, name) VALUES
                (1, 'Elettrocardiogramma'),
                (2, 'Radiografia'),
                (3, 'Visita dermatologica'),
                (4, 'Visita neurologica'),
                (5, 'Visita oculistica');
    """)

    cur.execute("""INSERT INTO hospital (id, name, address, cap, city, latitude, longitude) VALUES
                (1, 'Ospedale San Raffaele', 'Via Olgettina 60', '20132', 'Milano', 45.505659, 9.263943),
                (2, 'Policlinico Gemelli', 'Largo Agostino Gemelli 8', '00168', 'Roma', 41.932443, 12.429196),
                (3, 'Ospedale Molinette', 'Corso Bramante 88', '10126', 'Torino', 45.041498, 7.674276);
    """)

    cur.execute("""INSERT INTO account (pkey, nonce, jwt, jwt_exp, cf_patient, cf_doctor, id_hospital) VALUES
                ('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', (RANDOM()*1000)::int, NULL, NULL, 'RSSMRA00A01H501A', NULL, NULL),
                ('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', (RANDOM()*1000)::int, NULL, NULL, 'VRDGPP00A01H501A', NULL, NULL),
                ('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', (RANDOM()*1000)::int, NULL, NULL, 'BNCLRD00A01H501A', NULL, NULL),
                ('0x90F79bf6EB2c4f870365E785982E1f101E93b906', (RANDOM()*1000)::int, NULL, NULL, NULL, 'SGNLCA00A01H501A', NULL),
                ('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', (RANDOM()*1000)::int, NULL, NULL, NULL, 'BLLNCA00A01H501A', NULL),
                ('0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', (RANDOM()*1000)::int, NULL, NULL, NULL, 'FRRRBT00A01H501A', NULL),
                ('0x976EA74026E726554dB657fA54763abd0C3a0aa9', (RANDOM()*1000)::int, NULL, NULL, NULL, NULL, 1),
                ('0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', (RANDOM()*1000)::int, NULL, NULL, NULL, NULL, 2),
                ('0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', (RANDOM()*1000)::int, NULL, NULL, NULL, NULL, 3);
    """)

    cur.execute("""INSERT INTO is_able_to_do (id_hospital, code_medical_examination) VALUES
                (1, 1),
                (1, 2),
                (1, 3),
                (2, 1),
                (2, 2),
                (2, 4),
                (3, 1),
                (3, 4),
                (3, 5);
    """)


    conn.commit()


    # Close communication with the database
    cur.close()
    conn.close()

    print("Database created successfully")


if __name__ == "__main__":
    create_from_scratch()