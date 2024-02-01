import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Header, HeaderContent, HeaderRightZone, Button, Icon } from 'design-react-kit';
import { isLoggedIn, logout } from '../utils';

const CustomHeader = () => {
    const [isLogged, setIsLogged] = useState<boolean>(isLoggedIn());

    useEffect(() => {
        const handleStorage = () => {
            setIsLogged(isLoggedIn());
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

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
                        {
                            isLogged ?
                                <>
                                    <Button outline color='primary' size='lg' icon href='/reservations' style={{ marginRight: '1rem' }}>
                                        <Icon color='white' icon='it-calendar' style={{ marginRight: '0.5rem' }} /> My Reservations
                                    </Button>
                                    <Button outline color='primary' size='lg' icon onClick={logout}>
                                        <Icon color='white' icon='it-logout' style={{ marginRight: '0.5rem' }} /> Logout
                                    </Button>
                                </>
                                :
                                <Button outline color='primary' size='lg' icon href='/login'>
                                    <Icon color='white' icon='it-user' /> Login
                                </Button>
                        }
                    </HeaderRightZone>
                </HeaderContent>
            </Header>
        </div>
    );
};

export default CustomHeader;