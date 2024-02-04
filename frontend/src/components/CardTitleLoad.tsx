import { CardTitle, Col, Row, Spinner } from "design-react-kit";

/** This component is a card title with a loading spinner.
 * @param title The title of the card.
 * @param loaded A boolean that indicates if the data is loaded.
 */
const CardTitleLoad = ({ title, loaded }: { title: string, loaded: boolean; }) => {
    return (
        <CardTitle tag='h5'>
            <Row style={{ alignItems: 'center' }}>
                <Col>
                    {title}
                </Col>
                {
                    !loaded &&
                    <Col className='col-1'>
                        <Spinner small active />
                    </Col>
                }
            </Row>
        </CardTitle>
    );
};

export default CardTitleLoad;