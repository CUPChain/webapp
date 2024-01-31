import React, { useEffect } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import Select, { components, InputProps, PlaceholderProps } from 'react-select';
import { Section, Card, CardBody, CardTitle, Input, Button } from 'design-react-kit';
import { BACKEND_URL, Token } from '../constants';
import { mintPrescription } from '../utils';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';


const NewPrescription = () => {
    const [prescrTypes, setPrescrTypes] = React.useState<{ value: number, label: string; }[]>([]);
    const [selectedType, setSelectedType] = React.useState(0);
    const [patientAddr, setPatientAddr] = React.useState<string>();

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
            setPrescrTypes(data.medical_exams.map((v) => {
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
    const saveAndMintPrescription = async () => {
        if (patientAddr === "") { return; }

        let formData = new FormData();
        formData.append('code_medical_examination', selectedType.toString());
        formData.append('patient_address', patientAddr!);
        // cf doctor should be taken from db with login


        const requestOptions = {
            method: 'POST',
            //headhers: {},
            body: formData
        };

        const response = await fetch(`${BACKEND_URL}/api/v1/prescriptions/create`, requestOptions);
        if (!response.ok) {
            console.log(response.statusText);
            // TODO: error handling
            return;
        }
        const tokenId = (await response.json()).id as number;

        // TODO: nothing to hash...
        const hashableData = {
            id: tokenId,
            category: selectedType
        };

        let hashableString = "";
        Object.keys(hashableData).sort().forEach((key: string) => {
            // Get value of key and add it to dataToHash
            let value = (hashableData as any)[key];
            hashableString += `${key}:${value};`;
        });
        const hash = keccak256(ethers.toUtf8Bytes(hashableString));

        await mintPrescription(patientAddr!, tokenId, hash, selectedType);
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
                            Crea una nuova prescrizione
                        </CardTitle>

                        <Input
                            type='text'
                            label='Address del paziente'
                            onChange={(v) => { setPatientAddr(v.target.value); }}
                        />

                        <Select
                            name='prescrType'
                            components={{ Placeholder }}
                            placeholder={'Seleziona tipo di visita'}
                            isSearchable={true}
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