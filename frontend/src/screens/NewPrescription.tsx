import React, { useEffect } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import Select, { components, PlaceholderProps, SingleValue } from 'react-select';
import { Section, Card, CardBody, CardTitle, Input, Button } from 'design-react-kit';
import { BACKEND_URL } from '../constants';
import { mintPrescription } from '../utils';
import { ethers } from 'ethers';


const NewPrescription = () => {
    const [prescrTypes, setPrescrTypes] = React.useState<{ value: number, label: string; }[]>([]);
    const [selectedType, setSelectedType] = React.useState(0);
    const [patientAddr, setPatientAddr] = React.useState<string>();
    const [patientCF, setPatientCF] = React.useState<string>();

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
        if (patientAddr === "" || patientAddr === undefined ||
            patientCF === "" || patientCF === undefined) {
                return;
        }

        // Load token from local storage
        const token = localStorage.getItem('token');

        let formData = new FormData();
        console.log(selectedType)
        formData.append('code_medical_examination', selectedType.toString());
        formData.append('patient_address', patientAddr!);
        formData.append('cf_patient', patientCF!);
        // cf doctor should be taken from db with login

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

        try {
            await mintPrescription(patientAddr!, tokenId, ethers.keccak256(ethers.toUtf8Bytes("NO")),selectedType);
        } catch(e) {
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
                            label='Codice fiscale del paziente'
                            onChange={(v) => { setPatientCF(v.target.value); }}
                        />

                        <Input
                            type='text'
                            label='Indirizzo del paziente'
                            onChange={(v) => { setPatientAddr(v.target.value); }}
                        />

                        <Select
                            name='prescrType'
                            placeholder={'Seleziona tipo di visita'}
                            isSearchable={true}
                            onChange={(v) => {setSelectedType(v!.value)}}
                            options={prescrTypes}
                        />

                        <Button color='primary' onClick={saveAndMintPrescription} style={{ marginTop: '2rem' }}>
                            Crea prescrizione
                        </Button>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default NewPrescription;