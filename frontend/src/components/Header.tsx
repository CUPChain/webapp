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
                    <img src='logo.png' alt='Logo' style={{ width: '100px', height: '100px' }} />
                    <HeaderRightZone>
                        <Button outline color='primary' size='lg' icon>
                            <a href='/login' style={{ color: 'white' }}>
                                <Icon color='white' icon='it-user' /> Login
                            </a>
                        </Button>{' '}
                    </HeaderRightZone>
                </HeaderContent>
            </Header>
        </div>
    );
};

export default CustomHeader;