import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Icon } from 'design-react-kit';



const RowTable = ({ where, distance, when, action }: { where: string; distance: string; when: string; action: string; }) => {
    return (
        <tr className='align-middle position-relative'>
            <td>{where}</td>
            <td>{distance}</td>
            <td>{when}</td>
            <td>
                <a href={action} className='stretched-link' style={{ textDecoration: 'none' }}>
                    <Icon icon='it-arrow-right' color='primary' />
                </a>
            </td>
        </tr>
    );
};

export default RowTable;