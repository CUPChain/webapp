import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import Select from 'react-select';
import { Section, Card, CardBody, CardTitle, Input, Button } from 'design-react-kit';
import { BACKEND_URL } from '../constants';
import { mintAppointment } from '../utils';
import { ethers, keccak256 } from 'ethers';
import { useNavigate } from 'react-router';
import { Spinner } from 'reactstrap';


const NewAppointment = () => {
    const navigate = useNavigate();
    const [apptTypes, setApptTypes] = useState<{ value: number, label: string; }[]>([]);
    const [selectedType, setSelectedType] = useState(0);
    const [apptDate, setApptDate] = useState<string>();
    const [apptTime, setApptTime] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Retrieve list of possible medical exams
        const fetchExamTypes = async () => {
            // Retrieve names of all possible exams
            const namesResponse = await fetch(`${BACKEND_URL}/api/v1/medical_exams`);
            if (!namesResponse.ok) {
                // TODO: handle error
                console.log(namesResponse.statusText);
                return;
            }

            const namesData = await namesResponse.json() as { medical_exams: { code: number, name: string; }[]; };

            // Retrieve list of medical exams the hospital is able to do
            const examsResponse = await fetch(`${BACKEND_URL}/api/v1/am_able_to_do`,
                {
                    headers: {
                        auth: localStorage.getItem('auth')!
                    }
                }
            );
            if (!examsResponse.ok) {
                // TODO: handle error
                console.log(examsResponse.statusText);
                return;
            }

            const examsData = await examsResponse.json() as { is_able_to_do: number[]; };

            const possibleExams = namesData.medical_exams.filter(v => {
                return examsData.is_able_to_do.indexOf(v.code) !== -1;
            }).map((v) => {
                return {
                    value: v.code,
                    label: v.name
                };
            });

            setApptTypes(possibleExams);
            if (possibleExams.length > 0) {
                setSelectedType(possibleExams[0].value);
            }
        };

        fetchExamTypes();
    }, []);

    // Save prescription to DB, get its token id in return, mint token with received id
    const saveAndMintAppointment = async () => {
        setIsLoading(true);
        
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
        const createdAppointment = (await response.json());
        const tokenId = createdAppointment.id;
        const hospitalId = createdAppointment.id_hospital;
        const dateTime = new Date(createdAppointment.date);

        const hashableData = { //TODO: should we hash hospital id as well?
            id: tokenId,
            category: selectedType,
            date: dateTime.toUTCString(),
            id_hospital: hospitalId
        };
        console.log(hashableData)

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

        // Refresh page
        navigate('/login');
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
                            }}
                        />

                        <Input
                            type='time'
                            label='Orario della visita'
                            className='active'
                            //value={value}
                            onChange={(ev) => {
                                setApptTime(ev.target.value);
                            }}
                        />

                        <Select
                            name='apptType'
                            placeholder={'Seleziona tipo di visita'}
                            onChange={(v) => { setSelectedType(v!.value);}}
                            isSearchable={true}
                            options={apptTypes}
                        />

                        <Button
                            color={!isLoading ? 'primary' : 'dark'}
                            onClick={!isLoading ? saveAndMintAppointment : () => { }}
                            style={{ marginTop: '2rem' }}
                            active={!isLoading}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                Crea appuntamento
                                {
                                    isLoading &&
                                    <Spinner style={{ marginLeft: '1rem' }} />
                                }
                            </span>
                        </Button>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default NewAppointment;