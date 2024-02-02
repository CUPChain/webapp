import { CardTitle, Col, Row, Spinner } from "design-react-kit";


const CardTitleLoad = ({ title, loaded }: { title: string, loaded: boolean }) => {
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
    )
}

export default CardTitleLoad;