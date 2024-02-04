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

/** This component is a row of a table with | where | distance | when | action |.
 * @param where The where of the row.
 * @param distance The distance of the row.
 * @param when The when of the row.
 * @param action The action of the row (if undefined, the row is not clickable and the action is not shown).
 **/
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