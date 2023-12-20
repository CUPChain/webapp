import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Section, HeroBody } from 'design-react-kit';

const Layout = ({ children, color = 'muted' }: { children: React.ReactNode; color?: 'primary' | 'neutral' | 'muted' | string; }) => {
    return (
        <Section color={color}>
            <div className='container-sm'>
                {children}
            </div>
        </Section>
    );
};

export default Layout;