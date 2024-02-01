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
    const [apptDate, setApptDate] = useState<string>();
    const [apptTime, setApptTime] = useState<string>();

    useEffect(() => {
        // Retrieve list of possible medical exams
        const fetchExamTypes = async () => {
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
                setSelectedType(data.medical_exams[0].code);
            }
        };

        fetchExamTypes();
    }, []);

    // Save prescription to DB, get its token id in return, mint token with received id
    const saveAndMintAppointment = async () => {
        let formData = new FormData();
        formData.append('code_medical_examination', selectedType.toString());
        formData.append('date', `${apptDate} ${apptTime}`);

        // Send prescription to backend
        const response = await fetch(
            `${BACKEND_URL}/api/v1/appointments/create`,
            {
                method: 'POST',
                headers: {
                    auth: localStorage.getItem('auth')!
                },
                body: formData
            }
        );
        if (!response.ok) {
            console.log(response.statusText);
            // TODO: error handling
            return;
        }
        const tokenId = (await response.json()).id as number;

        const hashableData = { //TODO: should we hash hospital id as well?
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
        try{
            await mintAppointment(tokenId, hash, selectedType);
        } catch(e) {
            console.log(e); // should rollback db
        }
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
                            type='date'
                            label='Giorno della visita'
                            className='active'
                            placeholder='gg/mm/aaaa'
                            //value={value}
                            onChange={(ev) => {
                                setApptDate(ev.target.value);
                                console.log(ev.target.value)
                            }}
                        />

                        <Input
                            type='time'
                            label='Orario della visita'
                            className='active'
                            //value={value}
                            onChange={(ev) => {
                                setApptTime(ev.target.value);
                                console.log(ev.target.value)
                            }}
                        />

                        <Select
                            name='apptType'
                            placeholder={'Seleziona tipo di visita'}
                            onChange={(v) => { setSelectedType(v!.value);}}
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