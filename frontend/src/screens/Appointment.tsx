import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import QRCode from 'react-qr-code';
import Map from 'react-map-gl';
import { AppointmentType, PrescriptionType } from '../types';
import { getTokenData } from '../utils';
import { Token } from '../constants';

const MAP_ENABLED = false;

const Appointment = () => {
    // TODO: id of prescription will be different from id of appointment
    // How do we know what was the id of the prescription that got exchanged for the appointment?
    const id = window.location.pathname.split('/')[2];

    getTokenData(Number.parseInt(id), Token.Prescription).then((data) => {
        // TODO: fetch backend data, check hash
    })
    getTokenData(Number.parseInt(id), Token.Appointment).then((data) => {
        // TODO: fetch backend data, check hash
    })

    const prescription: PrescriptionType = {
        id: 1,
        type: 'Neurologia',
        doctor: 'Dott. Mario Rossi',
    };

    const appointment: AppointmentType = {
        id: 1,
        type: 'Neurologia',
        name: 'Ospedale San Raffaele',
        city: 'Milano',
        cap: '20100',
        address: 'Via Roma 1',
        date: '01/03/2024',
        time: '10:00'
    };

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
                    <Col className='col-4'>
                        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {prescription.type}
                                </CardTitle>
                                <CardText>
                                    {"Richiesta da " + prescription.doctor}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                {
                                    MAP_ENABLED ?
                                        <Map
                                            mapLib={import('mapbox-gl')}
                                            initialViewState={{
                                                longitude: 9.191383,
                                                latitude: 45.464211,
                                                zoom: 13,
                                            }}
                                            style={{ width: 600, height: 400 }}
                                            mapStyle="mapbox://styles/mapbox/streets-v9"
                                        />
                                        :
                                        <CardText>
                                            [MAPPA DISABILITATA]
                                        </CardText>
                                }
                            </CardBody>
                        </Card>
                    </Col>
                    <Col>
                        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
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
                                        <b>Data:</b> {appointment.date}
                                    </li>
                                    <li>
                                        <b>Ora:</b> {appointment.time}
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