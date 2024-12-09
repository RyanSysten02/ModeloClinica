import React, { useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ListaPacientesModal from '../../paciente/ListaPacientes';
import ListaFuncionariosModal from '../../funcionario/ListaFuncionarios';

function Adicionar({ show, onHide, onUpdate }) {
    const [novoEvento, setNovoEvento] = useState({
        id_paciente: '',
        pacienteNome: '', // Nome do paciente para exibição
        id_func_responsavel: '',
        funcionarioNome: '',
        start:'',
        end: '',
        desc: '',
        tipo: '',
    });
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [showListaPacientesModal, setShowListaPacientesModal] = useState(false);
    const [showListaFuncionariosModal, setShowListaFuncionariosModal] = useState(false);
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
        setNovoEvento({
            ...novoEvento,
            id_paciente: paciente.id,
            pacienteNome: paciente.nome, // Para exibição
        });
        setShowListaPacientesModal(false);
    };
    const handleSelectFuncionario = (funcionario) => {
        setNovoEvento({
            ...novoEvento,
            id_func_responsavel: funcionario.id,
            funcionarioNome: funcionario.nome, // Para exibição
        });
        setShowListaFuncionariosModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagemErro('');
        setMensagemSucesso('');

        try {
            if (novoEvento.id_paciente && novoEvento.start) {
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
                        id_paciente: '',
                        id_func_responsavel:'',
                        start: '',
                        end: '',
                        desc: '',
                        tipo: '',
                    });

                    // Lógica de atualização do calendário
                    if (onUpdate) {
                        onUpdate(novoEvento);
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
                <Form.Group controlId="formBasicPaciente" className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Selecione um paciente"
                        name="pacienteNome"
                        value={novoEvento.pacienteNome} // Exibe o nome do paciente
                        readOnly // Torna o campo não editável
                        style={{ flex: 1, backgroundColor: '#e9ecef' }} // Estilo para indicar que está desabilitado
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
                    <Form.Group controlId="formBasicFuncionario" className="mb-3">
                <Form.Label>Funcionário Responsável</Form.Label>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Selecione o funcionário responsável"
                        name="funcionarioNome"
                        value={novoEvento.funcionarioNome} // Exibe o nome do funcionário
                        readOnly // Torna o campo não editável
                        style={{ flex: 1, backgroundColor: '#e9ecef' }} // Estilo para indicar que está desabilitado
                    />
                        <Button
                            variant="secondary"
                            onClick={() => setShowListaFuncionariosModal(true)}
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
                <ListaFuncionariosModal show={showListaFuncionariosModal} onHide={() => setShowListaFuncionariosModal(false)} onSelectFuncionario={handleSelectFuncionario} />
            </Modal.Body>
        </Modal>
    );
}

export default Adicionar;
