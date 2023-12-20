import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import CardButton from '../components/CardButton';
import { Section, Row, Col, Icon } from 'design-react-kit';


const Reservations = () => {

    const prescriptions = [
        {
            id: 1,
            type: 'Neurologia',
            doctor: 'Dott. Mario Rossi',
        }
    ];

    const appointments = [
        {
            id: 1,
            date: '02/02/2024 10:00',
            type: 'Analisi del sangue',
            location: 'Laboratorio Analisi - Via Roma 1, 00100 Roma'
        },
        {
            id: 2,
            date: '10/03/2024 15:00',
            type: 'Cardiologia',
            location: 'Ospedale San Giovanni - Via Roma 1, 00100 Roma'
        }
    ];


    return (
        <Layout>
            <Row>
                <Col>
                    <Section color='muted' className='mt-1'>
                        <h5>
                            <Icon icon='it-note' />
                            <span style={{ marginLeft: '10px' }}>
                                Prescrizioni disponibili
                            </span>
                        </h5>
                        <p>
                            Di seguito sono elencate le prescrizioni disponibili per il tuo account.
                            Seleziona una prescrizione per effettuare una prenotazione.
                        </p>
                        <>
                            {prescriptions.map((prescription) => (
                                <Row>
                                    <CardButton
                                        title={prescription.type}
                                        description={"Richiesto da " + prescription.doctor}
                                        href={`/prescriptions/${prescription.id}`}
                                    />
                                </Row>
                            ))}
                        </>
                    </Section>
                </Col>
                <Col>
                    <Section color='muted' className='mt-1'>
                        <h5>
                            <Icon icon='it-calendar' />
                            <span style={{ marginLeft: '10px' }}>
                                Appuntamenti prenotati
                            </span>
                        </h5>
                        <p>
                            Di seguito sono elencati gli appuntamenti prenotati per il tuo account.
                            Seleziona un appuntamento per visualizzare i dettagli.
                        </p>
                        <>
                            {appointments.map((appointment) => (
                                <Row>
                                    <CardButton
                                        title={appointment.type}
                                        date={appointment.date}
                                        description={appointment.location}
                                        href={`/appointments/${appointment.id}`}
                                    />
                                </Row>
                            ))}
                        </>
                    </Section>
                </Col>
            </Row>
        </Layout >
    );
};

export default Reservations;