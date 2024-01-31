import React, { useEffect } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { Section, Card, CardBody, Input, Button, Table, Row, Icon } from 'design-react-kit';
import { BACKEND_URL } from '../constants';
import RowTable from '../components/RowTable';


const PrescriptionList = () => {
    const navigate = useNavigate();
    const [prescrList, setPrescrList] = React.useState<{ patient: string, id: number, type: string; }[]>([]);
    const [filter, setFilter] = React.useState<string>("");

    const fetchPrescrList = async () => {
        const response = await fetch(
            `${BACKEND_URL}/api/v1/prescriptions_for_doctor`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')!
                }
            }
        );
        if (!response.ok) {
            console.log(response.statusText);
        }
        const data = await response.json() as { appointments: { patient: string, id: number, type: string; }[]; };
        setPrescrList(data.appointments);
    };

    const onSelection = async (id: number) => {
    };

    const onNewPrescription = async () => {
        navigate('/doctor/new-prescription');
    }

    const onFilter = async () => {
        // Retrieve list of prescriptions
        fetchPrescrList();
    };

    useEffect(() => {
        // Retrieve list of prescriptions
        fetchPrescrList();
    }, []);

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <Card spacing className='card-bg card-big no-after'>
                    <CardBody>
                        <Row style={{ marginBottom: '0.5rem', alignItems: 'center' }}>
                            <div className='col'>
                                <h5 className='text-dark'>Prescrizioni effettuate</h5>
                            </div>
                            <Button
                                color='primary'
                                size='sm'
                                className='col-3'
                                onClick={onNewPrescription}
                            >
                                <Icon icon='it-plus' size='sm' color='white' />
                                <span style={{ paddingLeft: 10 }}>Nuova prescrizione</span>
                            </Button>
                            <div className='col' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Input
                                    type='text'
                                    name='filter'
                                    id='filter'
                                    placeholder='Codice fiscale paziente'
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                <Button
                                    color='primary'
                                    size='sm'
                                    onClick={onFilter}
                                >
                                    <Icon icon='it-search' size='sm' color='white' />
                                </Button>
                            </div>
                        </Row>
                        <Table>
                            <thead className='table-dark'>
                                <tr>
                                    <th scope='col'>Chi</th>
                                    <th scope='col'>Cosa</th>
                                    <th scope='col'>Quando</th>
                                    <th scope='col'>Azione</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    prescrList.map((prescr) => (
                                        <RowTable
                                            key={prescr.id}
                                            where={prescr.patient}
                                            distance={prescr.id.toString()}
                                            when={prescr.type}
                                            action={onSelection.bind(this, prescr.id)}
                                        />
                                    ))
                                }
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default PrescriptionList;