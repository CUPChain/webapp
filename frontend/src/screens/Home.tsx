import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { HeroTitle } from 'design-react-kit';
import Layout from '../components/Layout';

const Home = () => {
    return (
        <Layout>
            <HeroTitle>CUPCHAIN</HeroTitle>
            <p className='d-none d-lg-block'>
                Chain the CUP, <br />
                Make it trust(able)!
            </p>
        </Layout>
    );
};

export default Home;