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
import { type LatLngExpression } from 'leaflet';
import { AppointmentType, PrescriptionType } from '../types';
import { getAppointmentToken, getHospitalInfo, isOwned, verifyHash } from '../utils';
import { BACKEND_URL, Token } from '../constants';

const MAP_ENABLED = true;

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
        latitude: 0,
        longitude: 0,
        valid: false
    });
    const [prescription, setPrescription] = useState<PrescriptionType>({id: 0, type: "Invalid"});

    useEffect(() => {
        const getAppointmentData = async (id: number) => {
            // Check that token is owned by user
            if (!await isOwned(id, Token.Appointment)) {
                // TODO:
                return
            }

            const [, hash] = await getAppointmentToken(id);

            // Retrieve from backend the additional data
            const response = await fetch(`${BACKEND_URL}/api/v1/appointments/${id}`);
            if (!response.ok) {
                console.log(response.statusText);
                // TODO: error handling
                return
            }
            const data = await response.json() as { appointment: AppointmentType };
            const appointment = data.appointment;

            appointment.date = new Date(appointment.date)
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
        }

        getAppointmentData(Number.parseInt(id));
    }, []);

    const deleteAppointment = () => {
        // TODO: implementare cancellazione prenotazione
        alert('Prenotazione annullata');
    };

    const modifyAppointment = () => {
        // TODO: implementare modifica prenotazione
        alert('Prenotazione modificata');
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <BackButton />
                <Row>
                    <Col className='col-4 d-flex flex-column'>
                        <Card className='card-bg' teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {prescription.type}
                                </CardTitle>
                                <CardText>
                                    {"Id:  " + prescription.id}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card className='card-bg flex-grow-1' teaser noWrapper style={{ marginBottom: '1rem', overflow: 'hidden' }} >
                            <CardBody>
                                {
                                    MAP_ENABLED && appointment.latitude ?
                                        <MapContainer center={[appointment.latitude, appointment.longitude]} zoom={13} scrollWheelZoom={false}>
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[appointment.latitude, appointment.longitude]}>
                                                <Popup>
                                                    A pretty CSS3 popup. <br /> Easily customizable.
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
                                <CardTitle tag='h5'>
                                    Dettagli
                                </CardTitle>
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
                                        <b>Ora:</b> {appointment.date.toTimeString()}
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

                                <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
                                    <QRCode value={appointment.id.toString()} />
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        onClick={deleteAppointment}
                                        color='danger'
                                        tag='button'
                                        size='lg'
                                        className='mt-3'
                                        style={{ marginRight: '1rem' }}
                                    >
                                        Annulla prenotazione
                                    </Button>
                                    <Button
                                        onClick={modifyAppointment}
                                        color='warning'
                                        tag='button'
                                        size='lg'
                                        className='mt-3 ml-3'
                                    >
                                        Modifica prenotazione
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