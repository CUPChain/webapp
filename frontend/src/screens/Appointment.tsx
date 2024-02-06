import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import QRCode from 'react-qr-code';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { AppointmentType, PrescriptionType } from '../types';
import { cancelAppointment, getAppointmentHash, getHospitalInfo, getTokenCategory, isOwned, verifyHash, signString, loginMetamask } from '../utils';
import { BACKEND_URL, Token } from '../constants';
import CardTitleLoad from '../components/CardTitleLoad';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";
import { Spinner } from 'reactstrap';

const MAP_ENABLED = true;
const DEFAULT_QR_VALUE = 'CUPCHAIN';

const Appointment = () => {
    // How do we know what was the id of the prescription that got exchanged for the appointment?
    const id = window.location.pathname.split('/')[2];

    const [appointment, setAppointment] = useState<AppointmentType>({
        id: 0,
        code_medical_examination: 0,
        type: '',
        name: '',
        city: '',
        cap: '',
        address: '',
        date: new Date(),
        id_hospital: 0,
        id_prescription: 0,
        latitude: 0,
        longitude: 0,
        valid: false
    });
    const [prescription, setPrescription] = useState<PrescriptionType>({ id: 0, type: "Invalid" });
    const [loaded, setLoaded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [QRValue, setQRValue] = useState(DEFAULT_QR_VALUE);
    const navigate = useNavigate();

    useEffect(() => {
        const getAppointmentData = async (id: number) => {
            // Check that token is owned by user
            if (!await isOwned(id, Token.Appointment)) {
                // TODO:
                return;
            }

            const hash = await getAppointmentHash(id);

            // Retrieve from backend the additional data
            const response = await fetch(`${BACKEND_URL}/api/v1/appointments/${id}`);
            if (!response.ok) {
                console.log(response.statusText);
                // TODO: error handling
                return;
            }
            const data = await response.json() as { appointment: AppointmentType; };
            const appointment = data.appointment;

            appointment.date = new Date(appointment.date);
            const dataToCheck = {
                id: appointment.id,
                id_hospital: appointment.id_hospital,
                date: appointment.date.toUTCString(),
                category: appointment.code_medical_examination
            };

            await getHospitalInfo(data.appointment);

            // Verify that the appointment is valid
            if (await verifyHash(hash as string, dataToCheck)) {
                setAppointment(data.appointment);
            } else {
                console.log(`ERROR: Token ${id} metadata is not valid`);
            }

            // Get prescription info
            const prescriptionCategory = await getTokenCategory(appointment.id_prescription, Token.Prescription);
            // Get category name from database
            const categoryResponse = await fetch(`${BACKEND_URL}/api/v1/medical_exams/${prescriptionCategory}`);
            if (!categoryResponse.ok) {
                console.log("error:", categoryResponse);
                return;
            }
            const categoryName = await categoryResponse.json()
                .then(data => data.medical_exam.name);

            setPrescription({ id: appointment.id_prescription, type: categoryName });

            // Set loaded to true
            setLoaded(true);
        };

        getAppointmentData(Number.parseInt(id));
    }, [id]);

    const deleteAppointment = async (): Promise<boolean> => {
        try {
            // Exchange tokens
            await cancelAppointment(appointment.id);

            // Book appointment in db
            let formData = new FormData();
            formData.append('id_prescription', prescription.id.toString());

            const response = await fetch(
                `${BACKEND_URL}/api/v1/appointments/cancel/${appointment.id}`,
                {
                    method: 'POST',
                    headers: {
                        auth: localStorage.getItem('auth')!
                    },
                    body: formData
                }
            ).then(response => {
                if (!response.ok) {
                    console.log(response.statusText);
                    // TODO: error handling
                    return;
                }
            });
            return true;
        } catch (error) {
            console.log(error);
        }
        return false;
    };

    const onDeletePress = async () => {
        setIsDeleting(true);
        if (await deleteAppointment()) {
            navigate('/reservations');
        }
        setIsDeleting(false);
    };

    const onModifyPress = async () => {
        setIsChanging(true);
        if (await deleteAppointment()) {
            navigate(`/prescriptions/${prescription.id}/`);
        }
        setIsChanging(false);
    };

    const generateQR = async () => {
        // Sign with metamask the appointment id
        const [, signer] = await loginMetamask();
        const signature = await signString(appointment.id.toString(), signer) as string;
        setQRValue(signature);
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <BackButton />
                <Row>
                    <Col className='col-5'>
                        <Card className='card-bg' teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {prescription.type}
                                </CardTitle>
                                <CardText>
                                    {"Prescription Id:  " + prescription.id}
                                    {"\nAppointment Id:  " + appointment.id}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card className='card-bg' teaser noWrapper style={{ marginBottom: '1rem', overflow: 'hidden' }} >
                            <CardBody>
                                {
                                    MAP_ENABLED && appointment.latitude ?
                                        <MapContainer
                                            center={[appointment.latitude, appointment.longitude]}
                                            zoom={15}
                                            scrollWheelZoom={true}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[appointment.latitude, appointment.longitude]}>
                                                <Popup>
                                                    {appointment.name}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                        :
                                        <CardText>
                                            [MAPPA DISABILITATA]
                                        </CardText>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                    <Col>
                        <Card className='card-bg' teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitleLoad title='Dettagli' loaded={loaded} />
                                <ul>
                                    <li>
                                        <b>Luogo:</b> {appointment.name}
                                    </li>
                                    <li>
                                        <b>Indirizzo:</b> {appointment.address}
                                    </li>
                                    <li>
                                        <b>Data:</b> {appointment.date.toDateString()}
                                    </li>
                                    <li>
                                        <b>Ora:</b> {appointment.date.toUTCString().slice(16)}
                                    </li>
                                </ul>

                                <CardTitle tag='h5'>
                                    Di cosa avrò bisogno?
                                </CardTitle>
                                <ul>
                                    <li>
                                        <b>Documento d'identità</b>
                                    </li>
                                    <li>
                                        <b>Tessera sanitaria</b>
                                    </li>
                                    <li>
                                        <b>QR Code di questa pagina</b>
                                    </li>
                                </ul>

                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '3rem',
                                    marginBottom: '2rem',
                                    position: 'relative',
                                }}>
                                    <QRCode
                                        value={QRValue}
                                        style={{
                                            filter: QRValue === DEFAULT_QR_VALUE ? 'blur(5px)' : ''
                                        }}
                                    />
                                    {
                                        QRValue === DEFAULT_QR_VALUE &&
                                        <Button
                                            color='primary'
                                            onClick={generateQR}
                                            tag='button'
                                            size='lg'
                                            style={{
                                                position: 'absolute',
                                                bottom: '50%',
                                                right: '50%',
                                                transform: 'translate(50%, 50%)'
                                            }}
                                        >
                                            Genera QR code
                                        </Button>
                                    }
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        color={!isDeleting && !isChanging ? 'danger' : 'dark'}
                                        onClick={!isDeleting && !isChanging ? onDeletePress : () => { }}
                                        tag='button'
                                        size='lg'
                                        className='mt-3'
                                        style={{ marginRight: '1rem' }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            Cancella prenotazione
                                            {
                                                isDeleting &&
                                                <Spinner style={{ marginLeft: '1rem' }} />
                                            }
                                        </span>
                                    </Button>
                                    <Button
                                        color={!isDeleting && !isChanging ? 'warning' : 'dark'}
                                        onClick={!isDeleting && !isChanging ? onModifyPress : () => { }}
                                        tag='button'
                                        size='lg'
                                        className='mt-3 ml-3'
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            Modifica prenotazione
                                            {
                                                isChanging &&
                                                <Spinner style={{ marginLeft: '1rem' }} />
                                            }
                                        </span>
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Section>
        </Layout >
    );
};

export default Appointment;