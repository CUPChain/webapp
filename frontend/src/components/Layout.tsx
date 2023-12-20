import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Hero, HeroBody } from 'design-react-kit';

const Layout = ({ children, center = false }: { children: React.ReactNode; center?: boolean }) => {
    return (
        <Hero overlay='primary' centered={center}>
            <HeroBody>
                {children}
            </HeroBody>
        </Hero>
    );
};

export default Layout;