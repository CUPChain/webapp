import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Card, CardBody, CardTitle, CardText, Col, Row, Icon } from 'design-react-kit';



const CardButton = ({ title, description, href, date }: { title: string; description: string; href: string; date?: string }) => {
    return (
        <Card teaser noWrapper style={{ marginBottom: '1rem' }} >
            <CardBody>
                <a href={href} className='stretched-link' style={{ textDecoration: 'none' }}>
                    <Row>
                        <Col>
                            <CardTitle tag='h6' style={{ marginBottom: '0.1rem' }}>
                                {title}
                            </CardTitle>
                            {
                                date &&
                                <h6 className="card-subtitle"
                                    style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.1rem', marginBottom: '0.3rem' }}
                                >
                                    {date}
                                </h6>
                            }
                            <CardText>
                                {description}
                            </CardText>
                        </Col>
                        <Col xs='auto'>
                            <Icon icon='it-arrow-right' color='primary' />
                        </Col>
                    </Row>
                </a>
            </CardBody>
        </Card>
    );
};

export default CardButton;;