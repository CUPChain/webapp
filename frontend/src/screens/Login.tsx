import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Section, Button } from 'design-react-kit';
import metamask from '../images/metamask.svg';
import { BACKEND_URL } from '../constants';
import { loginMetamask, signString } from '../utils';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const navigate = useNavigate();

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

        // Sign challenge
        const signature = await signString(challenge.nonce.toString(), signer);

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
        const loginData = await loginResponse.json() as { auth: string; role: string; };
        
        // Store token
        localStorage.setItem('auth', loginData.auth);
        localStorage.setItem('role', loginData.role);
        window.dispatchEvent(new Event('storage'))

        // Redirect to reservations page
        navigate('/reservations');
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