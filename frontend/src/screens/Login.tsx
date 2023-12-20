import React from 'react';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import 'typeface-titillium-web';
import 'typeface-roboto-mono';
import 'typeface-lora';
import Layout from '../components/Layout';
import { Input, Section, Row, Col, Alert, Button } from 'design-react-kit';
import { useForm, Controller, SubmitHandler } from "react-hook-form";


interface LoginInputs {
    email: string;
    password: string;
}

const required_msg = 'Questo campo è richiesto';


const Login = () => {
    // Form
    const {
        control,
        formState: { errors },
        handleSubmit
    } = useForm({
        defaultValues: {
            email: "",
            password: ""
        },
    });
    const onSubmit: SubmitHandler<LoginInputs> = (data) => {
        // TODO: Call API
        console.log(data);
    };

    return (
        <Layout color="primary">
            <Section color='muted' className='mt-1'>
                <h3>Login</h3>
                <Row className='mt-4' />
                <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={
                        ({ field }) =>
                            <Input
                                type='text'
                                label='Email'
                                invalid={errors.email ? true : false}
                                validationText={errors.email ? required_msg : ''}
                                {...field}
                            />
                    }
                />
                <Controller
                    name="password"
                    control={control}
                    rules={{ required: true }}
                    render={
                        ({ field }) =>
                            <Input
                                type='text'
                                label='Password'
                                invalid={errors.password ? true : false}
                                validationText={errors.password ? required_msg : ''}
                                {...field}
                            />
                    }
                />
                {
                    errors.email || errors.password ?
                        <Row className='mt-4'>
                            <Col>
                                <Alert color='danger'>
                                    <strong>Attenzione</strong> Alcuni campi inseriti sono da controllare.
                                </Alert>
                            </Col>
                        </Row> : <></>
                }
                <Row className='mt-4'>
                    <Button color='primary' tag='button' onClick={handleSubmit(onSubmit)}>
                        Login
                    </Button>
                </Row>
            </Section>
        </Layout>
    );
};

export default Login;