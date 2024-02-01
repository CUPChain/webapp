import React, { useEffect, useState } from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Header, HeaderContent, HeaderRightZone, Button, Icon } from 'design-react-kit';
import { isLoggedIn, logout } from '../utils';


const CustomHeader = () => {
    const getPersonalArea = (role: string) => {
        if (role === 'patient') {
            return '/reservations';
        } else if (role === 'doctor') {
            return '/doctor';
        } else if (role === 'hospital') {
            return '/hospital';
        }
        return '/';
    };

    const getIcon = (role: string) => {
        if (role === 'patient') {
            return 'it-inbox';
        } else if (role === 'doctor') {
            return 'it-note';
        } else if (role === 'hospital') {
            return 'it-folder';
        }
        return '/';
    };

    const [isLogged, setIsLogged] = useState<boolean>(isLoggedIn());
    const [role, setRole] = useState<string>(localStorage.getItem('role') || '');
    const [personalArea, setPersonalArea] = useState<string>(getPersonalArea(role));

    useEffect(() => {
        const handleStorage = () => {
            setIsLogged(isLoggedIn());
            let role = localStorage.getItem('role') || '';
            setRole(role);
            setPersonalArea(getPersonalArea(role));
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
                                    <Button
                                        outline color='primary'
                                        size='lg' icon
                                        href={personalArea}
                                        style={{ marginRight: '1rem' }}
                                    >
                                        <Icon color='white' icon={getIcon(role)} style={{ marginRight: '0.5rem' }} />
                                        Area Personale
                                    </Button>
                                    <Button outline color='primary' size='lg' icon onClick={logout}>
                                        <Icon color='white' icon='it-logout' style={{ marginRight: '0.5rem' }} />
                                        Esci
                                    </Button>
                                </>
                                :
                                <Button outline color='primary' size='lg' icon href='/login'>
                                    <Icon color='white' icon='it-user' />
                                    Accedi
                                </Button>
                        }
                    </HeaderRightZone>
                </HeaderContent>
            </Header>
        </div>
    );
};

export default CustomHeader;