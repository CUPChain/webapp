import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import Select from 'react-select';
import { Section, Card, CardBody, CardTitle, Input, Button } from 'design-react-kit';
import { BACKEND_URL } from '../constants';
import { mintPrescription } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';


const NewPrescription = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [prescrTypes, setPrescrTypes] = useState<{ value: number, label: string; }[]>([]);
    const [selectedType, setSelectedType] = useState(0);
    const [patientAddr, setPatientAddr] = useState<string>();

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
            setPrescrTypes(data.medical_exams.map((v) => {
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
    const saveAndMintPrescription = async () => {
        setIsLoading(true);
        if (patientAddr === "" || patientAddr === undefined) {
            return;
        }

        let formData = new FormData();
        console.log(selectedType);
        formData.append('code_medical_examination', selectedType.toString());
        formData.append('pkey_patient', patientAddr!);
        // cf doctor should be taken from db with login

        // Send prescription to backend
        const response = await fetch(
            `${BACKEND_URL}/api/v1/prescriptions/create`,
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

        try {
            await mintPrescription(patientAddr!, tokenId, selectedType);
            navigate('/doctor');
        } catch (e) {
            console.log(e); // should rollback db
        }
    };



    return (
        <Layout>
            <Section color='muted' className='mt-1'>
                <BackButton />
                <Card spacing className='card-bg card-big no-after'>
                    <CardBody>
                        <CardTitle tag='h5'>
                            Crea una nuova prescrizione
                        </CardTitle>

                        <Input
                            type='text'
                            label='Public address del paziente'
                            onChange={(v) => { setPatientAddr(v.target.value); }}
                        />

                        <Select
                            name='prescrType'
                            placeholder={'Seleziona tipo di visita'}
                            isSearchable={true}
                            onChange={(v) => { setSelectedType(v!.value); }}
                            options={prescrTypes}
                        />

                        <Button
                            color={!isLoading ? 'primary' : 'dark'}
                            onClick={!isLoading ? saveAndMintPrescription : () => { }}
                            style={{ marginTop: '2rem' }}
                            active={!isLoading}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                Crea prescrizione
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

export default NewPrescription;