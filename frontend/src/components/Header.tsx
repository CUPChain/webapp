import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Header, HeaderContent, HeaderRightZone, Button, Icon } from 'design-react-kit';

const CustomHeader = () => {
    return (
        <div className='bg-dark'>
            <Header
                theme=""
                type="center"
            >
                <HeaderContent>
                    <a href='/'>
                        <img src='/logo.png' alt='Logo' style={{ width: '100px', height: '100px' }} />
                    </a>
                    <HeaderRightZone>
                        <Button outline color='primary' size='lg' icon href='/login'>
                            <Icon color='white' icon='it-user' /> Login
                        </Button>{' '}
                    </HeaderRightZone>
                </HeaderContent>
            </Header>
        </div>
    );
};

export default CustomHeader;