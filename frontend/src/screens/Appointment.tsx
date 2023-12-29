import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import QRCode from 'react-qr-code';
import Map from 'react-map-gl';

const MAP_ENABLED = false;

const Appointment = () => {
    const id = window.location.pathname.split('/')[2];
    const appointment = {
        id: 1,
        type: 'Neurologia',
        doctor: 'Dott. Mario Rossi',
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
                <Row>
                    <Col className='col-4'>
                        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {appointment.type}
                                </CardTitle>
                                <CardText>
                                    {"Richiesta da " + appointment.doctor}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card spacing className='card-bg card-big no-after'>
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
                        <Card spacing className='card-bg card-big no-after'>
                            <CardBody>
                                <CardTitle tag='h5'>
                                    Dettagli
                                </CardTitle>
                                <ul>
                                    <li>
                                        <b>Indirizzo:</b> {appointment.address}, {appointment.city}, {appointment.cap}
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