import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Input, Section, Row, Col, Alert, Button } from 'design-react-kit';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import metamask from '../images/metamask.svg';
import { BACKEND_URL } from '../constants';
import { loginMetamask, signString } from '../utils';


const Login = () => {
    const metamaskLoginReq = async () => {
        // Request account access if needed
        const [, signer] = await loginMetamask();
        const pkey = await signer.getAddress();

        // Request challenge from server
        const challengeResponse = await fetch(`${BACKEND_URL}/api/v1/challenge/${pkey}`);
        if (!challengeResponse.ok) {
            console.log("error:", challengeResponse);
            return;
        }
        const challenge = await challengeResponse.json() as { nonce: string; };
        console.log("challenge: ", challenge);

        // Sign challenge
        const signature = await signString(challenge.nonce.toString(), signer);
        console.log("signature: ", signature);

        // Send signature to server
        const loginResponse = await fetch(`${BACKEND_URL}/api/v1/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pkey: pkey,
                signature: signature
            })
        });
        if (!loginResponse.ok) {
            console.log("error:", loginResponse);
            return;
        }
        const loginData = await loginResponse.json() as { token: string; };
        console.log("token: ", loginData.token);
    };

    return (
        <Layout color='primary'>
            <Section color='muted'>
                <h3>Login</h3>
                <Button color='primary' tag='a' onClick={metamaskLoginReq} style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={metamask} alt='' style={{ width: '2rem', marginRight: '0.5rem' }} />
                    Metamask
                </Button>
            </Section>
        </Layout>
    );
};

export default Login;