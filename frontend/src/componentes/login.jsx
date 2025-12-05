import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiConfig, BASE_URL } from '../api/config'; 
import { Container, Row, Col, Form, Button, Alert, Collapse, Card } from 'react-bootstrap';
import QRCode from 'react-qr-code';

function PagLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para controlar a visibilidade do QR Code
    const [showQRCode, setShowQRCode] = useState(false);
    
    const navigate = useNavigate();

    // Ajusta a URL para o QR Code (Backend 5001 -> Frontend 3000)
    const frontendUrl = BASE_URL.replace('5001', '3000'); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const { data } = await ApiConfig.post('/auth/login', { 
                email: username, 
                password 
            });

            localStorage.setItem('token', data.token);
            navigate('/paginicial');

        } catch (error) {
            console.error(error);
            const msgErro = error.response?.data?.message || 'Falha ao conectar com o servidor.';
            setErrorMessage(msgErro);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/registro');
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 login-background">
            {/* Aumentei a largura da coluna (lg={10}) para caber o QR code ao lado */}
            <Row className="w-100 justify-content-center">
                <Col xs={12} lg={10} xl={8} className="my-4">
                    
                    <div className="text-center mb-4">
                        <h1 className="text-white text-shadow">Login</h1>
                    </div>
                    
                    {errorMessage && <Alert variant="danger" className="text-center mx-auto" style={{maxWidth: '400px'}}>{errorMessage}</Alert>}
                    
                    {/* --- CONTAINER FLEXBOX PARA ALINHAR LADO A LADO --- */}
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-start gap-3">
                        
                        {/* 1. CARD DE LOGIN (Lado Esquerdo) */}
                        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
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
                                    disabled={loading}
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

                                {/* Botão para ativar o QR Code */}
                                <div className="text-center mt-3 pt-3 border-top d-none d-md-block">
                                    <Button 
                                        variant="link" 
                                        className="text-decoration-none text-muted"
                                        onClick={() => setShowQRCode(!showQRCode)}
                                        aria-controls="qrcode-collapse"
                                        aria-expanded={showQRCode}
                                    >
                                        <i className={`bi ${showQRCode ? 'bi-chevron-left' : 'bi-qr-code'} me-2`}></i>
                                        {showQRCode ? 'Ocultar QR Code' : 'Acessar pelo Celular'}
                                    </Button>
                                </div>
                            </Form>
                        </div>

                        {/* 2. CARD DO QR CODE (Lado Direito - Expansível) */}
                        {/* dimension="width" faz a animação ser horizontal */}
                        <Collapse in={showQRCode} dimension="width">
                            <div id="qrcode-collapse">
                                {/* O Card precisa ter uma largura fixa para a animação funcionar bem */}
                                <Card className="shadow text-center p-3" style={{ width: '300px', height: '100%' }}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                        <h6 className="fw-bold mb-3">Escaneie com o celular</h6>
                                        <div className="p-2 border rounded bg-white">
                                            <QRCode 
                                                value={frontendUrl} 
                                                size={180} 
                                                viewBox={`0 0 180 180`}
                                            />
                                        </div>
                                        <div className="mt-3 text-muted small">
                                            Certifique-se de que o celular está conectado na mesma rede Wi-Fi que este computador.
                                        </div>
                                        <div className="mt-2 text-primary small fw-bold text-break">
                                            {frontendUrl}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Collapse>

                    </div>
                    {/* --- FIM DO FLEX CONTAINER --- */}

                </Col>
            </Row>
        </Container>
    );
}

export default PagLogin;