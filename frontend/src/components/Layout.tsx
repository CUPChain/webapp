import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';

/** This component is the base layout of the application. **/
const Layout = ({ children, color = 'muted' }: { children: React.ReactNode; color?: 'primary' | 'neutral' | 'muted' | string; }) => {
    color = 'bg-' + color;
    return (
        <div className={'d-flex align-items-center justify-content-center h-100 ' + color}>
            <div className='container-sm'>
                {children}
            </div>
        </div>
    );
};

export default Layout;