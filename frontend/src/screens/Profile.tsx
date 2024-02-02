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


const Profile = () => {
    //TODO: remove
    const account: AccountType = {
        name: 'Mario',
        surname: 'Rossi',
        address: 'Via Olgettina 50',
        city: 'Milano',
        cap: '20100',
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
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
                            {account.surname !== undefined && account.surname !== '' &&
                                <Input
                                    type='text'
                                    label='Cognome'
                                    id='formCognome'
                                    wrapperClassName='col'
                                    readOnly
                                    value={account.surname}
                                />
                            }
                        </Row>
                        <Row>
                            <Input
                                type='text'
                                label='Indirizzo'
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
            </Section>
        </Layout >
    );
};

export default Profile;