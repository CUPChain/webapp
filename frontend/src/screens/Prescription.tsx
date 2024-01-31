import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import RowTable from '../components/RowTable';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, Input, Table, CardText } from 'design-react-kit';
import { PrescriptionType, AccountType, AppointmentType } from '../types';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL, Token } from '../constants';
import { getTokenData, isOwned } from '../utils';


const Prescription = () => {
    const id = window.location.pathname.split('/')[2];

    const [prescription, setPrescription] = useState<PrescriptionType>();
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);

    useEffect(() => {
        const fetchData = async (id: number) => {
            // Check that token is owned by user
            if (!await isOwned(id, Token.Prescription)) {
                // TODO:
                return
            }

            const [category,] = await getTokenData(id, Token.Appointment);
            
            const categoryName = await fetch(`${BACKEND_URL}/api/v1/medical_exams/${category}`)
                                        .then(response => response.json()) //TODO: http errors
                                        .then(data => data.name);

            setPrescription({ id: id, type: categoryName});

            // Get appointments from blockchain
            const availableAppointments = await fetch(`${BACKEND_URL}/api/v1/available_appointments/${category}`)
                                                .then(response => response.json()) //TODO: http errors
                                                .then(data => data as AppointmentType[]);

            setAppointments(availableAppointments.sort()); //TODO: sort by?
        };
        
        fetchData(Number.parseInt(id));
    }, []);

    const navigate = useNavigate();

    //TODO: remove
    const account: AccountType = {
        name: 'Mario',
        surname: 'Rossi',
        address: 'Via Olgettina 50',
        city: 'Milano',
        cap: '20100',
    };


    const onSelection = (id: number) => {
        let appointment = appointments.find((appointment) => appointment.id === id);
        navigate('confirm-appointment', {
            state: {
                appointment,
                prescription,
                account,
            }
        });
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <BackButton />
                <Row>
                    <Col className='col-4'>
                        <Card className='card-bg' teaser noWrapper style={{ marginBottom: '1rem' }} >
                            <CardBody>
                                <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                    {prescription.type}
                                </CardTitle>
                                <CardText>
                                    {"Prescription id " + prescription.id}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card noWrapper className='card-bg card-big'>
                            <CardBody>
                                <CardTitle tag='h5'>
                                    Dettagli Account
                                </CardTitle>
                                <Row style={{ marginTop: '3rem' }}>
                                    <Input
                                        type='text'
                                        label='Nome'
                                        id='formNome'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.name}
                                    />
                                    <Input
                                        type='text'
                                        label='Cognome'
                                        id='formCognome'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.surname}
                                    />
                                </Row>
                                <Row>
                                    <Input
                                        type='text'
                                        label='Città'
                                        id='formCitta'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.address}
                                    />
                                </Row>
                                <Row>
                                    <Input
                                        type='text'
                                        label='Comune'
                                        id='formComune'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.city}
                                    />
                                    <Input
                                        type='text'
                                        label='CAP'
                                        id='formCAP'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.cap}
                                    />
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col>
                        <Card spacing className='card-bg card-big no-after'>
                            <CardBody>
                                <CardTitle tag='h5'>
                                    Seleziona Appuntamento
                                </CardTitle>
                                <Table>
                                    <thead className='table-dark'>
                                        <tr>
                                            <th scope='col'>Dove</th>
                                            <th scope='col'>Distanza</th>
                                            <th scope='col'>Quando</th>
                                            <th scope='col'>Azione</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            appointments.map((appointment) => (
                                                <RowTable
                                                    key={appointment.id}
                                                    where={appointment.name}
                                                    distance={appointment.distance}
                                                    when={appointment.date + ' ' + appointment.time}
                                                    action={onSelection.bind(this, appointment.id)}
                                                />
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Section>
        </Layout >
    );
};

export default Prescription;