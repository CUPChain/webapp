import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import CardButton from '../components/CardButton';
import RowTable from '../components/RowTable';
import { Section, Col, Row, Card, CardBody, CardTitle, Input, Table, CardText } from 'design-react-kit';


const Prescription = () => {
    const id = window.location.pathname.split('/')[2];
    const prescription = {
        id: 1,
        type: 'Neurologia',
        doctor: 'Dott. Mario Rossi',
    };

    const account = {
        name: 'Mario',
        surname: 'Rossi',
        city: 'Milano',
        comune: 'Milano',
        cap: '20100',
    };

    const appointments = [
        {
            id: 1,
            where: 'Ospedale San Raffaele',
            distance: '1,2 km',
            when: 'Giovedì 15 Aprile 2021, 10:00',
            action: '/prescriptions/' + id + '/appointments/' + 1,
        },
        {
            id: 2,
            where: 'Ospedale San Raffaele',
            distance: '1,2 km',
            when: 'Giovedì 15 Aprile 2021, 10:00',
            action: '/prescriptions/' + id + '/appointments/' + 2,
        },
        {
            id: 3,
            where: 'Ospedale San Raffaele',
            distance: '1,2 km',
            when: 'Giovedì 15 Aprile 2021, 10:00',
            action: '/prescriptions/' + id + '/appointments/' + 3,
        }
    ];
    return (
        <Layout>
            <Section color='muted' className='mt-1'>
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
                                        value={account.city}
                                    />
                                </Row>
                                <Row>
                                    <Input
                                        type='text'
                                        label='Comune'
                                        id='formComune'
                                        wrapperClassName='col'
                                        readOnly
                                        value={account.comune}
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
                                                    where={appointment.where}
                                                    distance={appointment.distance}
                                                    when={appointment.when}
                                                    action={appointment.action}
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