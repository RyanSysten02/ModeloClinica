import React, { useState } from 'react';
import { Button, Form, Row, Col, Collapse, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Adicionar({ onAdicionar }) {
    const [novoEvento, setNovoEvento] = useState({
        title: '',
        start: '',
        end: '',
        desc: '',
        color: '',
        tipo: '',
    });
    const [expanded, setExpanded] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNovoEvento({ ...novoEvento, [name]: value });
    };

    const handleToggleExpanded = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro(''); 

        if (novoEvento.title && novoEvento.start && novoEvento.end) {
            const startDate = new Date(novoEvento.start);
            const endDate = new Date(novoEvento.end);

            if (startDate >= endDate) {
                alert('A data início deve ser anterior à data de término');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setMensagemErro('Token de autenticação não encontrado. Faça login novamente.');
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5001/api/consulta/x', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(novoEvento),
                });

                const data = await response.json();

                if (response.ok) {
                    onAdicionar(); // Chama a função para atualizar o calendário
                    setNovoEvento({
                        title: '',
                        start: '',
                        end: '',
                        desc: '',
                        color: '',
                        tipo: '',
                    });
                    navigate('/paginicial');
                } else {
                    setMensagemErro(data.message || 'Falha ao adicionar consulta');
                }
            } catch (error) {
                setMensagemErro('Ocorreu um erro. Tente novamente.');
            }
        }
    };

    return (
        <div className="adicionar p-3 rounded border border-white" style={{ backgroundColor: '#e9ecef', color: '#212529' }}>
            <h3>Nova consulta</h3>
            {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicTitle">
                    <Form.Label>Título do Evento</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nome do Paciente"
                        name="title"
                        value={novoEvento.title}
                        onChange={handleChange}
                    />
                </Form.Group>
                <Row>
                    <Col xs={6}>
                        <Form.Group controlId="formBasicStart">
                            <Form.Label>Início</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="start"
                                value={novoEvento.start}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={6}>
                        <Form.Group controlId="formBasicEnd">
                            <Form.Label>Término</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="end"
                                value={novoEvento.end}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Collapse in={expanded}>
                    <div>
                        <Form.Group controlId="formBasicDesc">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite a Descrição"
                                name="desc"
                                value={novoEvento.desc}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Row>
                            <Col xs={3}>
                                <Form.Group controlId="formBasicColor">
                                    <Form.Label>Cor</Form.Label>
                                    <Form.Control
                                        type="color"
                                        name="color"
                                        value={novoEvento.color}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={9}>
                                <Form.Group controlId="formBasicTipo">
                                    <Form.Label>Especialidade</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Digite a especialidade"
                                        name="tipo"
                                        value={novoEvento.tipo}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Collapse>
                <Button
                    variant="primary"
                    type="button"
                    onClick={handleToggleExpanded}
                    style={{ marginTop: '10px', float: 'right' }}
                >
                    {expanded ? <i className="bi bi-chevron-double-up"></i> : <i className="bi bi-chevron-double-down"></i>}
                </Button>
                <Button
                    variant="success"
                    type="submit"
                    style={{ marginTop: '10px', marginRight: '10px' }}
                    disabled={!novoEvento.title || !novoEvento.start || !novoEvento.end}
                >
                    Salvar
                </Button>
            </Form>
        </div>
    );
}

export default Adicionar;
