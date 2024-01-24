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
    const [prescrID, setPrescrID] = React.useState<string>();
    const [prescrTypes, setPrescrTypes] = React.useState<string[]>([
        'Neurologia',
        'Oculistica',
        'Cardiologia',
    ]);

    // Create db entry with: user CF, doctor CF, prescription type, token ID, challenge, solution

    /** Mint a new prescription token
     * @returns
    **/
    async function mintPrescription() {
        // if (!prescrID) return;
        // if (typeof window.ethereum !== 'undefined') {
        //     await requestAccount();
        //     const provider = new ethers.BrowserProvider(window.ethereum);
        //     const signer = await provider.getSigner();
        //     const contract = new ethers.Contract(PRESCRIPTIONS_CONTRACT, PrescriptionTokens.abi, signer);
        //     // for now give token to caller
        //     const transaction = await contract.safeMint(signer.address, prescrID, keccak256(ethers.randomBytes(32)), 1);
        //     await transaction.wait();
        // }
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