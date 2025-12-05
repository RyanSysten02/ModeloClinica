import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; 

export default function Registro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const navigate = useNavigate();
    const [role_id, setRole] = useState(2);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (senha !== confirmarSenha) {
            setMensagemErro('As senhas não correspondem.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    nome, 
                    email, 
                    password: senha,
                    role_id
                })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');
            } else {
                setMensagemErro(data.message || 'Falha no registro');
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro. Tente novamente.');
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 login-background ">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4} className="my-4">
                    <div className="text-center mb-4">
                        <h1>Registro</h1>
                    </div>
                    
                    {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
                    
                    <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                        <Form.Group className="mb-3" controlId="formBasicNome">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicRole">
                        <Form.Label>Função</Form.Label>
                        <Form.Select value={role_id} onChange={(e) => setRole(parseInt(e.target.value))}>
                            <option value="2">Professor</option>
                            <option value="3">Secretaria</option>
                            <option value="1">Administrador</option>
                        </Form.Select>
                        </Form.Group>


                        <Form.Group className="mb-3" controlId="formBasicSenha">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicConfirmarSenha">
                            <Form.Label>Confirme sua Senha</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirme sua senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Registrar
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}
