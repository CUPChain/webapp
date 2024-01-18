import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import CardButton from '../components/CardButton';
import { Section, Row, Col, Icon } from 'design-react-kit';
import { ethers } from "ethers";
import PrescriptionTokens from '../artifacts/contracts/PrescriptionTokens.sol/PrescriptionTokens.json';
import AppointmentTokens from '../artifacts/contracts/AppointmentTokens.sol/AppointmentTokens.json';
import { APPOINTMENTS_CONTRACT, PRESCRIPTIONS_CONTRACT, Token } from '../constants';

async function getOwnedTokens(tokenType: Token): Promise<[number[], string[], number[]]> {
    if (typeof window.ethereum === 'undefined') {
        //TODO: Tell user to install metamask?
        return [[],[],[]]
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let signer;
    try {
        signer = await provider.getSigner()
    } catch (err) { // User probably not logged in metamask
        // TODO: how to wait for user to log in?
        return [[],[],[]]
    }
    const contract = (tokenType === Token.Prescription)
        ? new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer)
        : new ethers.Contract(APPOINTMENTS_CONTRACT, AppointmentTokens.abi, signer)

    try {
        const data = await contract.getMyTokens()
        console.log("data: ", data)
        return data
    } catch (err) {
        console.log(`Could not fetch ${tokenType.toString()} tokens: `, err)
        return [[],[],[]]
    }
}

const Reservations = () => {
    
    const prescriptionTokens = getOwnedTokens(Token.Prescription)
    prescriptionTokens.then((prescriptionsData) => {
        prescriptionsData[1].forEach(url => {
            // TODO: fetch backend data
        });
    })

    const appointmentTokens = getOwnedTokens(Token.Appointment)
    appointmentTokens.then((appointmentData) => {
        appointmentData[1].forEach(url => {
            // TODO: fetch backend data
        });
    })

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