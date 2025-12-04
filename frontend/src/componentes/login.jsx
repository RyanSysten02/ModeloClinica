import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiConfig } from '.././api/config';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function PagLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // Novo estado para controlar o botão
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Bloqueia o botão
        setErrorMessage(''); // Limpa erros antigos

        try {
            // Requisição usando sua configuração centralizada
            const { data } = await ApiConfig.post('/auth/login', { 
                email: username, 
                password 
            });

            // Se chegou aqui, deu sucesso (200/201)
            localStorage.setItem('token', data.token);
            navigate('/paginicial');

        } catch (error) {
            console.error(error);
            // Pega a mensagem do backend ou usa uma genérica
            const msgErro = error.response?.data?.message || 'Falha ao conectar com o servidor.';
            setErrorMessage(msgErro);
        } finally {
            setLoading(false); // Libera o botão independente do resultado
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
                        {/* Se tiver uma logo, pode colocar aqui */}
                        <h1>Login</h1>
                    </div>
                    
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    
                    <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                        <Form.Group className="mb-3">
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

                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 mb-2"
                            disabled={loading} // Desabilita se estiver carregando
                        >
                            {loading ? 'Entrando...' : 'Log In'}
                        </Button>
                        
                        <Button 
                            variant="secondary" 
                            onClick={handleRegisterRedirect} 
                            className="w-100"
                            disabled={loading}
                        >
                            Criar Conta
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default PagLogin;