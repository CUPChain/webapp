import React, { useEffect } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Card, CardBody, CardTitle, Input, Select } from 'design-react-kit';
import { useNavigate } from 'react-router-dom';
import { Token } from '../constants';


const NewPrescription = () => {
    const id = window.location.pathname.split('/')[2];
    const navigate = useNavigate();
    const [prescrID, setPrescrID] = React.useState<string>();
    const [prescrTypes, setPrescrTypes] = React.useState<string[]>([
        'Analisi',
        'Ricetta',
        'Visita',
    ]);

    const getTokenData = async (id: string) => {
        let response = await fetch(`http://localhost:3001/api/tokens/${id}`);
        let tokenData: Token = await response.json();
        return tokenData;
    };

    // useEffect(async () => {
    //     const tokenData = await getTokenData(id);
    //     setPrescrID(tokenData.id);
    //     setPrescrTypes(tokenData.prescrTypes);
    // }, [id, navigate]);

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <Card spacing className='card-bg card-big no-after'>
                    <CardBody>
                        <CardTitle tag='h5'>
                            Crea una nuova prescrizione
                        </CardTitle>

                        <Input
                            type='text'
                            label='Indirizzo pubblico del medico'
                        />

                        <Input
                            type='text'
                            label='Codice fiscale del paziente'
                        />

                        <Select label='Tipo di prescrizione' onChange={() => { }}>
                            {prescrTypes.map((prescrType, index) => (
                                <option key={index} value={prescrType}>
                                    {prescrType}
                                </option>
                            ))}
                        </Select>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default NewPrescription;