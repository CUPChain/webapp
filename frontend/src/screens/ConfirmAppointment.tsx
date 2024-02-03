import React, { useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { AppointmentType, PrescriptionType, AccountType } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangePrescriptionAppointment } from '../utils';
import { BACKEND_URL } from '../constants';
import CardTitleLoad from '../components/CardTitleLoad';

const MAP_ENABLED = false;

type ConfirmAppointmentProps = {
    appointment: AppointmentType;
    prescription: PrescriptionType;
    account: AccountType;
};

const ConfirmAppointment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { appointment, prescription } = location.state as ConfirmAppointmentProps;
    console.log("appt", appointment.id, " presc", prescription.id);

    const confirmAppointment = async () => {
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
            navigate('/reservations');
        })
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
                                        <b>QR Code che verrà generato una volta confermata la prenotazione</b>
                                    </li>
                                </ul>

                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        onClick={confirmAppointment}
                                        color='primary'
                                        tag='button'
                                        size='lg'
                                        className='mt-3'
                                        style={{ marginRight: '1rem' }}
                                    >
                                        Conferma prenotazione
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