import React from 'react';
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
import { Token } from '../constants';
import { getTokenData } from '../utils';


const Prescription = () => {
    const id = window.location.pathname.split('/')[2];
    
    getTokenData(Number.parseInt(id), Token.Prescription).then((data) => {
        // TODO: fetch backend data, check hash
    })
    
    //TODO: get list of available appointments from db

    const navigate = useNavigate();

    const prescription: PrescriptionType = {
        id: 1,
        type: 'Neurologia',
        doctor: 'Dott. Mario Rossi',
    };

    const account: AccountType = {
        name: 'Mario',
        surname: 'Rossi',
        address: 'Via Olgettina 50',
        city: 'Milano',
        cap: '20100',
    };

    const appointments: AppointmentType[] = [
        {
            id: 1,
            name: 'Ospedale San Raffaele',
            city: 'Milano',
            cap: '20100',
            address: 'Via Olgettina 60',
            type: 'Neurologia',
            distance: '1,2 km',
            date: 'Giovedì 18 Aprile 2024',
            time: '11:00'
        },
        {
            id: 2,
            name: 'Ospedale San Matteo',
            city: 'Milano',
            cap: '20100',
            address: 'Via Olgettina 70',
            type: 'Neurologia',
            distance: '1,2 km',
            date: 'Giovedì 19 Aprile 2024',
            time: '10:00'
        },
        {
            id: 3,
            name: 'Ospedale San Paolo',
            city: 'Milano',
            cap: '20100',
            address: 'Via Olgettina 80',
            type: 'Neurologia',
            distance: '1,2 km',
            date: 'Giovedì 18 Maggio 2024',
            time: '15:00'
        }
    ];

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
                        <Card spacing className='card-bg card-big no-after'>
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