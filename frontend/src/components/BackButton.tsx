import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Icon } from 'design-react-kit';
import { useNavigate } from 'react-router-dom';

/** This component is a simple back button that uses the useNavigate hook to go back to the previous page. **/
const BackButton = () => {
    const navigate = useNavigate();

    const goBack = () => {
        // Go back to the previous page
        navigate(-1);
    };

    return (
        <h6 style={{ cursor: 'pointer', marginBottom: '1rem' }} onClick={goBack}>
            <Icon icon='it-arrow-left' color='black' style={{ marginRight: '0.5rem' }} />
            Torna indietro
        </h6>
    );
};

export default BackButton;