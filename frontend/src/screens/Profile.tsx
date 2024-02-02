import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Row, Card, CardBody, CardTitle, Input, Spinner, Col } from 'design-react-kit';
import { AccountType } from '../types';
import { BACKEND_URL } from '../constants';


const Profile = () => {
    const [account, setAccount] = useState<AccountType>({
        name: "",
        surname: "",
        address: "",
        city: "",
        cap: ""
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Get profile data
            const response = await fetch(
                `${BACKEND_URL}/api/v1/profile`, {
                method: "GET",
                headers: {
                    auth: localStorage.getItem('auth')!
                }
            }
            );
            if (!response.ok) {
                // TODO: handle error
                console.log(response.statusText);
                return;
            }

            const data = await response.json() as AccountType;
            setAccount(data);
            setLoaded(true);
        };
        fetchData();
    }, []);

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <Card noWrapper className='card-bg card-big'>
                    <CardBody>
                        <CardTitle tag='h5'>
                            <Row style={{ alignItems: 'center' }}>
                                <Col>
                                    Dettagli Account
                                </Col>
                                {
                                    !loaded &&
                                    <Col className='col-1'>
                                        <Spinner small active />
                                    </Col>
                                }
                            </Row>
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