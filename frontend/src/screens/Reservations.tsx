import React from 'react';
import { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import CardButton from '../components/CardButton';
import { Section, Row, Col, Icon } from 'design-react-kit';
import { getHospitalInfo, getOwnedAppointmentTokens, getOwnedPrescriptionTokens } from '../utils';
import { AppointmentType, PrescriptionType } from '../types';
import { BACKEND_URL } from '../constants';
import { verifyHash } from '../utils';
import { Spinner } from 'reactstrap';


const Reservations = () => {
    const [loaded, setLoaded] = useState(false);
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
            const prescriptionsData = await getOwnedPrescriptionTokens();
            let receivedPrescriptions: PrescriptionType[] = [];
            for (let i = 0; i < prescriptionsData[0].length; i++) {
                const id = prescriptionsData[0][i];
                const category = prescriptionsData[1][i];

                receivedPrescriptions[i] = {
                    id: id,
                    type: medical_exams.find(x => x.value == category)?.label!
                };
            }
            setPrescriptions(receivedPrescriptions);

            // Get appointments from blockchain
            const appointmentData = await getOwnedAppointmentTokens();
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

                appointment.date = new Date(appointment.date);
                appointment.type = medical_exams.find(x => x.value == category)?.label!;

                const dataToCheck = {
                    id: appointment.id,
                    id_hospital: appointment.id_hospital,
                    date: appointment.date.toUTCString(),
                    category: appointment.code_medical_examination
                };
                console.log(dataToCheck);

                // Verify that the appointment is valid
                if (await verifyHash(hash, dataToCheck)) {
                    data.appointment.valid = true;
                } else {
                    data.appointment.valid = false;
                    console.log(`ERROR: Token ${id} metadata is not valid`);
                }

                await getHospitalInfo(data.appointment);

                receivedAppointments[i] = data.appointment;
            }
            setAppointments(receivedAppointments);
            setLoaded(true);
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
                            {
                                loaded ?
                                    prescriptions.length === 0 ?
                                        <b>Attualmente non risultano prescrizioni disponibili</b>
                                        :
                                        prescriptions.map((prescription) => (
                                            <Row key={prescription.id}>
                                                <CardButton
                                                    title={prescription.type}
                                                    description={"Token id: " + prescription.id}
                                                    href={`/prescriptions/${prescription.id}`}
                                                />
                                            </Row>
                                        ))
                                    :
                                    <Spinner style={{ marginLeft: '1rem' }} />
                            }
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
                            {
                                loaded ?
                                    appointments.length === 0 ?
                                        <b>Attualmente non risultano appuntamenti prenotati</b>
                                        :
                                        appointments.map((appointment) => (
                                            <Row key={appointment.id}>
                                                <CardButton
                                                    title={appointment.type + (!appointment.valid ? " METADATA INVALIDI" : "")}
                                                    date={appointment.date.toString().split("GMT")[0]}
                                                    description={`Token id: ${appointment.id}, ${appointment.name}`}
                                                    href={`/appointments/${appointment.id}`}
                                                />
                                            </Row>
                                        ))
                                    :
                                    <Spinner style={{ marginLeft: '1rem' }} />
                            }
                        </>
                    </Section>
                </Col>
            </Row>
        </Layout >
    );
};

export default Reservations;