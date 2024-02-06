import React, { useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import { Spinner } from 'reactstrap';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { AppointmentType, PrescriptionType, AccountType } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangePrescriptionAppointment } from '../utils';
import { BACKEND_URL } from '../constants';
import CardTitleLoad from '../components/CardTitleLoad';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";

const MAP_ENABLED = true;

type ConfirmAppointmentProps = {
    appointment: AppointmentType;
    prescription: PrescriptionType;
    account: AccountType;
};

const ConfirmAppointment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { appointment, prescription } = location.state as ConfirmAppointmentProps;
    console.log("appt", appointment.id, " presc", prescription.id);

    const confirmAppointment = async () => {
        setIsLoading(true);

        try {
            // Exchange tokens
            await exchangePrescriptionAppointment(prescription.id, appointment.id);
            // TODO: check for errors?
            //alert('Prenotazione confermata');

            // Book appointment in db
            let formData = new FormData();
            formData.append('id_prescription', prescription.id.toString());

            const response = await fetch(
                `${BACKEND_URL}/api/v1/appointments/reserve/${appointment.id}`,
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
                navigate(`/appointments/${appointment.id}`);
            });
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <BackButton />
                <Row>
                    <Col className='col-4'>
                        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {prescription.type}
                                </CardTitle>
                                <CardText>
                                    {"Prescription id: " + prescription.id}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card teaser noWrapper style={{ marginBottom: '1rem', overflow: 'hidden' }} >
                            <CardBody>
                                {
                                    MAP_ENABLED ?
                                        <div className='mini-map'>
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
                                        </div>
                                        :
                                        <CardText>
                                            [MAPPA DISABILITATA]
                                        </CardText>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                    <Col>
                        <Card spacing className='card-bg card-big no-after'>
                            <CardBody>
                                <CardTitleLoad title='Dettagli Appuntamento' loaded={true} />
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
                                        <b>QR Code che verrà generato una volta confermata la prenotazione</b>
                                    </li>
                                </ul>

                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        color={!isLoading ? 'primary' : 'dark'}
                                        onClick={!isLoading ? confirmAppointment : () => { }}
                                        tag='button'
                                        size='lg'
                                        className='mt-3'
                                        style={{ marginTop: '2rem' }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            Conferma prenotazione
                                            {
                                                isLoading &&
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

export default ConfirmAppointment;