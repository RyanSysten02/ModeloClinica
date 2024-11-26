import React, { useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ListaPacientesModal from '../../paciente/ListaPacientes';

function Adicionar({ show, onHide, onUpdate }) {
    const [novoEvento, setNovoEvento] = useState({
        title: '',
        start: '',
        end: '',
        desc: '',
        tipo: '',
    });
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [showListaPacientesModal, setShowListaPacientesModal] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'start') {
            const startDate = new Date(value);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            const timezoneOffset = startDate.getTimezoneOffset() * 60000;
            const adjustedStartDate = new Date(startDate.getTime() - timezoneOffset);
            const adjustedEndDate = new Date(endDate.getTime() - timezoneOffset);

            setNovoEvento({
                ...novoEvento,
                start: adjustedStartDate.toISOString().slice(0, 16),
                end: adjustedEndDate.toISOString().slice(0, 16),
            });
        } else {
            setNovoEvento({ ...novoEvento, [name]: value });
        }
    };

    const handleSelectPaciente = (paciente) => {
        setNovoEvento({ ...novoEvento, title: paciente.nome });
        setShowListaPacientesModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro('');
        setMensagemSucesso('');

        try {
            if (novoEvento.title && novoEvento.start) {
                const startDate = new Date(novoEvento.start);
                const endDate = new Date(novoEvento.end);

                if (startDate >= endDate) {
                    alert('A data início deve ser anterior à data de término');
                    return;
                }

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
                    setMensagemSucesso('Consulta adicionada com sucesso!');
                    setNovoEvento({
                        title: '',
                        start: '',
                        end: '',
                        desc: '',
                        tipo: '',
                    });

                    // Lógica de atualização do calendário
                    if (onUpdate) {
                        onUpdate();
                    }

                    onHide(); // Fechar o modal após sucesso
                } else {
                    setMensagemErro(data.message || 'Falha ao adicionar consulta');
                }
            }
        } catch (error) {
            setMensagemErro('Ocorreu um erro inesperado. Verifique os dados e tente novamente.');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nova Consulta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
                {mensagemSucesso && <Alert variant="success">{mensagemSucesso}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicTitle" className="mb-3">
                    <Form.Label>Buscar Paciente</Form.Label>
                    <div className="d-flex align-items-center">
                        <Form.Control
                            type="text"
                            placeholder="Digite o nome do paciente"
                            name="title"
                            value={novoEvento.title}
                            onChange={handleChange}
                            style={{ flex: 1 }}
                        />
                        <Button
                            variant="secondary"
                            onClick={() => setShowListaPacientesModal(true)}
                            className="ms-2"
                        >
                            <i className="bi bi-search"></i>
                        </Button>
                        </div>
                    </Form.Group>
                    <Form.Group controlId="formBasicStart" className="mb-3">
                        <Form.Label>Início</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="start"
                            value={novoEvento.start}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formBasicTipo" className="mb-3">
                        <Form.Label>Especialidade</Form.Label>
                        <Form.Select
                            name="tipo"
                            value={novoEvento.tipo}
                            onChange={handleChange}
                        >
                            <option value="">Selecione uma especialidade</option>
                            <option value="Cardiologia">Cardiologia</option>
                            <option value="Dermatologia">Dermatologia</option>
                            <option value="Ginecologia">Ginecologia</option>
                            <option value="Neurologia">Neurologia</option>
                            <option value="Ortopedia">Ortopedia</option>
                            <option value="Pediatria">Pediatria</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="formBasicDesc" className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite a descrição"
                            name="desc"
                            value={novoEvento.desc}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Button variant="success" type="submit" className="w-100">
                        Salvar
                    </Button>
                </Form>
                <ListaPacientesModal show={showListaPacientesModal} onHide={() => setShowListaPacientesModal(false)} onSelectPaciente={handleSelectPaciente} />
            </Modal.Body>
        </Modal>
    );
}

export default Adicionar;
