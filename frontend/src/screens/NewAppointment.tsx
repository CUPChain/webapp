import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import Select, { components, PlaceholderProps } from 'react-select';
import { Section, Card, CardBody, CardTitle, Input, Button } from 'design-react-kit';
import { BACKEND_URL } from '../constants';
import { mintAppointment } from '../utils';
import { ethers, keccak256 } from 'ethers';


const NewAppointment = () => {
    const [apptTypes, setApptTypes] = useState<{ value: number, label: string; }[]>([]);
    const [selectedType, setSelectedType] = useState(0);
    const [apptDate, setApptDate] = useState<Date>();

    useEffect(() => {
        // Retrieve list of possible medical exams
        const fetchPrescrTypes = async () => {
            const response = await fetch(`${BACKEND_URL}/api/v1/medical_exams`);
            if (!response.ok) {
                // TODO: handle error
                console.log(response.statusText);
                return;
            }

            const data = await response.json() as { medical_exams: { code: number, name: string; }[]; };
            setApptTypes(data.medical_exams.map((v) => {
                return {
                    value: v.code,
                    label: v.name
                };
            }));
            if (data.medical_exams.length > 0) {
                setSelectedType(data.medical_exams[1].code);
            }
        };

        fetchPrescrTypes();
    }, []);

    // Save prescription to DB, get its token id in return, mint token with received id
    const saveAndMintAppointment = async () => {

        // Load token from local storage
        const token = localStorage.getItem('token');

        let formData = new FormData();
        formData.append('code_medical_examination', selectedType.toString());
        //formData.append('date', apptDate?.getDate.toString());

        // Send prescription to backend
        const requestOptions = {
            method: 'POST',
            headhers: {
                token: token!
            },
            body: formData
        };
        const response = await fetch(
            `${BACKEND_URL}/api/v1/prescriptions/create`,
            requestOptions
        );
        if (!response.ok) {
            console.log(response.statusText);
            // TODO: error handling
            return;
        }
        const tokenId = (await response.json()).id as number;

        const hashableData = {
            id: tokenId,
            category: selectedType,
            date: apptDate
        };

        let hashableString = "";
        Object.keys(hashableData).sort().forEach((key: string) => {
            // Get value of key and add it to dataToHash
            let value = (hashableData as any)[key];
            hashableString += `${key}:${value};`;
        });
        const hash = keccak256(ethers.toUtf8Bytes(hashableString));

        await mintAppointment(tokenId, hash, selectedType);
    };

    const Placeholder = (props: PlaceholderProps<{ value: number, label: string; }>) => {
        return <components.Placeholder {...props} />;
    };

    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <Card spacing className='card-bg card-big no-after'>
                    <CardBody>
                        <CardTitle tag='h5'>
                            Crea un nuovo appuntamento
                        </CardTitle>

                        <Input
                            //TODO: date
                        />

                        <Select
                            name='apptType'
                            components={{ Placeholder }}
                            placeholder={'Seleziona tipo di visita'}
                            isSearchable={true}
                            options={apptTypes}
                        />

                        <Button color='primary' onClick={saveAndMintAppointment} style={{ marginTop: '2rem' }}>
                            Crea prescrizione
                        </Button>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default NewAppointment;