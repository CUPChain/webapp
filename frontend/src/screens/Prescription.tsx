import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import RowTable from '../components/RowTable';
import BackButton from '../components/BackButton';
import { Section, Col, Row, Card, CardBody, CardTitle, Input, Table, CardText, Spinner } from 'design-react-kit';
import { PrescriptionType, AccountType, AppointmentType } from '../types';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL, Token } from '../constants';
import { getDistanceFromLatLonInKm, getHospitalInfo, getTokenCategory, isOwned } from '../utils';


const Prescription = () => {
    const navigate = useNavigate();
    const id = window.location.pathname.split('/')[2];

    const [account, setAccount] = useState<AccountType>({
        name: "",
        surname: "",
        address: "",
        city: "",
        cap: ""
    });
    const [prescription, setPrescription] = useState<PrescriptionType>({ id: 0, type: "Invalid" });
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [myPosition, setMyPosition] = useState<{latitude: number, longitude: number}>()

    useEffect(() => {
        const fetchData = async (id: number) => {
            // Check that token is owned by user
            if (!await isOwned(id, Token.Prescription)) {
                // TODO:
                return;
            }

            const category = await getTokenCategory(id, Token.Prescription);


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

            // Get category name from database
            const categoryResponse = await fetch(`${BACKEND_URL}/api/v1/medical_exams/${category}`);
            if (!categoryResponse.ok) {
                console.log("error:", categoryResponse);
                return;
            }
            const categoryName = await categoryResponse.json()
                .then(data => data.medical_exam.name);

            setPrescription({ id: id, type: categoryName });

            // Get available appointments from database
            console.log(category);
            const appointmentsResponse = await fetch(`${BACKEND_URL}/api/v1/appointments?category=${category}`);
            if (!appointmentsResponse.ok) {
                console.log("error:", appointmentsResponse);
                return;
            }
            const availableAppointments = await appointmentsResponse.json()
                .then(data => data.appointments as AppointmentType[]);
            
            // Get hospital info for each available appointment
            for (let i=0; i< availableAppointments.length; i++) {
                availableAppointments[i].date = new Date(availableAppointments[i].date);
                await getHospitalInfo(availableAppointments[i]);
            }
            availableAppointments.sort();
            setAppointments(availableAppointments); //TODO: sort by what?

            
            // Get current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    setMyPosition({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                });
            } else {
                console.log("Geolocation is not available in your browser.");
            }

            setLoaded(true);
        };

        fetchData(Number.parseInt(id));
    }, [id]);

    // Update distances after receiving position
    useEffect(() => {
        if (myPosition !== undefined) {
            setAppointments(appointments.map(appt => {
                appt.distance = getDistanceFromLatLonInKm(
                    myPosition.latitude, myPosition.longitude,
                    appt.latitude, appt.longitude
                ).toFixed(1).toString() + "Km";
                return appt;
            }));
        }
    }, [myPosition]);


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
                                    {"Prescription id: " + prescription.id}
                                </CardText>
                            </CardBody>
                        </Card>
                        <Card noWrapper className='card-bg card-big'>
                            <CardBody>
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
                                                    when={appointment.date.toString().split("GMT")[0]}
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