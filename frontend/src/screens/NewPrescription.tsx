import React, { useEffect } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Card, CardBody, CardTitle, Input, Select, Button } from 'design-react-kit';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL, Token } from '../constants';
import { set } from 'react-hook-form';
import { mintPrescription } from '../utils';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';


const NewPrescription = () => {
    const [prescrTypes, setPrescrTypes] = React.useState<{code: number, name: string}[]>([])
    const [selectedType, setSelectedType] = React.useState(0);
    const [patientCF, setPatientCF] = React.useState("");

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
            
            const data = await response.json() as { medical_exams: {code: number, name: string}[] }; 
            setPrescrTypes(data.medical_exams);
            if (data.medical_exams.length > 0) {
                setSelectedType(data.medical_exams[1].code);
            }
        }

        fetchPrescrTypes();
    }, []);

    // Save prescription to DB, get its token id in return, mint token with received id
    const saveAndMintPrescription = async () => {
        if (patientCF == "") { return }

        let formData = new FormData();
        formData.append('code_medical_examination', selectedType.toString())
        formData.append('cf_patient', patientCF);
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
            return
        }
        const tokenId = (await response.json()).id as number;
        
        // TODO: nothing to hash...
        const hashableData = {
            id: tokenId,
            category: selectedType
        }
        
        let hashableString = "";
        Object.keys(hashableData).sort().forEach((key: string) => {
            // Get value of key and add it to dataToHash
            let value = (hashableData as any)[key];
            hashableString += `${key}:${value};`;
        });
        const hash = keccak256(ethers.toUtf8Bytes(hashableString))
        
        await mintPrescription(patientAddr!, tokenId, hash, selectedType);
    }

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

                        <Select label='Tipo di prescrizione' defaultValue={selectedType} onChange={(v) => {setSelectedType(parseInt(v))}} >
                            {prescrTypes.map((prescrType) => (
                                <option key={prescrType.code} value={prescrType.code.toString()}>
                                    {prescrType.name}
                                </option>
                            ))}
                        </Select>

                        <Button color='primary' onClick={saveAndMintPrescription}>
                            Crea prescrizione
                        </Button>
                    </CardBody>
                </Card>
            </Section>
        </Layout >
    );
};

export default NewPrescription;