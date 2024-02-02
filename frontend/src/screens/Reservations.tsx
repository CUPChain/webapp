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
            let medical_exams = [];

            const response = await fetch(`${BACKEND_URL}/api/v1/medical_exams`);
            if (!response.ok) {
                // TODO: handle error
                console.log(response.statusText);
                return;
            }

            const data = await response.json() as { medical_exams: { code: number, name: string; }[]; };
            medical_exams = data.medical_exams.map((v) => {
                return {
                    value: v.code,
                    label: v.name
                };
            });

            // Get prescriptions from blockchain
            const prescriptionsData = await getOwnedTokens(Token.Prescription);
            let receivedPrescriptions: PrescriptionType[] = [];
            for (let i = 0; i < prescriptionsData[0].length; i++) {
                const id = prescriptionsData[0][i];
                // not needed?
                const hash = prescriptionsData[1][i];
                const category = prescriptionsData[2][i];

                receivedPrescriptions[i] = {
                    id: id,
                    type: medical_exams.find(x => x.value === category)?.label!
                };
            }
            setPrescriptions(receivedPrescriptions);

            // Get appointments from blockchain
            const appointmentData = await getOwnedTokens(Token.Appointment);
            let receivedAppointments: AppointmentType[] = [];
            for (let i = 0; i < appointmentData[0].length; i++) {
                const id = appointmentData[0][i];
                const hash = appointmentData[1][i];
                const category = appointmentData[2][i];

                // Retrieve from backend the additional data
                const response = await fetch(`${BACKEND_URL}/api/v1/appointments/${id}`);
                if (!response.ok) {
                    console.log(response.statusText);
                    // TODO: error handling
                    continue;
                }
                const data = await response.json() as { appointment: AppointmentType; };
                const appointment = data.appointment;
                appointment.type = medical_exams.find(x => x.value === category)?.label!;
                const dataToCheck = { id: appointment.id, hospital: appointment.id_hospital, date: appointment.date, type: appointment.type };
                console.log(appointment);

                // Verify that the appointment is valid
                if (await verifyHash(hash, dataToCheck)) {
                    data.appointment.valid = true;
                } else {
                    data.appointment.valid = false;
                    console.log(`ERROR: Token ${id} metadata is not valid`);
                }

                receivedAppointments[i] = data.appointment;
            }
            setAppointments(receivedAppointments);
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
                            {prescriptions.length === 0 &&
                                <b>Attualmente non risultano prescrizioni disponibili</b>
                            }
                            {prescriptions.map((prescription) => (
                                <Row key={prescription.id}>
                                    <CardButton
                                        title={prescription.type}
                                        description={"Token id: " + prescription.id}
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
                            {appointments.length === 0 &&
                                <b>Attualmente non risultano appuntamenti prenotati</b>
                            }
                            {appointments.map((appointment) => (
                                <Row key={appointment.id}>
                                    <CardButton
                                        title={appointment.type + (!appointment.valid ? " METADATA INVALIDI" : "")}
                                        date={appointment.date}
                                        description={appointment.address + '\n' + "Token id: " + appointment.id}
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