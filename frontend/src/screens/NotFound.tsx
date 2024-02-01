import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Hero, HeroBody, HeroTitle } from 'design-react-kit';

const Home = () => {
    return (
        <Hero overlay='primary' className='h-100'>
            <HeroBody>
                <HeroTitle>404</HeroTitle>
            </HeroBody>
        </Hero>
    );
};

export default Home;