import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; 

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/paginicial');
            } else {
                setErrorMessage(data.message || 'Falha no login');
            }
        } catch (error) {
            setErrorMessage('Ocorreu um erro. Tente novamente!');
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/registro');
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-gradient">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4} className="my-4">
                    <div className="text-center mb-4">
                        <h1>Login</h1>
                    </div>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    
                    <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                        <Form.Group className="mb-3" >
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 mb-2">
                            Log In
                        </Button>
                        <Button variant="secondary" onClick={handleRegisterRedirect} className="w-100">
                            Criar Conta
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
