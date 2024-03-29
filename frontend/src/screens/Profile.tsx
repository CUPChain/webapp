import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Row, Card, CardBody, Input, Col, AvatarIcon } from 'design-react-kit';
import { AccountType } from '../types';
import { BACKEND_URL } from '../constants';
import CardTitleLoad from '../components/CardTitleLoad';

const Profile = () => {
    const [account, setAccount] = useState<AccountType>({
        name: "",
        surname: "",
        address: "",
        city: "",
        cap: ""
    });

    const getMyAccountAvatar = (role: string) => {
        if (role === 'patient') {
            return 'https://picsum.photos/id/1025/400/400.jpg'
            // 'https://randomuser.me/api/portraits/men/33.jpg';
        } else if (role === 'doctor') {
            return 'https://randomuser.me/api/portraits/lego/3.jpg';
        } else if (role === 'hospital') {
            return 'https://picsum.photos/id/764/400/400.jpg';
        }
        return '';
    };

    const [loaded, setLoaded] = useState(false);
    const [role, setRole] = useState<string>(localStorage.getItem('role') || '');

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
            setRole(localStorage.getItem('role') || '');
        };
        fetchData();
    }, []);

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <Card noWrapper className='card-bg card-big'>
                    <CardBody>
                        <Row>
                            <Col xs='2'>
                                <AvatarIcon size='xxl'>
                                    <img src={getMyAccountAvatar(role)} alt='Account Avatar' />
                                </AvatarIcon>
                            </Col>
                            <Col>
                                <CardTitleLoad title='Dettagli Account' loaded={loaded} />
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
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default Profile;