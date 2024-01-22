import React from 'react';
import { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import CardButton from '../components/CardButton';
import { Section, Row, Col, Icon } from 'design-react-kit';
import { Token } from '../constants';
import { getOwnedTokens } from '../utils';
import { AppointmentType, PrescriptionType } from '../types';
import { BACKEND_URL } from '../constants';
import { verifyHash } from '../utils';


const Reservations = () => {
    const [prescriptions, setPrescriptions] = useState<PrescriptionType[]>([]);
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Get prescriptions from blockchain
            const prescriptionsData = await getOwnedTokens(Token.Prescription);
            let prescriptions: PrescriptionType[] = [];
            for (let i = 0; i < prescriptionsData[0].length; i++) {
                const id = prescriptionsData[0][i];
                const hash = prescriptionsData[1][i];
                // const category = prescriptionsData[2][i];

                // Retrieve from backend the additional data
                const response = await fetch(`${BACKEND_URL}/api/v1/prescriptions/${id}`);
                const data = await response.json();

                // Verify that the prescription is valid
                // TODO: usare solo dati che sono stati mandati al backend in creazione token
                // TODO: handle http errors
                if (await verifyHash(hash, data)) {
                    prescriptions[i] = {
                        id: id,
                        type: data.type,
                        doctor: data.doctor
                    };
                } else {
                    console.log(`ERROR: Metadata of Token ${id} is not valid`);
                }
            }

            setPrescriptions(prescriptions);

            // Get appointments from blockchain
            const appointmentData = await getOwnedTokens(Token.Appointment);
            for (let i = 0; i < appointmentData[0].length; i++) {
                const id = appointmentData[0][i];
                const hash = appointmentData[1][i];
                // const category = appointmentData[2][i];

                // Retrieve from backend the additional data
                const response = await fetch(`${BACKEND_URL}/api/v1/appointments/${id}`);
                const data = await response.json() as AppointmentType;

                // Verify that the appointment is valid
                // TODO: usare solo dati che sono stati mandati al backend in creazione token
                if (await verifyHash(hash, data)) {
                    appointments[i] = {
                        id: id,
                        type: data.type,
                        name: data.name,
                        city: data.city,
                        cap: data.cap,
                        address: data.address,
                        date: data.date,
                        time: data.time,
                        doctor: data.doctor,
                        distance: data.distance
                    };
                } else {
                    console.log(`ERROR: Token ${id}Metadata is not valid`);
                }
            }

            setAppointments(appointments);
        };
        fetchData();
    }, []);

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
                                <Row key={prescription.id}>
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
                                <Row key={appointment.id}>
                                    <CardButton
                                        title={appointment.type}
                                        date={appointment.date}
                                        description={appointment.address}
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