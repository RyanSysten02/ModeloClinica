import React, { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormularioPaciente from '../../paciente/Paciente';
import ListaPacientesModal from '../../paciente/ListaPacientes';

function Adicionar({ onAdicionar }) {
    const [novoEvento, setNovoEvento] = useState({
        title: '',
        start: '',
        end: '',
        desc: '',
        tipo: '',
    });
    const [mensagemErro, setMensagemErro] = useState('');
    const [showPacienteModal, setShowPacienteModal] = useState(false);
    const [showListaPacientesModal, setShowListaPacientesModal] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "start") {
            const startDate = new Date(value); // Convertendo a string para Date
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Adiciona 1 hora
    
            setNovoEvento({
                ...novoEvento,
                start: value,
                end: endDate.toISOString().slice(0, 16), // Formato para datetime-local
            });
        } else {
            setNovoEvento({ ...novoEvento, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro('');

        if (novoEvento.title && novoEvento.start) {
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
                    onAdicionar(novoEvento); // Chama a função para atualizar o calendário
                    setNovoEvento({
                        title: '',
                        start: '',
                        end: '',
                        desc: '',
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

    const handleSelectPaciente = (paciente) => {
        setNovoEvento({ ...novoEvento, title: paciente.nome });
        setShowListaPacientesModal(false);
    };

    return (
        <div className="adicionar p-3 rounded border border-white" style={{ backgroundColor: '#e9ecef', color: '#212529', width: '100%' }}>
            <h3>Nova Consulta</h3>
            {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
            <Form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
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
                <Button
                    variant="success"
                    type="submit"
                    className="w-100"
                    disabled={!novoEvento.title || !novoEvento.start}
                >
                    Salvar
                </Button>
                <Button
                    variant="info"
                    type="button"
                    className="w-100"
                    onClick={() => setShowPacienteModal(true)}
                    style={{ marginTop: '10px', marginRight: '10px' }}
                >
                    Cadastrar Paciente
                </Button>
            </Form>
            <FormularioPaciente show={showPacienteModal} onHide={() => setShowPacienteModal(false)} />
            <ListaPacientesModal show={showListaPacientesModal} onHide={() => setShowListaPacientesModal(false)} onSelectPaciente={handleSelectPaciente} />
        </div>
    );
}

export default Adicionar;
