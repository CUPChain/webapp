import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import { Container } from 'design-react-kit';

/** This component is the footer of the application. **/
const Footer = () => {
    return (
        <footer className="it-footer">
            <div className="it-footer-small-prints clearfix">
                <Container>
                    <ul className="it-footer-small-prints-list list-inline mb-0 d-flex flex-column flex-md-row">
                        <li className="list-inline-item">
                            <a href="https://github.com/CUPChain/webapp" title="Note Legali">
                                Open Source with <span className="text-danger">❤</span> by CupChain
                            </a>
                        </li>
                    </ul>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;