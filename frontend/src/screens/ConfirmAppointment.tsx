import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, CardText, Button } from 'design-react-kit';
import Map from 'react-map-gl';
import { AppointmentType, PrescriptionType, AccountType } from '../types';
import { useLocation } from 'react-router-dom';
import { exchangePrescriptionAppointment } from '../utils';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT } from '../constants';
import { ethers } from 'ethers';
import PrescriptionTokens from '../artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from '../artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';

const MAP_ENABLED = false;

type ConfirmAppointmentProps = {
    appointment: AppointmentType;
    prescription: PrescriptionType;
    account: AccountType;
};

const ConfirmAppointment = () => {
    const location = useLocation();
    const { appointment, prescription, account } = location.state as ConfirmAppointmentProps;
    console.log("appt", appointment.id, " presc", prescription.id)

    // Initialize event listeners, they need contracts with provider as runner, instead of signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const prescrContract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, provider)
    const apptContract = new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, provider)

    prescrContract.on("Transfer", (from, to, tokenID, event) => {
        console.log(event)
        alert(`Token prescrizione n. ${tokenID} trasferito da ${from} a ${to}`)
    })
    apptContract.on("Transfer", (from, to, tokenID, event) => {
        console.log(event)
        alert(`Token appuntamento n. ${tokenID} trasferito da ${from} a ${to}`)
    })

    const confirmAppointment = () => {
        // TODO: cambia indirizzo ospedale con variabile
        exchangePrescriptionAppointment(prescription.id, appointment.id, "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc")
        // TODO: check for errors?
        //alert('Prenotazione confermata');
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
                        <Card spacing className='card-bg card-big no-after'>
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