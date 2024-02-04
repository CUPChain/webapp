import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Icon } from 'design-react-kit';

type RowTableProps = {
    where: string | undefined;
    distance: string | undefined;
    when: string | undefined;
    action?: () => void;
};

const RowTable = ({ where, distance, when, action }: RowTableProps) => {
    const func = action || (() => { });
    return (
        <tr className='align-middle position-relative' onClick={func} style={{ cursor: 'pointer' }}>
            <td>{where || 'Non disponibile'}</td>
            <td>{distance || 'Non disponibile'}</td>
            <td>{when || 'Non disponibile'}</td>
            {
                action &&
                <td>
                    <Icon icon='it-arrow-right' color='primary' />
                </td>
            }
        </tr>
    );
};

export default RowTable;